import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, WORKSPACE_PATH } from "@/lib/auth/constants";

/**
 * Edge-of-request convenience layer ONLY: cheap cookie-presence redirects.
 * It cannot validate sessions (no DB here) — real authorization always
 * happens in server components and route handlers via getAuthContext().
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === WORKSPACE_PATH || pathname.startsWith(`${WORKSPACE_PATH}/`)) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      const next = `${pathname}${request.nextUrl.search}`;
      loginUrl.searchParams.set("next", next);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL(WORKSPACE_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*", "/login"],
};
