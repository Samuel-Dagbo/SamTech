import mongoose, { model, Schema, type Model } from "mongoose";

export interface PasswordResetDoc {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  emailSentAt?: Date;
  emailError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type PasswordResetModel = Model<PasswordResetDoc>;

// TTL index cleans up consumed/expired records after 7 days; the window keeps
// recent records available for audit-style inspection of delivery outcomes.
const passwordResetSchema = new Schema<PasswordResetDoc, PasswordResetModel>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: Date,
    emailSentAt: Date,
    emailError: String,
  },
  { timestamps: true },
);

passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default (mongoose.models.PasswordReset as PasswordResetModel | undefined) ??
  model<PasswordResetDoc, PasswordResetModel>("PasswordReset", passwordResetSchema);
