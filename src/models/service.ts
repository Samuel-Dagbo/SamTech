import mongoose, { model, Schema, type Model } from "mongoose";

export interface ServiceDoc {
  title: string;
  copy: string;
  slug?: string;
  benefits?: string[];
  technologies?: string[];
  image?: string;
  published?: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ServiceModel = Model<ServiceDoc>;

const serviceSchema = new Schema<ServiceDoc, ServiceModel>(
  {
    title: { type: String, default: "" },
    copy: { type: String, default: "" },
    slug: { type: String, default: "", trim: true, lowercase: true },
    benefits: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    image: { type: String, default: "" },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default (mongoose.models.Service as ServiceModel | undefined) ??
  model<ServiceDoc, ServiceModel>("Service", serviceSchema);
