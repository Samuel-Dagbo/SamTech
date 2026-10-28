import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation/team";
import { createPasswordResetForEmail } from "@/lib/services/password-reset";
import { recordAudit } from "@/lib/audit";

/**
 * Always responds with the same generic message whether or not the email
 * belongs to an account (no user enumeration).
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const ip = getIp(request);
  const ipLimit = rateLimit(`reset-ip:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!ipLimit.ok) {
    return jsonError(429, "Too many attempts. Please try again later.", {
      retryAfter: ipLimit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    // Same generic shape as success, to avoid oracle behavior.
    return jsonOk({ message: "If that email has an account, a reset link is on its way." });
  }

  const emailLimit = rateLimit(`reset-acct:${ip}:${parsed.data.email.toLowerCase()}`, {
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });
  if (!emailLimit.ok) {
    return jsonOk({ message: "If that email has an account, a reset link is on its way." });
  }

  try {
    const result = await createPasswordResetForEmail(parsed.data.email);
    if (!result.email?.sent) {
      console.warn(`[password-reset] email not sent: ${result.email?.error ?? "unknown"}`);
    }
    await recordAudit({
      action: "auth.password_reset_requested",
      actorEmail: parsed.data.email.toLowerCase(),
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    return jsonOk({ message: "If that email has an account, a reset link is on its way." });
  } catch (error) {
    logServerError("password-reset/request", error);
    return jsonOk({ message: "If that email has an account, a reset link is on its way." });
  }
}
