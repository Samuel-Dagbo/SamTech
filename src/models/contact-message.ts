import mongoose, { model, Schema, type Model } from "mongoose";

export type ContactMessageStatus = "new" | "read" | "archived";

export interface ContactMessageDoc {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  status: ContactMessageStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

type ContactMessageModel = Model<ContactMessageDoc>;

const contactMessageSchema = new Schema<ContactMessageDoc, ContactMessageModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    source: { type: String, default: "website" },
    status: { type: String, enum: ["new", "read", "archived"], default: "new" },
  },
  { timestamps: true },
);

export default (mongoose.models.ContactMessage as ContactMessageModel | undefined) ??
  model<ContactMessageDoc, ContactMessageModel>("ContactMessage", contactMessageSchema);
