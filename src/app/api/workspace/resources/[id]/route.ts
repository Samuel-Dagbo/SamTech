import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { deleteResource } from "@/lib/services/workspace-modules";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("resources.manage");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid resource id.");
  }

  const limit = rateLimit(`resources-action:${guard.auth.user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many updates. Please try again later.", { retryAfter: limit.retryAfterSeconds });
  }

  try {
    const result = await deleteResource(id, {
      actor: guard.auth.user,
      ip: getIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    if (!result.ok) return jsonError(409, result.message);
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("resources/action", error);
    return jsonError(503, "Unable to update the resource right now. Please try again.");
  }
}
