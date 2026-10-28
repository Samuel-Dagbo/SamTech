import mongoose, { model, Schema, type Model } from "mongoose";

export type ContactMessageStatus = "new" | "read" | "replied" | "archived";

export interface ContactMessageDoc {
  name: string;
  email: string;
  subject?: string;
  phone?: string;
  message: string;
  source: string;
  status: ContactMessageStatus;
  repliedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type ContactMessageModel = Model<ContactMessageDoc>;

const contactMessageSchema = new Schema<ContactMessageDoc, ContactMessageModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: "" },
    phone: { type: String },
    message: { type: String, required: true },
    source: { type: String, default: "website" },
    status: { type: String, enum: ["new", "read", "replied", "archived"], default: "new" },
    repliedAt: Date,
  },
  { timestamps: true },
);

export default (mongoose.models.ContactMessage as ContactMessageModel | undefined) ??
  model<ContactMessageDoc, ContactMessageModel>("ContactMessage", contactMessageSchema);
