import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { acceptInvitationSchema } from "@/lib/validation/team";
import { acceptInvitation } from "@/lib/services/invitations";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const ip = getIp(request);
  const limit = rateLimit(`invite-accept:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
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

  const parsed = acceptInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  try {
    const result = await acceptInvitation({
      token: parsed.data.token,
      password: parsed.data.password,
      meta: { ip, userAgent: request.headers.get("user-agent") ?? undefined },
    });

    if (!result.ok) {
      return jsonError(400, result.message);
    }
    return jsonOk({
      message: "Account activated. Welcome to the team!",
      user: { name: result.user.name, email: result.user.email, role: result.user.role },
    });
  } catch (error) {
    logServerError("invite/accept", error);
    return jsonError(503, "Unable to activate the account right now. Please try again.");
  }
}
