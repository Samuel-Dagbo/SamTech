import mongoose, { model, Schema, type Model } from "mongoose";

export type UserRole = "founder" | "team_member";
export type UserStatus = "active" | "suspended";

export interface UserDoc {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  title?: string;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserModel = Model<UserDoc>;

const userSchema = new Schema<UserDoc, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // New collection (additive): the unique index is safe to create.
      unique: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["founder", "team_member"], default: "team_member" },
    title: { type: String, trim: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export default (mongoose.models.User as UserModel | undefined) ??
  model<UserDoc, UserModel>("User", userSchema);
