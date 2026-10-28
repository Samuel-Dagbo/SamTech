import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import type { SessionUser } from "@/lib/auth/session";
import type { Department } from "@/lib/auth/rbac";
import Announcement, { type AnnouncementDoc, type AnnouncementAudience } from "@/models/announcement";
import User from "@/models/user";

export type AnnouncementView = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  pinned: boolean;
  retired: boolean;
  authorId: string;
  authorName?: string;
  createdAt?: Date;
};

export type AnnouncementActionContext = {
  actor: SessionUser;
  ip?: string;
  userAgent?: string;
};

type AnnouncementActionResult = { ok: boolean; message: string };

function serialize(
  doc: AnnouncementDoc & { _id: mongoose.Types.ObjectId },
  names: Map<string, string>,
): AnnouncementView {
  return {
    id: String(doc._id),
    title: doc.title,
    body: doc.body,
    audience: doc.audience,
    pinned: doc.pinned,
    retired: Boolean(doc.retiredAt),
    authorId: String(doc.authorId),
    authorName: names.get(String(doc.authorId)),
    createdAt: doc.createdAt,
  };
}

export async function listAnnouncements(viewer: {
  role: SessionUser["role"];
  department?: Department;
  manage: boolean;
}): Promise<AnnouncementView[]> {
  await connectDB();
  const baseQuery = viewer.manage
    ? {}
    : {
        retiredAt: { $exists: false },
        $or: [
          { audience: "all" as AnnouncementAudience },
          ...(viewer.department ? [{ audience: viewer.department as AnnouncementAudience }] : []),
        ],
      };
  const docs = await Announcement.find(baseQuery)
    .sort({ pinned: -1, createdAt: -1 })
    .limit(200)
    .lean<(AnnouncementDoc & { _id: mongoose.Types.ObjectId })[]>();
  const authorIds = docs.map((doc) => String(doc.authorId));
  const names = new Map<string, string>();
  if (authorIds.length) {
    const authors = await User.find({ _id: { $in: Array.from(new Set(authorIds)) } })
      .select("name")
      .lean<{ _id: mongoose.Types.ObjectId; name: string }[]>();
    for (const author of authors) names.set(String(author._id), author.name);
  }
  return docs.map((doc) => serialize(doc, names));
}

export async function createAnnouncement(
  input: { title: string; body: string; audience?: string; pinned?: boolean },
  ctx: AnnouncementActionContext,
): Promise<AnnouncementActionResult> {
  await connectDB();
  const audience = (["all", "secretary", "marketing", "developer", "tester"] as const).includes(
    input.audience as AnnouncementAudience,
  )
    ? (input.audience as AnnouncementAudience)
    : "all";

  await Announcement.create({
    title: input.title,
    body: input.body,
    audience,
    pinned: input.pinned ?? false,
    authorId: new mongoose.Types.ObjectId(ctx.actor.id),
  });

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "announcements.created",
    targetType: "announcement",
    metadata: { title: input.title, audience },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: "Announcement posted." };
}

export async function announcementAction(
  announcementId: string,
  action:
    | { action: "set-pin"; pinned: boolean }
    | { action: "retire" }
    | { action: "restore" }
    | { action: "delete" },
  ctx: AnnouncementActionContext,
): Promise<AnnouncementActionResult> {
  await connectDB();
  const announcement = await Announcement.findById(announcementId);
  if (!announcement) return { ok: false, message: "Announcement not found." };

  if (action.action === "delete") {
    await announcement.deleteOne();
    await recordAudit({
      actorId: ctx.actor.id,
      actorEmail: ctx.actor.email,
      action: "announcements.deleted",
      targetType: "announcement",
      targetId: announcementId,
      metadata: { title: announcement.title },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    return { ok: true, message: "Announcement deleted." };
  }

  if (action.action === "set-pin") {
    announcement.pinned = action.pinned;
  } else if (action.action === "retire") {
    announcement.retiredAt = new Date();
  } else {
    announcement.retiredAt = undefined;
  }
  await announcement.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: `announcements.${action.action}`,
    targetType: "announcement",
    targetId: announcementId,
    metadata: { title: announcement.title },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return {
    ok: true,
    message:
      action.action === "set-pin"
        ? action.pinned
          ? "Announcement pinned."
          : "Announcement unpinned."
        : action.action === "retire"
          ? "Announcement retired."
          : "Announcement restored.",
  };
}
