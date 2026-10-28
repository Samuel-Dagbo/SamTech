import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation/team";
import { confirmPasswordReset } from "@/lib/services/password-reset";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const limit = rateLimit(`reset-confirm:${getIp(request)}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many attempts. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const result = await confirmPasswordReset({
      token: parsed.data.token,
      password: parsed.data.password,
      meta: { ip: getIp(request), userAgent: request.headers.get("user-agent") ?? undefined },
    });
    if (!result.ok) {
      return jsonError(400, result.message);
    }
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("password-reset/confirm", error);
    return jsonError(503, "Unable to reset the password right now. Please try again.");
  }
}
