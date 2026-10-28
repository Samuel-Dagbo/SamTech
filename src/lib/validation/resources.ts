import { z } from "zod";

export const RESOURCE_CATEGORIES = ["client_brief", "brand_asset", "template", "guide", "other"] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const createResourceSchema = z.object({
  title: z.string().trim().min(2, "Please add a title").max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .max(600)
    .refine((value) => /^https?:\/\//i.test(value), "Must be an http(s) URL"),
  category: z.enum(RESOURCE_CATEGORIES).optional(),
});

export const MARKETING_CHANNELS = ["whatsapp", "linkedin", "x", "instagram", "email", "blog", "other"] as const;
export const MARKETING_STATUSES = ["planned", "in_progress", "published", "cancelled"] as const;

export const createMarketingSchema = z.object({
  title: z.string().trim().min(2, "Please add a title").max(200),
  channel: z.enum(MARKETING_CHANNELS).optional(),
  plannedFor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker").optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const marketingActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set-status"), status: z.enum(MARKETING_STATUSES) }),
  z.object({ action: z.literal("delete") }),
]);
