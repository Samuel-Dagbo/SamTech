import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { PERMISSIONS, ROLE_LABELS, can } from "@/lib/auth/rbac";

const MODULES = [
  { name: "Dashboard", permission: "workspace.view", status: "Phase 3 — live" },
  { name: "Tasks", permission: "tasks.update-own", status: "Phase 5" },
  { name: "Projects", permission: "workspace.view", status: "Phase 5" },
  { name: "Announcements", permission: "workspace.view", status: "Phase 5" },
  { name: "Team", permission: "team.manage", status: "Phase 4" },
  { name: "Resources", permission: "workspace.view", status: "Phase 5" },
  { name: "Content CMS", permission: "cms.manage", status: "Phase 6" },
] as const;

export default async function WorkspaceHomePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace");
  }

  const firstName = auth.user.name.split(" ")[0] || auth.user.name;

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          {ROLE_LABELS[auth.user.role]} dashboard
        </p>
        <h1 className="mt-3 text-3xl leading-tight text-ink sm:text-4xl">Welcome back, {firstName}.</h1>
        <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">
          You are signed in as <strong>{auth.user.email}</strong>
          {auth.user.title ? ` — ${auth.user.title}` : ""}. This checkpoint establishes secure
          authentication, sessions and role permissions; workspace modules roll out in the next
          phases.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-forest/15 bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
            Session expires {auth.session.expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
            Role: {ROLE_LABELS[auth.user.role]}
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-xl text-ink">Modules &amp; your access</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => {
            const permitted = can(auth.user.role, module.permission);
            return (
              <article
                key={module.name}
                className="rounded-[22px] border border-black/10 bg-white/75 p-5 shadow-panel backdrop-blur"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg text-ink">{module.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      permitted ? "bg-forest/10 text-forest" : "bg-black/5 text-black/45"
                    }`}
                  >
                    {permitted ? "Access" : "No access"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/55">{module.status}</p>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-black/45">
          Permissions shown are resolved from server-side role data ({Object.keys(PERMISSIONS).length}{" "}
          permissions registered), never from the browser.
        </p>
      </section>
    </div>
  );
}
