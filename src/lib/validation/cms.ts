import { z } from "zod";

const idField = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id")
  .optional()
  .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .max(600)
  .refine((value) => value === "" || /^https?:\/\//i.test(value), "Must be an http(s) URL")
  .optional()
  .or(z.literal(""));

const lines = z
  .string()
  .max(4000)
  .optional()
  .or(z.literal(""));

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const projectCmsSchema = z.object({
  id: idField,
  title: z.string().trim().min(2, "Please add a project title").max(160),
  slug: z.string().trim().max(160).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  summary: z.string().trim().max(600).optional().or(z.literal("")),
  problem: z.string().trim().max(4000).optional().or(z.literal("")),
  solution: z.string().trim().max(4000).optional().or(z.literal("")),
  result: z.string().trim().max(4000).optional().or(z.literal("")),
  stack: lines,
  image: optionalUrl,
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export const serviceCmsSchema = z.object({
  id: idField,
  title: z.string().trim().min(2, "Please add a service title").max(160),
  slug: z.string().trim().max(160).optional().or(z.literal("")),
  copy: z.string().trim().max(2000).optional().or(z.literal("")),
  benefits: lines,
  technologies: lines,
  image: optionalUrl,
  published: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export const testimonialCmsSchema = z.object({
  id: idField,
  name: z.string().trim().min(2, "Please add the client name").max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  quote: z.string().trim().min(10, "Please write the quote").max(1500),
  image: optionalUrl,
  published: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export const profileCmsSchema = z.object({
  name: z.string().trim().min(2, "Please add your name").max(120),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  intro: z.string().trim().max(2000).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  availability: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.email("Please enter a valid email address").optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  resumeUrl: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  xUrl: optionalUrl,
  heroImage: optionalUrl,
  contactImage: optionalUrl,
  aboutTitle: z.string().trim().max(160).optional().or(z.literal("")),
  aboutIntro: z.string().trim().max(3000).optional().or(z.literal("")),
  techStack: lines,
});

export const cmsActionSchema = z.object({
  action: z.enum(["publish", "unpublish", "delete"]),
});

export const CMS_COLLECTIONS = ["projects", "services", "testimonials", "profile"] as const;
export type CmsCollection = (typeof CMS_COLLECTIONS)[number];

export function splitLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export { slugify };
