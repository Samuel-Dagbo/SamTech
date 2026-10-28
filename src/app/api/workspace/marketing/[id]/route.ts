import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { marketingActionSchema } from "@/lib/validation/resources";
import { marketingAction } from "@/lib/services/workspace-modules";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("marketing.manage");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid entry id.");
  }

  const limit = rateLimit(`marketing-action:${guard.auth.user.id}`, { limit: 120, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many updates. Please try again later.", { retryAfter: limit.retryAfterSeconds });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = marketingActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Unknown entry action.");
  }

  try {
    const result = await marketingAction(
      id,
      parsed.data as Parameters<typeof marketingAction>[1],
      {
        actor: guard.auth.user,
        ip: getIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    );
    if (!result.ok) return jsonError(409, result.message);
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("marketing/action", error);
    return jsonError(503, "Unable to update the entry right now. Please try again.");
  }
}
