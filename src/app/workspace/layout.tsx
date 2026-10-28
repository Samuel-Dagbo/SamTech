import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/workspace/logout-button";
import { getAuthContext } from "@/lib/auth/session";
import { ROLE_LABELS, canUser } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workspace",
  robots: { index: false, follow: false },
};

/**
 * Server-side authorization gate. The proxy only checks cookie presence —
 * this is the layer that actually validates the session and the user status.
 */
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-ink text-[#f8f1e7]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-clay text-sm font-extrabold text-white">
              S
            </span>
            <div>
              <strong className="block text-sm leading-none">SamTech Labs</strong>
              <small className="block pt-1 text-[11px] uppercase tracking-[0.18em] text-white/50">
                Internal workspace
              </small>
            </div>
          </div>
          <nav aria-label="Workspace sections" className="hidden items-center gap-1 text-sm md:flex">
            <Link
              href="/workspace"
              className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/workspace/tasks"
              className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Tasks
            </Link>
            <Link
              href="/workspace/announcements"
              className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Announcements
            </Link>
            {canUser(auth.user, "cms.manage") ? (
              <Link
                href="/workspace/cms"
                className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Content
              </Link>
            ) : null}
            {canUser(auth.user, "messages.manage") ? (
              <Link
                href="/workspace/messages"
                className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Inbox
              </Link>
            ) : null}
            {canUser(auth.user, "team.manage") ? (
              <Link
                href="/workspace/team"
                className="rounded-full px-4 py-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Team
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <span className="block text-sm font-semibold">{auth.user.name}</span>
              <span className="block text-xs text-white/50">
                {ROLE_LABELS[auth.user.role]}
                {auth.user.department ? ` · ${auth.user.department}` : ""}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-black/10 px-4 py-6 text-center text-xs text-black/50 sm:px-6">
        <Link href="/" className="hover:text-ink">
          View public site
        </Link>
        <span className="mx-2">·</span>
        <span>Private area — not indexed</span>
      </footer>
    </div>
  );
}
