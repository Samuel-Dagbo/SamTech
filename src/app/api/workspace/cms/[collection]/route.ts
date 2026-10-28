import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requirePermission } from "@/lib/auth/guards";
import {
  CMS_COLLECTIONS,
  projectCmsSchema,
  serviceCmsSchema,
  testimonialCmsSchema,
  profileCmsSchema,
} from "@/lib/validation/cms";
import { saveProject, saveProfile, saveService, saveTestimonial } from "@/lib/services/cms";

type RouteContext = { params: Promise<{ collection: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const guard = await requirePermission("cms.manage");
  if (!guard.ok) return guard.response;

  const { collection } = await context.params;
  if (!(CMS_COLLECTIONS as readonly string[]).includes(collection)) {
    return jsonError(404, "Unknown content collection.");
  }

  const limit = rateLimit(`cms-save:${guard.auth.user.id}`, { limit: 60, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return jsonError(429, "Too many content saves. Please try again later.", {
      retryAfter: limit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const actor = {
    actor: guard.auth.user,
    ip: getIp(request),
    userAgent: request.headers.get("user-agent") ?? undefined,
  };

  try {
    if (collection === "profile") {
      const parsed = profileCmsSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid profile data.");
      }
      const result = await saveProfile({ ...parsed.data, email: parsed.data.email || undefined }, actor);
      if (!result.ok) return jsonError(409, result.message);
      return jsonOk({ message: result.message });
    }

    if (collection === "projects") {
      const parsed = projectCmsSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid project data.");
      }
      const result = await saveProject(
        { ...parsed.data, id: parsed.data.id || undefined, stack: parsed.data.stack ?? undefined },
        actor,
      );
      if (!result.ok) return jsonError(409, result.message);
      return jsonOk({ message: result.message, id: result.id });
    }

    if (collection === "services") {
      const parsed = serviceCmsSchema.safeParse(body);
      if (!parsed.success) {
        return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid service data.");
      }
      const result = await saveService({ ...parsed.data, id: parsed.data.id || undefined }, actor);
      if (!result.ok) return jsonError(409, result.message);
      return jsonOk({ message: result.message, id: result.id });
    }

    const parsed = testimonialCmsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(422, parsed.error.issues[0]?.message ?? "Invalid testimonial data.");
    }
    const result = await saveTestimonial({ ...parsed.data, id: parsed.data.id || undefined }, actor);
    if (!result.ok) return jsonError(409, result.message);
    return jsonOk({ message: result.message, id: result.id });
  } catch (error) {
    logServerError("cms/save", error);
    return jsonError(503, "Unable to save content right now. Please try again.");
  }
}
