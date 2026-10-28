import "server-only";
import { NextResponse } from "next/server";
import { getAuthContext, type AuthContext } from "./session";
import { can, type Permission } from "./rbac";

/**
 * Server-side authorization guards for Route Handlers and Server Components.
 * The UI may hide restricted controls, but every protected operation must
 * pass through one of these regardless.
 */

export type AuthGuardResult =
  | { ok: true; auth: AuthContext }
  | { ok: false; response: NextResponse };

export async function requireSession(): Promise<AuthGuardResult> {
  const auth = await getAuthContext();
  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Authentication required." }, { status: 401 }),
    };
  }
  return { ok: true, auth };
}

export async function requirePermission(permission: Permission): Promise<AuthGuardResult> {
  const auth = await getAuthContext();
  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Authentication required." }, { status: 401 }),
    };
  }
  if (!can(auth.user.role, permission)) {
    return {
      ok: false,
      response: NextResponse.json({ message: "You do not have permission to perform this action." }, { status: 403 }),
    };
  }
  return { ok: true, auth };
}
