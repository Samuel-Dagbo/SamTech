import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { requirePermission } from "@/lib/auth/guards";
import { teamActionSchema } from "@/lib/validation/team";
import { changeRole, reactivateMember, sendMemberPasswordReset, setMemberDepartment, setMemberScopes, suspendMember } from "@/lib/services/team";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("team.manage");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid team member id.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = teamActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Unknown team action.");
  }

  const ctx = {
    actor: guard.auth.user,
    ip: getIp(request),
    userAgent: request.headers.get("user-agent") ?? undefined,
  };

  try {
    let result: { ok: boolean; message: string };
    switch (parsed.data.action) {
      case "suspend":
        result = await suspendMember(id, ctx);
        break;
      case "reactivate":
        result = await reactivateMember(id, ctx);
        break;
      case "change-role":
        if (!parsed.data.role) {
          return jsonError(422, "A role is required for change-role.");
        }
        result = await changeRole(id, parsed.data.role, ctx);
        break;
      case "send-password-reset":
        result = await sendMemberPasswordReset(id, ctx);
        break;
      case "set-department":
        result = await setMemberDepartment(id, parsed.data.department, ctx);
        break;
      case "set-scopes":
        if (!parsed.data.scopes) {
          return jsonError(422, "A scopes list is required for set-scopes.");
        }
        result = await setMemberScopes(id, parsed.data.scopes, ctx);
        break;
    }

    if (!result.ok) {
      return jsonError(409, result.message);
    }
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("team/action", error);
    return jsonError(503, "Unable to perform the team action right now. Please try again.");
  }
}
