import { NextResponse } from "next/server";

export function jsonOk<T extends object>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(
  status: number,
  message: string,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ message, ...extra }, { status });
}

/** Never leak internals to clients; log details server-side. */
export function logServerError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[server:${context}] ${message}`);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
}

export function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * CSRF defence for cookie-authenticated mutations: browsers always attach
 * `Origin` on cross-site POSTs, so a mismatching origin is rejected.
 * Requests without an Origin header (server-to-server, curl) pass through.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
