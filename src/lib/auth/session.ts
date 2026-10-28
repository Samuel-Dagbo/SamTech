import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Types } from "mongoose";
import { connectDB } from "../db";
import User from "@/models/user";
import Session, { type SessionDoc } from "@/models/session";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "./constants";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "founder" | "team_member";
  title?: string;
};

export type AuthContext = {
  user: SessionUser;
  session: { id: string; expiresAt: Date };
};

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET is required for authentication (generate with: openssl rand -hex 32)");
  }
  return secret;
}

/** Tokens are stored only as HMAC-SHA256 digests; the raw token never hits the DB. */
export function hashToken(token: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(token).digest("hex");
}

export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    await connectDB();
    const session = await Session.findOne({ tokenHash: hashToken(token) }).lean<
      SessionDoc & { _id: Types.ObjectId }
    >();
    if (!session || session.revokedAt) return null;
    if (session.expiresAt.getTime() < Date.now()) return null;

    const user = await User.findById(session.userId).lean<{
      _id: Types.ObjectId;
      name: string;
      email: string;
      role: "founder" | "team_member";
      title?: string;
      status: string;
    }>();
    if (!user || user.status !== "active") return null;

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
      },
      session: { id: String(session._id), expiresAt: session.expiresAt },
    };
  } catch (error) {
    // Auth must fail closed, but a broken DB should surface as a clear error
    // rather than a silent redirect to login on every request.
    console.error("[auth] session lookup failed:", error instanceof Error ? error.message : error);
    return null;
  }
});

export type CreateSessionMeta = { ip?: string; userAgent?: string };

export async function createSession(
  userId: Types.ObjectId,
  meta: CreateSessionMeta = {},
): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await connectDB();
  await Session.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    ip: meta.ip,
    userAgent: meta.userAgent?.slice(0, 300),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectDB();
    await Session.updateOne({ tokenHash: hashToken(token) }, { $set: { revokedAt: new Date() } });
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** Used by team-management actions: kill every live session for a user. */
export async function revokeAllUserSessions(userId: Types.ObjectId): Promise<void> {
  await connectDB();
  await Session.updateMany(
    { userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  );
}

export function isSessionSecretConfigured(): boolean {
  return Boolean(process.env.SESSION_SECRET?.trim());
}
