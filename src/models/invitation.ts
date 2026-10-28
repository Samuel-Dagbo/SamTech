import mongoose, { model, Schema, type Model } from "mongoose";

export type InvitationStatus = "pending" | "accepted" | "revoked";

export interface InvitationDoc {
  email: string;
  name: string;
  title?: string;
  role: "founder" | "team_member";
  department?: "secretary" | "marketing" | "developer" | "tester";
  scopes?: string[];
  status: InvitationStatus;
  tokenHash: string;
  invitedBy?: mongoose.Types.ObjectId;
  welcomeMessage?: string;
  expiresAt: Date;
  acceptedAt?: Date;
  emailSentAt?: Date;
  emailError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type InvitationModel = Model<InvitationDoc>;

const invitationSchema = new Schema<InvitationDoc, InvitationModel>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    role: { type: String, enum: ["founder", "team_member"], required: true },
    department: {
      type: String,
      enum: ["secretary", "marketing", "developer", "tester"],
      default: undefined,
    },
    scopes: { type: [String], default: [] },
    status: { type: String, enum: ["pending", "accepted", "revoked"], default: "pending" },
    // HMAC-SHA256 of the raw token; the raw token never touches the database.
    tokenHash: { type: String, required: true, unique: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    welcomeMessage: { type: String, trim: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: Date,
    emailSentAt: Date,
    emailError: String,
  },
  { timestamps: true },
);

// Status lookups for the team dashboard.
invitationSchema.index({ status: 1, createdAt: -1 });
invitationSchema.index({ email: 1 });

export default (mongoose.models.Invitation as InvitationModel | undefined) ??
  model<InvitationDoc, InvitationModel>("Invitation", invitationSchema);
