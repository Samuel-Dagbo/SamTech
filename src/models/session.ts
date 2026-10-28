import mongoose, { model, Schema, type Model } from "mongoose";

export interface SessionDoc {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type SessionModel = Model<SessionDoc>;

const sessionSchema = new Schema<SessionDoc, SessionModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // HMAC-SHA256 of the raw cookie token; the raw token is never stored.
    tokenHash: { type: String, required: true, unique: true },
    // TTL index: MongoDB deletes expired sessions automatically.
    expiresAt: { type: Date, required: true, expires: 0 },
    revokedAt: Date,
    ip: String,
    userAgent: String,
  },
  { timestamps: true },
);

export default (mongoose.models.Session as SessionModel | undefined) ??
  model<SessionDoc, SessionModel>("Session", sessionSchema);
