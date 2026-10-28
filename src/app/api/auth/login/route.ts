import { connectDB } from "@/lib/db";
import { getIp, isSameOrigin, jsonError, jsonOk, logServerError } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";
import { createSession } from "@/lib/auth/session";
import { dummyPasswordHash, verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/auth";
import User from "@/models/user";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError(403, "Invalid request origin.");
  }

  const ip = getIp(request);
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const ipLimit = rateLimit(`login-ip:${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
  if (!ipLimit.ok) {
    return jsonError(429, "Too many attempts. Please try again later.", {
      retryAfter: ipLimit.retryAfterSeconds,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "Invalid request body.");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "Please enter a valid email address and password.");
  }
  const email = parsed.data.email.toLowerCase().trim();

  const accountLimit = rateLimit(`login-acct:${ip}:${email}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!accountLimit.ok) {
    return jsonError(429, "Too many attempts for this account. Please try again later.", {
      retryAfter: accountLimit.retryAfterSeconds,
    });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });
    const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash ?? dummyPasswordHash());

    if (!user || !passwordOk) {
      await recordAudit({
        actorEmail: email,
        action: "auth.login_failed",
        ip,
        userAgent,
      });
      return jsonError(401, "Invalid email or password.");
    }

    if (user.status === "suspended") {
      await recordAudit({
        actorId: String(user._id),
        actorEmail: email,
        action: "auth.login_blocked_suspended",
        ip,
        userAgent,
      });
      return jsonError(403, "This account is suspended. Please contact the founder.");
    }

    await createSession(user._id, { ip, userAgent });
    user.lastLoginAt = new Date();
    await user.save();

    await recordAudit({
      actorId: String(user._id),
      actorEmail: user.email,
      action: "auth.login",
      ip,
      userAgent,
    });

    return jsonOk({
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    logServerError("auth/login", error);
    return jsonError(503, "Unable to sign in right now. Please try again.");
  }
}
