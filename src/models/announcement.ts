import mongoose, { model, Schema, type Model, type Types } from "mongoose";

export type AnnouncementAudience = "all" | "secretary" | "marketing" | "developer" | "tester";

export interface AnnouncementDoc {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  pinned: boolean;
  authorId: Types.ObjectId;
  retiredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const announcementSchema = new Schema<AnnouncementDoc, Model<AnnouncementDoc>>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ["all", "secretary", "marketing", "developer", "tester"],
      default: "all",
    },
    pinned: { type: Boolean, default: false },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    retiredAt: Date,
  },
  { timestamps: true },
);

announcementSchema.index({ pinned: -1, createdAt: -1 });

const Announcement =
  (mongoose.models.Announcement as Model<AnnouncementDoc>) ||
  model<AnnouncementDoc>("Announcement", announcementSchema);
export default Announcement;
