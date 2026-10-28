import "server-only";
import { connectDB } from "@/lib/db";
import { getPublicAppUrl } from "@/lib/env";
import { recordAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/mail/mailjet";
import { passwordResetEmail } from "@/lib/mail/templates";
import { generateToken, RESET_TTL_MINUTES } from "@/lib/auth/tokens";
import { hashToken, revokeAllUserSessions, type SessionUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import PasswordReset from "@/models/password-reset";
import User from "@/models/user";

/**
 * Password reset service. Request responses are always generic (no user
 * enumeration). Tokens are single-use, bound to the email, HMAC-hashed at rest
 * and expire in 60 minutes. Resetting revokes every live session.
 */

export type ResetEmailOutcome = { sent: boolean; error?: string };

export async function createPasswordResetForEmail(
  email: string,
): Promise<{ ok: boolean; email?: ResetEmailOutcome }> {
  await connectDB();
  const normalized = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalized }).lean<{ _id: unknown } | null>();

  // Supersede previous unused resets for this email, then create a fresh one.
  await PasswordReset.updateMany(
    { email: normalized, usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } },
  );

  const { token, tokenHash } = generateToken(RESET_TTL_MINUTES * 60 * 1000);
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
  const created = await PasswordReset.create({ email: normalized, tokenHash, expiresAt });

  // Unknown emails: no email is sent, but the response stays identical.
  if (!user) {
    return { ok: true, email: { sent: true } };
  }

  const resetUrl = `${getPublicAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const template = passwordResetEmail({ resetUrl, expiresAt });
  const outcome = await sendEmail({
    to: normalized,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  created.emailSentAt = outcome.sent ? new Date() : undefined;
  created.emailError = outcome.sent ? undefined : outcome.error;
  await created.save();

  return { ok: true, email: outcome.sent ? { sent: true } : { sent: false, error: outcome.error } };
}

export type ResetConfirmResult = { ok: boolean; message: string; user?: SessionUser };

export async function confirmPasswordReset(input: {
  token: string;
  password: string;
  meta: { ip?: string; userAgent?: string };
}): Promise<ResetConfirmResult> {
  await connectDB();
  const reset = await PasswordReset.findOne({ tokenHash: hashToken(input.token) });
  if (!reset || reset.usedAt) {
    return { ok: false, message: "This reset link is not valid or was already used." };
  }
  if (reset.expiresAt.getTime() < Date.now()) {
    return { ok: false, message: "This reset link has expired. Please request a new one." };
  }

  const user = await User.findOne({ email: reset.email });
  if (!user) {
    return { ok: false, message: "This reset link is not valid." };
  }

  user.passwordHash = await hashPassword(input.password);
  await user.save();

  reset.usedAt = new Date();
  await reset.save();

  // Any stolen session dies with the password change.
  await revokeAllUserSessions(user._id);

  await recordAudit({
    actorId: String(user._id),
    actorEmail: user.email,
    action: "auth.password_reset",
    ip: input.meta.ip,
    userAgent: input.meta.userAgent,
  });

  return {
    ok: true,
    message: "Password updated. Please sign in with your new password.",
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role, title: user.title },
  };
}

export async function changeOwnPassword(input: {
  user: SessionUser;
  currentPassword: string;
  newPassword: string;
  meta: { ip?: string; userAgent?: string };
}): Promise<{ ok: boolean; message: string }> {
  await connectDB();
  const doc = await User.findById(input.user.id);
  if (!doc) return { ok: false, message: "Account not found." };

  const currentOk = await verifyPassword(input.currentPassword, doc.passwordHash);
  if (!currentOk) {
    return { ok: false, message: "Your current password is incorrect." };
  }

  doc.passwordHash = await hashPassword(input.newPassword);
  await doc.save();
  await revokeAllUserSessions(doc._id);

  await recordAudit({
    actorId: doc.id,
    actorEmail: doc.email,
    action: "auth.password_changed",
    ip: input.meta.ip,
    userAgent: input.meta.userAgent,
  });

  return { ok: true, message: "Password changed. Other sessions were signed out." };
}
