import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import type { SessionUser } from "@/lib/auth/session";
import Resource, { type ResourceDoc } from "@/models/resource";
import MarketingEntry, { type MarketingEntryDoc, type MarketingStatus } from "@/models/marketing-entry";
import User from "@/models/user";

export type ResourceView = {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  addedByName?: string;
  createdAt?: Date;
};

export type MarketingView = {
  id: string;
  title: string;
  channel: string;
  plannedFor?: string;
  notes?: string;
  status: MarketingStatus;
  createdByName?: string;
  createdAt?: Date;
};

type SharedContext = {
  actor: SessionUser;
  ip?: string;
  userAgent?: string;
};

const RESOURCE_LABELS: Record<string, string> = {
  client_brief: "Client brief",
  brand_asset: "Brand asset",
  template: "Template",
  guide: "Guide",
  other: "Other",
};

async function loadNames(ids: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return new Map();
  const docs = await User.find({ _id: { $in: unique } })
    .select("name")
    .lean<{ _id: mongoose.Types.ObjectId; name: string }[]>();
  return new Map(docs.map((doc) => [String(doc._id), doc.name]));
}

export async function listResources(): Promise<ResourceView[]> {
  await connectDB();
  const docs = await Resource.find()
    .sort({ category: 1, createdAt: -1 })
    .limit(300)
    .lean<(ResourceDoc & { _id: mongoose.Types.ObjectId })[]>();
  const names = await loadNames(docs.map((doc) => String(doc.addedById)));
  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    description: doc.description || undefined,
    url: doc.url,
    category: RESOURCE_LABELS[doc.category] ?? doc.category,
    addedByName: names.get(String(doc.addedById)),
    createdAt: doc.createdAt,
  }));
}

export async function createResource(
  input: { title: string; description?: string; url: string; category?: string },
  ctx: SharedContext,
): Promise<{ ok: boolean; message: string }> {
  await connectDB();
  const category = (["client_brief", "brand_asset", "template", "guide", "other"] as const).includes(
    input.category as never,
  )
    ? (input.category as "client_brief" | "brand_asset" | "template" | "guide" | "other")
    : "other";

  await Resource.create({
    title: input.title,
    description: input.description || undefined,
    url: input.url,
    category,
    addedById: new mongoose.Types.ObjectId(ctx.actor.id),
  });

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "resources.created",
    targetType: "resource",
    metadata: { title: input.title, category },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: "Resource added." };
}

export async function deleteResource(resourceId: string, ctx: SharedContext): Promise<{ ok: boolean; message: string }> {
  await connectDB();
  const doc = await Resource.findById(resourceId);
  if (!doc) return { ok: false, message: "Resource not found." };
  await doc.deleteOne();
  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "resources.deleted",
    targetType: "resource",
    targetId: resourceId,
    metadata: { title: doc.title },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: "Resource deleted." };
}

export async function listMarketing(): Promise<MarketingView[]> {
  await connectDB();
  const docs = await MarketingEntry.find()
    .sort({ plannedFor: 1, createdAt: -1 })
    .limit(300)
    .lean<(MarketingEntryDoc & { _id: mongoose.Types.ObjectId })[]>();
  const names = await loadNames(docs.map((doc) => String(doc.createdById)));
  return docs.map((doc) => ({
    id: String(doc._id),
    title: doc.title,
    channel: doc.channel,
    plannedFor: doc.plannedFor ? doc.plannedFor.toISOString() : undefined,
    notes: doc.notes || undefined,
    status: doc.status,
    createdByName: names.get(String(doc.createdById)),
    createdAt: doc.createdAt,
  }));
}

export async function createMarketingEntry(
  input: { title: string; channel?: string; plannedFor?: string; notes?: string },
  ctx: SharedContext,
): Promise<{ ok: boolean; message: string }> {
  await connectDB();
  const channel = (["whatsapp", "linkedin", "x", "instagram", "email", "blog", "other"] as const).includes(
    input.channel as never,
  )
    ? (input.channel as "whatsapp" | "linkedin" | "x" | "instagram" | "email" | "blog" | "other")
    : "other";

  const plannedFor = input.plannedFor ? new Date(`${input.plannedFor}T12:00:00.000Z`) : undefined;
  if (plannedFor && Number.isNaN(plannedFor.getTime())) {
    return { ok: false, message: "Invalid date." };
  }

  await MarketingEntry.create({
    title: input.title,
    channel,
    plannedFor,
    notes: input.notes || undefined,
    status: "planned",
    createdById: new mongoose.Types.ObjectId(ctx.actor.id),
  });

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "marketing.created",
    targetType: "marketing_entry",
    metadata: { title: input.title, channel, plannedFor: input.plannedFor ?? null },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: "Marketing entry planned." };
}

export async function marketingAction(
  entryId: string,
  action: { action: "set-status"; status: MarketingStatus } | { action: "delete" },
  ctx: SharedContext,
): Promise<{ ok: boolean; message: string }> {
  await connectDB();
  const doc = await MarketingEntry.findById(entryId);
  if (!doc) return { ok: false, message: "Entry not found." };

  if (action.action === "delete") {
    await doc.deleteOne();
    await recordAudit({
      actorId: ctx.actor.id,
      actorEmail: ctx.actor.email,
      action: "marketing.deleted",
      targetType: "marketing_entry",
      targetId: entryId,
      metadata: { title: doc.title },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    return { ok: true, message: "Entry deleted." };
  }

  const previous = doc.status;
  doc.status = action.status;
  doc.publishedAt = action.status === "published" ? new Date() : undefined;
  await doc.save();
  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "marketing.status_changed",
    targetType: "marketing_entry",
    targetId: entryId,
    metadata: { title: doc.title, from: previous, to: action.status },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: `Entry marked ${action.status.replace("_", " ")}.` };
}
