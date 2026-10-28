import "server-only";
import mongoose from "mongoose";
import { connectDB } from "./db";
import AuditLog, { type AuditLogDoc } from "@/models/audit-log";

export type AuditEntry = {
  actorId?: string;
  actorEmail?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

/**
 * Fire-and-forget audit recording. Never throws into the caller's flow and
 * never stores credentials, tokens or raw cookies — callers pass metadata.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await connectDB();
    const doc: Partial<AuditLogDoc> = {
      action: entry.action,
      metadata: entry.metadata,
      ip: entry.ip,
      userAgent: entry.userAgent?.slice(0, 300),
    };
    if (entry.actorId) doc.actorId = new mongoose.Types.ObjectId(entry.actorId);
    if (entry.actorEmail) doc.actorEmail = entry.actorEmail;
    if (entry.targetType) doc.targetType = entry.targetType;
    if (entry.targetId) doc.targetId = entry.targetId;
    await AuditLog.create(doc);
  } catch (error) {
    console.error(
      "[audit] failed to record entry:",
      error instanceof Error ? error.message : error,
    );
  }
}
