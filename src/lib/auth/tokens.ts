import "server-only";
import crypto from "node:crypto";
import { hashToken } from "./session";

export const INVITE_TTL_HOURS = 72;
export const RESET_TTL_MINUTES = 60;

export type GeneratedToken = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

/** Cryptographically secure single-use token; only its HMAC is persisted. */
export function generateToken(ttlMs: number): GeneratedToken {
  const token = crypto.randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + ttlMs),
  };
}

export function invitationExpiry(): Date {
  return new Date(Date.now() + INVITE_TTL_HOURS * 60 * 60 * 1000);
}

export function resetExpiry(): Date {
  return new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);
}
