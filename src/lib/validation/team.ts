import { z } from "zod";

const passwordRules = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long")
  .refine((value) => value.trim().length >= 12, "Password cannot be only spaces");

export const inviteSchema = z.object({
  name: z.string().trim().min(2, "Please enter the full name").max(120),
  email: z.email("Please enter a valid email address").max(200),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  role: z.enum(["founder", "team_member"]),
  welcomeMessage: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type InviteInput = z.infer<typeof inviteSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordRules,
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address").max(200),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordRules,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Please enter your current password").max(200),
  password: passwordRules,
});

export const teamActionSchema = z.object({
  action: z.enum(["suspend", "reactivate", "change-role", "send-password-reset"]),
  role: z.enum(["founder", "team_member"]).optional(),
});

export const invitationActionSchema = z.object({
  action: z.enum(["resend", "revoke"]),
});

export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
