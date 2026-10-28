import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { CMS_COLLECTIONS, cmsActionSchema } from "@/lib/validation/cms";
import { cmsItemAction } from "@/lib/services/cms";

type RouteContext = { params: Promise<{ collection: string; id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("cms.manage");
  if (!guard.ok) return guard.response;

  const { collection, id } = await context.params;
  if (collection === "profile" || !(CMS_COLLECTIONS as readonly string[]).includes(collection)) {
    return jsonError(404, "Unknown content collection.");
  }
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid content id.");
  }

  const limit = rateLimit(`cms-action:${guard.auth.user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many content updates. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = cmsActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Unknown content action.");
  }

  try {
    const result = await cmsItemAction(
      collection as "projects" | "services" | "testimonials",
      id,
      parsed.data.action,
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
    logServerError("cms/action", error);
    return jsonError(503, "Unable to update content right now. Please try again.");
  }
}
