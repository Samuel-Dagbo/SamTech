import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { recordAudit } from "@/lib/audit";
import { destroyCurrentSession, getAuthContext } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  try {
    const auth = await getAuthContext();
    await destroyCurrentSession();
    if (auth) {
      await recordAudit({
        actorId: auth.user.id,
        actorEmail: auth.user.email,
        action: "auth.logout",
        ip: getIp(request),
        userAgent: request.headers.get("user-agent") ?? undefined,
      });
    }
    return jsonOk({ message: "Signed out." });
  } catch (error) {
    logServerError("auth/logout", error);
    return jsonError(503, "Unable to sign out right now. Please try again.");
  }
}
