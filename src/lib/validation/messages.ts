import { z } from "zod";

export const messageActionSchema = z.object({
  action: z.enum(["mark-read", "mark-replied", "archive", "delete"]),
});
