import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import type { SessionUser } from "@/lib/auth/session";
import ContactMessage, { type ContactMessageDoc } from "@/models/contact-message";

export type MessageView = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  phone?: string;
  message: string;
  status: ContactMessageDoc["status"];
  repliedAt?: Date;
  createdAt?: Date;
};

export type MessageActionContext = {
  actor: SessionUser;
  ip?: string;
  userAgent?: string;
};

export async function listMessages(): Promise<MessageView[]> {
  await connectDB();
  const docs = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<(ContactMessageDoc & { _id: mongoose.Types.ObjectId })[]>();
  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    subject: doc.subject || undefined,
    phone: doc.phone || undefined,
    message: doc.message,
    status: doc.status,
    repliedAt: doc.repliedAt,
    createdAt: doc.createdAt,
  }));
}

export async function messageAction(
  messageId: string,
  action: "mark-read" | "mark-replied" | "archive" | "delete",
  ctx: MessageActionContext,
): Promise<{ ok: boolean; message: string }> {
  await connectDB();
  const doc = await ContactMessage.findById(messageId);
  if (!doc) return { ok: false, message: "Message not found." };

  if (action === "delete") {
    await doc.deleteOne();
    await recordAudit({
      actorId: ctx.actor.id,
      actorEmail: ctx.actor.email,
      action: "messages.deleted",
      targetType: "contact_message",
      targetId: messageId,
      metadata: { from: doc.email, subject: doc.subject ?? "" },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    return { ok: true, message: "Message deleted." };
  }

  if (action === "mark-read") doc.status = "read";
  if (action === "mark-replied") {
    doc.status = "replied";
    doc.repliedAt = new Date();
  }
  if (action === "archive") doc.status = "archived";
  await doc.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: `messages.${action}`,
    targetType: "contact_message",
    targetId: messageId,
    metadata: { from: doc.email, subject: doc.subject ?? "" },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return {
    ok: true,
    message:
      action === "mark-read"
        ? "Marked as read."
        : action === "mark-replied"
          ? "Marked as replied."
          : "Archived.",
  };
}
