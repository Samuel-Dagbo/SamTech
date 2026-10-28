import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requireSession } from "@/lib/auth/guards";
import { taskActionSchema } from "@/lib/validation/tasks";
import { taskAction } from "@/lib/services/tasks";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid task id.");
  }

  const limit = rateLimit(`task-action:${guard.auth.user.id}`, { limit: 120, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many task updates. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = taskActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Unknown task action.");
  }

  try {
    const result = await taskAction(
      id,
      parsed.data as Parameters<typeof taskAction>[1],
      {
        actor: guard.auth.user,
        ip: getIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    );
    if (!result.ok) {
      return jsonError(409, result.message);
    }
    return jsonOk({ message: result.message });
  } catch (error) {
    logServerError("tasks/action", error);
    return jsonError(503, "Unable to update the task right now. Please try again.");
  }
}
