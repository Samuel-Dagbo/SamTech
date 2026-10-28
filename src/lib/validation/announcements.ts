import { z } from "zod";
import { DEPARTMENTS } from "@/lib/auth/rbac";

const audienceEnum = z.enum(["all", ...DEPARTMENTS] as const);

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(2, "Please add a title").max(200),
  body: z.string().trim().min(2, "Please write the announcement").max(6000),
  audience: audienceEnum.optional(),
  pinned: z.boolean().optional(),
});

export const announcementActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set-pin"), pinned: z.boolean() }),
  z.object({ action: z.literal("retire") }),
  z.object({ action: z.literal("restore") }),
  z.object({ action: z.literal("delete") }),
]);
