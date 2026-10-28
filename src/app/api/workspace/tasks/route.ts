import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { createTaskSchema } from "@/lib/validation/tasks";
import { createTask } from "@/lib/services/tasks";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("tasks.manage");
  if (!guard.ok) return guard.response;

  const limit = rateLimit(`tasks-create:${guard.auth.user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
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

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid task data.");
  }

  try {
    const result = await createTask(
      {
        title: parsed.data.title,
        description: parsed.data.description || undefined,
        assigneeId: parsed.data.assigneeId || undefined,
        dueDate: parsed.data.dueDate || undefined,
        priority: parsed.data.priority,
      },
      {
        actor: guard.auth.user,
        ip: getIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    );
    if (!result.ok) {
      return jsonError(409, result.message);
    }
    return jsonOk({ message: result.message }, 201);
  } catch (error) {
    logServerError("tasks/create", error);
    return jsonError(503, "Unable to create the task right now. Please try again.");
  }
}
