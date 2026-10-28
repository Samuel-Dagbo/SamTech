import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { canUser } from "@/lib/auth/rbac";
import { listMarketing } from "@/lib/services/workspace-modules";
import { MarketingManager } from "@/components/workspace/library-managers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketing calendar",
  robots: { index: false, follow: false },
};

export default async function MarketingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/marketing");
  }

  const entries = await listMarketing();

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Marketing calendar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          Plan posts across WhatsApp, LinkedIn, X, and email — then track them to published.
        </p>
      </header>
      <MarketingManager entries={entries} canManage={canUser(auth.user, "marketing.manage")} />
    </div>
  );
}
