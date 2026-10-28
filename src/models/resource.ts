import mongoose, { model, Schema, type Model, type Types } from "mongoose";

export type ResourceCategory = "client_brief" | "brand_asset" | "template" | "guide" | "other";

export interface ResourceDoc {
  title: string;
  description?: string;
  url: string;
  category: ResourceCategory;
  addedById: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const resourceSchema = new Schema<ResourceDoc, Model<ResourceDoc>>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    url: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["client_brief", "brand_asset", "template", "guide", "other"],
      default: "other",
    },
    addedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

resourceSchema.index({ category: 1, createdAt: -1 });

const Resource =
  (mongoose.models.Resource as Model<ResourceDoc>) || model<ResourceDoc>("Resource", resourceSchema);
export default Resource;
