import mongoose, { model, Schema, type Model } from "mongoose";

export interface AuditLogDoc {
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type AuditLogModel = Model<AuditLogDoc>;

// Append-only by convention: application code never updates or deletes
// entries. Queries read most-recent-first.
const auditLogSchema = new Schema<AuditLogDoc, AuditLogModel>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorEmail: String,
    action: { type: String, required: true },
    targetType: String,
    targetId: String,
    metadata: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default (mongoose.models.AuditLog as AuditLogModel | undefined) ??
  model<AuditLogDoc, AuditLogModel>("AuditLog", auditLogSchema);
