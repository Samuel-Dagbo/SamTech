import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { inviteSchema } from "@/lib/validation/team";
import { createInvitation } from "@/lib/services/invitations";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("team.invite");
  if (!guard.ok) return guard.response;

  const limit = rateLimit(`invite:${guard.auth.user.id}`, { limit: 20, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many invitations sent. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid invitation data.");
  }

  try {
    const result = await createInvitation({
      email: parsed.data.email,
      name: parsed.data.name,
      title: parsed.data.title || undefined,
      role: parsed.data.role,
      department: parsed.data.department,
      scopes: parsed.data.scopes,
      welcomeMessage: parsed.data.welcomeMessage || undefined,
      actor: {
        id: guard.auth.user.id,
        email: guard.auth.user.email,
        ip: getIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    });

    if (!result.ok) {
      if (result.reason === "email-exists") {
        return jsonError(409, "This email already belongs to an active account.");
      }
      return jsonError(422, "Invalid invitation data.");
    }

    if (!result.email.sent) {
      return jsonOk(
        {
          message: `Invitation created, but the email could not be sent (${result.email.error ?? "email not configured"}). Use Resend once email is available.`,
          invitationId: result.invitationId,
          emailSent: false,
        },
        201,
      );
    }

    return jsonOk(
      { message: `Invitation email sent to ${parsed.data.email}.`, invitationId: result.invitationId, emailSent: true },
      201,
    );
  } catch (error) {
    logServerError("invitations/create", error);
    return jsonError(503, "Unable to create the invitation right now. Please try again.");
  }
}
