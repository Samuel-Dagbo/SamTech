import mongoose, { model, Schema, type Model } from "mongoose";

export interface ProfileDoc {
  name: string;
  role: string;
  tagline: string;
  intro: string;
  heroImage?: string;
  contactImage?: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  aboutTitle?: string;
  aboutIntro?: string;
  aboutImage?: string;
  aboutGallery?: string[];
  aboutName?: string;
  aboutEducation?: string;
  aboutJourneyTitle?: string;
  aboutJourneyBody?: string;
  aboutInspirationTitle?: string;
  aboutInspirationBody?: string;
  aboutWhoTitle?: string;
  aboutWhoBody?: string;
  aboutStackTitle?: string;
  aboutStackBody?: string;
  aboutApproachTitle?: string;
  aboutApproachBody?: string;
  techStack?: string[];
  experienceTimeline?: TimelineSubdoc[];
  faqItems?: FaqSubdoc[];
  brands?: string[];
  location?: string;
  yearsExperience?: string;
  availability?: string;
  whatsapp?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TimelineSubdoc {
  period?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface FaqSubdoc {
  question?: string;
  answer?: string;
}

type ProfileModel = Model<ProfileDoc>;

const profileSchema = new Schema<ProfileDoc, ProfileModel>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    tagline: { type: String, required: true },
    intro: { type: String, required: true },
    heroImage: String,
    contactImage: String,
    resumeUrl: String,
    githubUrl: String,
    linkedinUrl: String,
    xUrl: String,
    aboutTitle: String,
    aboutIntro: String,
    aboutImage: String,
    aboutGallery: { type: [String], default: [] },
    aboutName: String,
    aboutEducation: String,
    aboutJourneyTitle: String,
    aboutJourneyBody: String,
    aboutInspirationTitle: String,
    aboutInspirationBody: String,
    aboutWhoTitle: String,
    aboutWhoBody: String,
    aboutStackTitle: String,
    aboutStackBody: String,
    aboutApproachTitle: String,
    aboutApproachBody: String,
    techStack: { type: [String], default: [] },
    experienceTimeline: {
      type: [
        {
          period: { type: String, default: "" },
          title: { type: String, default: "" },
          subtitle: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },
    faqItems: {
      type: [
        {
          question: { type: String, default: "" },
          answer: { type: String, default: "" },
        },
      ],
      default: [],
    },
    brands: { type: [String], default: [] },
    location: String,
    yearsExperience: String,
    availability: String,
    whatsapp: String,
    email: String,
  },
  { timestamps: true },
);

export default (mongoose.models.Profile as ProfileModel | undefined) ??
  model<ProfileDoc, ProfileModel>("Profile", profileSchema);
