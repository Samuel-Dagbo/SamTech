import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { announcementActionSchema } from "@/lib/validation/announcements";
import { announcementAction } from "@/lib/services/announcements";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("announcements.publish");
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return jsonError(400, "Invalid announcement id.");
  }

  const limit = rateLimit(`announcements-action:${guard.auth.user.id}`, {
    limit: 60,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) {
    return jsonError(429, "Too many announcement updates. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = announcementActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Unknown announcement action.");
  }

  try {
    const result = await announcementAction(
      id,
      parsed.data as Parameters<typeof announcementAction>[1],
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
    logServerError("announcements/action", error);
    return jsonError(503, "Unable to update the announcement right now. Please try again.");
  }
}
