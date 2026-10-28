import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

let cachedDummy: string | null = null;

/**
 * Static bcrypt hash of a random unusable value. Compared against when the
 * account does not exist so that "unknown email" and "wrong password" take the
 * same wall-clock time (no user enumeration via response timing).
 */
export function dummyPasswordHash(): string {
  if (!cachedDummy) {
    cachedDummy = bcrypt.hashSync(crypto.randomBytes(32).toString("base64"), BCRYPT_COST);
  }
  return cachedDummy;
}
