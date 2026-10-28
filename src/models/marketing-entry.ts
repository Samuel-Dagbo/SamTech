import mongoose, { model, Schema, type Model, type Types } from "mongoose";

export type MarketingChannel = "whatsapp" | "linkedin" | "x" | "instagram" | "email" | "blog" | "other";
export type MarketingStatus = "planned" | "in_progress" | "published" | "cancelled";

export interface MarketingEntryDoc {
  title: string;
  channel: MarketingChannel;
  plannedFor?: Date;
  notes?: string;
  status: MarketingStatus;
  createdById: Types.ObjectId;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const marketingEntrySchema = new Schema<MarketingEntryDoc, Model<MarketingEntryDoc>>(
  {
    title: { type: String, required: true, trim: true },
    channel: {
      type: String,
      enum: ["whatsapp", "linkedin", "x", "instagram", "email", "blog", "other"],
      default: "other",
    },
    plannedFor: Date,
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["planned", "in_progress", "published", "cancelled"],
      default: "planned",
    },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: Date,
  },
  { timestamps: true },
);

marketingEntrySchema.index({ plannedFor: 1, status: 1 });

const MarketingEntry =
  (mongoose.models.MarketingEntry as Model<MarketingEntryDoc>) ||
  model<MarketingEntryDoc>("MarketingEntry", marketingEntrySchema);
export default MarketingEntry;
