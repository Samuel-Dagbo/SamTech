import mongoose, { model, Schema, type Model } from "mongoose";

export interface MetricSubdoc {
  label?: string;
  value?: string;
}

export interface ProjectDoc {
  title: string;
  slug: string;
  category?: string;
  summary?: string;
  stack?: string[];
  image?: string;
  screenshots?: string[];
  problem?: string;
  solution?: string;
  result?: string;
  caseStudyBody?: string;
  metrics?: MetricSubdoc[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProjectModel = Model<ProjectDoc>;

// NOTE: intentionally no unique index on `slug` — legacy documents may contain
// duplicates and the migration plan (docs/MODERNIZATION-PLAN.md §6) forbids
// schema-destructive changes before a duplicate scan + backup.
const projectSchema = new Schema<ProjectDoc, ProjectModel>(
  {
    title: { type: String, default: "" },
    slug: { type: String, default: "", trim: true },
    category: { type: String, default: "" },
    summary: { type: String, default: "" },
    stack: { type: [String], default: [] },
    image: { type: String, default: "" },
    screenshots: { type: [String], default: [] },
    problem: { type: String, default: "" },
    solution: { type: String, default: "" },
    result: { type: String, default: "" },
    caseStudyBody: { type: String, default: "" },
    metrics: {
      type: [
        {
          label: { type: String, default: "" },
          value: { type: String, default: "" },
        },
      ],
      default: [],
    },
    liveUrl: { type: String, default: "" },
    repoUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default (mongoose.models.Project as ProjectModel | undefined) ??
  model<ProjectDoc, ProjectModel>("Project", projectSchema);
