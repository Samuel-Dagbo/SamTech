import mongoose, { model, Schema, type Model } from "mongoose";

export interface TestimonialDoc {
  name: string;
  company: string;
  quote: string;
  image?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type TestimonialModel = Model<TestimonialDoc>;

const testimonialSchema = new Schema<TestimonialDoc, TestimonialModel>(
  {
    name: { type: String, default: "" },
    company: { type: String, default: "" },
    quote: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default (mongoose.models.Testimonial as TestimonialModel | undefined) ??
  model<TestimonialDoc, TestimonialModel>("Testimonial", testimonialSchema);
