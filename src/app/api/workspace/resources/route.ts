import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { createResourceSchema } from "@/lib/validation/resources";
import { createResource } from "@/lib/services/workspace-modules";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("resources.manage");
  if (!guard.ok) return guard.response;

  const limit = rateLimit(`resources-create:${guard.auth.user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many updates. Please try again later.", { retryAfter: limit.retryAfterSeconds });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = createResourceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid resource data.");
  }

  try {
    const result = await createResource(
      {
        title: parsed.data.title,
        description: parsed.data.description || undefined,
        url: parsed.data.url,
        category: parsed.data.category,
      },
      {
        actor: guard.auth.user,
        ip: getIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      },
    );
    if (!result.ok) return jsonError(409, result.message);
    return jsonOk({ message: result.message }, 201);
  } catch (error) {
    logServerError("resources/create", error);
    return jsonError(503, "Unable to add the resource right now. Please try again.");
  }
}
