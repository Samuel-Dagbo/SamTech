import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.email("Please enter a valid email address").max(200),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(10, "Please describe your project (at least 10 characters)").max(5_000),
  /**
   * Honeypot — lenient by design: any filled value marks the submission as a
   * bot AFTER validation succeeds (bots must receive a fake success, not a
   * validation error that reveals the trap).
   */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function contactFieldErrors(error: z.ZodError<ContactInput>): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }
  return fieldErrors;
}
