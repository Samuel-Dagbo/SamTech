import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import { createAnnouncementSchema } from "@/lib/validation/announcements";
import { createAnnouncement } from "@/lib/services/announcements";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("announcements.publish");
  if (!guard.ok) return guard.response;

  const limit = rateLimit(`announcements-create:${guard.auth.user.id}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.ok) {
    return jsonError(429, "Too many announcements posted. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = createAnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid announcement data.");
  }

  try {
    const result = await createAnnouncement(
      {
        title: parsed.data.title,
        body: parsed.data.body,
        audience: parsed.data.audience,
        pinned: parsed.data.pinned,
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
    logServerError("announcements/create", error);
    return jsonError(503, "Unable to post the announcement right now. Please try again.");
  }
}
