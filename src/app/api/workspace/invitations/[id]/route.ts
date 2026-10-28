import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { invitationActionSchema } from "@/lib/validation/team";
import { resendInvitation, revokeInvitation } from "@/lib/services/invitations";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("team.manage");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid invitation id.");
  }

  const limit = rateLimit(`invite-action:${guard.auth.user.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) {
    return jsonError(429, "Too many invitation actions. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = invitationActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Unknown invitation action.");
  }

  const actor = {
    id: guard.auth.user.id,
    email: guard.auth.user.email,
    ip: getIp(request),
    userAgent: request.headers.get("user-agent") ?? undefined,
  };

  try {
    const result =
      parsed.data.action === "resend"
        ? await resendInvitation(id, actor)
        : await revokeInvitation(id, actor);

    if (!result.ok) {
      return jsonError(409, result.message);
    }
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("invitations/action", error);
    return jsonError(503, "Unable to perform the invitation action right now. Please try again.");
  }
}
