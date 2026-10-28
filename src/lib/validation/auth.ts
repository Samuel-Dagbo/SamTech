import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address").max(200),
  // Login validation is intentionally permissive on length: the check is the
  // bcrypt comparison, and detailed password rules leak nothing but noise.
  password: z.string().min(1, "Please enter your password").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
