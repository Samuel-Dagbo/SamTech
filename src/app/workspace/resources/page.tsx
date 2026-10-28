import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { canUser } from "@/lib/auth/rbac";
import { listResources } from "@/lib/services/workspace-modules";
import { ResourcesManager } from "@/components/workspace/library-managers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources",
  robots: { index: false, follow: false },
};

export default async function ResourcesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/resources");
  }

  const resources = await listResources();

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Resources</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          Briefs, brand assets, templates, and guides the whole team can reach.
        </p>
      </header>
      <ResourcesManager resources={resources} canManage={canUser(auth.user, "resources.manage")} />
    </div>
  );
}
