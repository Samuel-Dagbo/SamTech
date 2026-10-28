import mongoose, { model, Schema, type Model } from "mongoose";

export interface ServiceDoc {
  title: string;
  copy: string;
  image?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ServiceModel = Model<ServiceDoc>;

const serviceSchema = new Schema<ServiceDoc, ServiceModel>(
  {
    title: { type: String, default: "" },
    copy: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default (mongoose.models.Service as ServiceModel | undefined) ??
  model<ServiceDoc, ServiceModel>("Service", serviceSchema);
