import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { requirePermission } from "@/lib/auth/guards";
import { invitationActionSchema } from "@/lib/validation/team";
import { resendInvitation, revokeInvitation } from "@/lib/services/invitations";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("team.invite");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid invitation id.");
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
    return jsonError(503, "Unable to update the invitation right now. Please try again.");
  }
}
