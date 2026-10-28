import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requireSession } from "@/lib/auth/guards";
import { changePasswordSchema } from "@/lib/validation/team";
import { changeOwnPassword } from "@/lib/services/password-reset";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const limit = rateLimit(`password-change:${guard.auth.user.id}`, { limit: 5, windowMs: 15 * 60 * 1000 });
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

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const result = await changeOwnPassword({
      user: guard.auth.user,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.password,
      meta: { ip: getIp(request), userAgent: request.headers.get("user-agent") ?? undefined },
    });
    if (!result.ok) {
      return jsonError(400, result.message);
    }
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("password/change", error);
    return jsonError(503, "Unable to change the password right now. Please try again.");
  }
}
