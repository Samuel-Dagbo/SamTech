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

/** http(s) URL or an inline uploaded image (data URL), used by the upload panel. */
const optionalMedia = z
  .string()
  .trim()
  .max(2_000_000, "Image is too large")
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\//i.test(value) ||
      /^data:image\/(?:png|jpe?g|webp);base64,/i.test(value),
    "Must be an http(s) URL or an uploaded image",
  )
  .optional()
  .or(z.literal(""));

/** Gallery/editorial text where individual lines may be large data URLs. */
const mediaLines = z
  .string()
  .max(4_000_000, "Too many uploaded images")
  .optional()
  .or(z.literal(""));

const shortText = (max = 160) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

const bodyText = (max = 4000) =>
  z
    .string()
    .trim()
    .max(max)
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
  image: optionalMedia,
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
  image: optionalMedia,
  published: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export const testimonialCmsSchema = z.object({
  id: idField,
  name: z.string().trim().min(2, "Please add the client name").max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  quote: z.string().trim().min(10, "Please write the quote").max(1500),
  image: optionalMedia,
  published: z.boolean().optional(),
  order: z.coerce.number().int().min(0).max(999).optional(),
});

export const profileCmsSchema = z.object({
  name: z.string().trim().min(2, "Please add your name").max(120),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  intro: z.string().trim().max(2000).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  yearsExperience: shortText(40),
  availability: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.email("Please enter a valid email address").optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  resumeUrl: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  xUrl: optionalUrl,
  heroImage: optionalMedia,
  contactImage: optionalMedia,
  aboutTitle: z.string().trim().max(160).optional().or(z.literal("")),
  aboutIntro: z.string().trim().max(3000).optional().or(z.literal("")),
  aboutImage: optionalMedia,
  aboutGallery: mediaLines,
  aboutName: shortText(120),
  aboutEducation: shortText(200),
  aboutJourneyTitle: shortText(),
  aboutJourneyBody: bodyText(4000),
  aboutInspirationTitle: shortText(),
  aboutInspirationBody: bodyText(4000),
  aboutWhoTitle: shortText(),
  aboutWhoBody: bodyText(4000),
  aboutStackTitle: shortText(),
  aboutStackBody: bodyText(4000),
  aboutApproachTitle: shortText(),
  aboutApproachBody: bodyText(4000),
  techStack: lines,
  brands: lines,
  /** One entry per block: "Period | Title | Subtitle" on line 1, description on the rest. */
  experienceTimelineRaw: z.string().max(60_000).optional().or(z.literal("")),
  /** One entry per block: question on line 1, answer on the remaining lines. */
  faqItemsRaw: z.string().max(60_000).optional().or(z.literal("")),
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

function splitBlocks(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

export type TimelineEntry = { period: string; title: string; subtitle: string; description: string };

/** Blocks: "Period | Title | Subtitle" on line 1, description on the remaining lines. */
export function parseTimeline(raw: string | undefined): TimelineEntry[] {
  return splitBlocks(raw)
    .map((block) => {
      const segments = block.split(/\r?\n/);
      const [period, title, subtitle] = (segments[0] ?? "").split("|").map((part) => part.trim());
      const description = segments.slice(1).join(" ").trim();
      return { period: period ?? "", title: title ?? "", subtitle: subtitle ?? "", description };
    })
    .filter((entry) => entry.title || entry.description);
}

/** Blocks: question on line 1, answer on the remaining lines. */
export function parseFaq(raw: string | undefined): { question: string; answer: string }[] {
  return splitBlocks(raw)
    .map((block) => {
      const segments = block.split(/\r?\n/);
      return { question: (segments[0] ?? "").trim(), answer: segments.slice(1).join(" ").trim() };
    })
    .filter((item) => item.question && item.answer);
}

export function serializeTimeline(
  entries:
    | { period?: string; title?: string; subtitle?: string; description?: string }[]
    | undefined,
): string {
  return (entries ?? [])
    .map((entry) =>
      [entry.period, entry.title, entry.subtitle].filter(Boolean).join(" | ") +
      (entry.description ? `\n${entry.description}` : ""),
    )
    .join("\n\n");
}

export function serializeFaq(items: { question?: string; answer?: string }[] | undefined): string {
  return (items ?? [])
    .map((item) => `${item.question ?? ""}\n${item.answer ?? ""}`)
    .join("\n\n");
}

/** Gallery textarea: one image (http URL or data URL) per line. */
export function parseGallery(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function serializeGallery(items: string[] | undefined): string {
  return (items ?? []).join("\n");
}

export { slugify };
