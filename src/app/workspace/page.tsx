import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { ROLE_LABELS, canUser } from "@/lib/auth/rbac";
import { listTasks } from "@/lib/services/tasks";
import { listAnnouncements } from "@/lib/services/announcements";
import { DEPARTMENT_LABELS, type Department } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

const MODULES = [
  { name: "Tasks", href: "/workspace/tasks", permission: "workspace.view", description: "Assign, track, and complete work." },
  { name: "Announcements", href: "/workspace/announcements", permission: "workspace.view", description: "Updates for everyone or one department." },
  { name: "Content manager", href: "/workspace/cms", permission: "cms.manage", description: "Projects, services, testimonials, profile." },
  { name: "Team", href: "/workspace/team", permission: "team.manage", description: "Invite, suspend, and grant access." },
] as const;

export default async function WorkspaceHomePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace");
  }

  const [tasks, announcements] = await Promise.all([
    listTasks({ viewer: auth.user }),
    listAnnouncements({ role: auth.user.role, department: auth.user.department, manage: canUser(auth.user, "announcements.publish") }),
  ]);

  const firstName = auth.user.name.split(" ")[0] || auth.user.name;
  const openTasks = tasks.filter((task) => task.status !== "done");
  const myOpen = openTasks.filter((task) => task.assigneeId === auth.user.id);
  const latestAnnouncement = announcements[0];

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          {ROLE_LABELS[auth.user.role]} dashboard
        </p>
        <h1 className="mt-3 text-3xl leading-tight text-ink sm:text-4xl">Welcome back, {firstName}.</h1>
        <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">
          You are signed in as <strong>{auth.user.email}</strong>
          {auth.user.title ? ` — ${auth.user.title}` : ""}.
          {auth.user.department
            ? ` Department: ${DEPARTMENT_LABELS[auth.user.department as Department] ?? auth.user.department}.`
            : ""}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/workspace/tasks"
            className="rounded-full border border-forest/15 bg-forest/10 px-3 py-1 text-xs font-semibold text-forest transition hover:bg-forest/20"
          >
            {myOpen.length ? `${myOpen.length} task${myOpen.length === 1 ? "" : "s"} assigned to you` : "No open tasks for you"}
          </Link>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
            {openTasks.length} open across the team
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
            Session expires {auth.session.expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </section>

      {latestAnnouncement ? (
        <section className="rounded-[28px] border border-clay/30 bg-clay/5 p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-strong">Latest announcement</p>
          <h2 className="mt-2 text-lg text-ink">{latestAnnouncement.title}</h2>
          <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-6 text-black/60">{latestAnnouncement.body}</p>
          <Link href="/workspace/announcements" className="mt-3 inline-block text-sm font-semibold text-clay-strong hover:underline">
            See all announcements →
          </Link>
        </section>
      ) : null}

      <section>
        <h2 className="text-xl text-ink">Modules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => {
            const permitted = canUser(auth.user, module.permission);
            return (
              <Link
                key={module.name}
                href={module.href}
                className="rounded-[22px] border border-black/10 bg-white/75 p-5 shadow-panel backdrop-blur transition hover:border-clay/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg text-ink">{module.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      permitted ? "bg-forest/10 text-forest" : "bg-black/5 text-black/45"
                    }`}
                  >
                    {permitted ? "Access" : "View only"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/55">{module.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
