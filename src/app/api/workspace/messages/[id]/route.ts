import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { messageActionSchema } from "@/lib/validation/messages";
import { messageAction } from "@/lib/services/messages";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("messages.manage");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid message id.");
  }

  const limit = rateLimit(`messages-action:${guard.auth.user.id}`, {
    limit: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) {
    return jsonError(429, "Too many inbox updates. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = messageActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Unknown inbox action.");
  }

  try {
    const result = await messageAction(id, parsed.data.action, {
      actor: guard.auth.user,
      ip: getIp(request),
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
    if (!result.ok) {
      return jsonError(409, result.message);
    }
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("messages/action", error);
    return jsonError(503, "Unable to update the inbox right now. Please try again.");
  }
}
