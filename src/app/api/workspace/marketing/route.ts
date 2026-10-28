import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { createMarketingSchema } from "@/lib/validation/resources";
import { createMarketingEntry } from "@/lib/services/workspace-modules";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("marketing.manage");
  if (!guard.ok) return guard.response;

  const limit = rateLimit(`marketing-create:${guard.auth.user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many updates. Please try again later.", { retryAfter: limit.retryAfterSeconds });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = createMarketingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid entry data.");
  }

  try {
    const result = await createMarketingEntry(
      {
        title: parsed.data.title,
        channel: parsed.data.channel,
        plannedFor: parsed.data.plannedFor || undefined,
        notes: parsed.data.notes || undefined,
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
    logServerError("marketing/create", error);
    return jsonError(503, "Unable to plan the entry right now. Please try again.");
  }
}
