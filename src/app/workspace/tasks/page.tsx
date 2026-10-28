import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { canUser } from "@/lib/auth/rbac";
import { listTasks, type TaskView } from "@/lib/services/tasks";
import { listTeamMembers, type TeamMemberView } from "@/lib/services/team";
import { TaskBoard } from "@/components/workspace/task-board";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tasks",
  robots: { index: false, follow: false },
};

export default async function TasksPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/tasks");
  }

  const [tasks, members] = await Promise.all([
    listTasks({ viewer: auth.user }),
    listTeamMembers(),
  ]);

  const activeMembers: TeamMemberView[] = members.filter((member) => member.status === "active");
  const taskViews: TaskView[] = tasks.map((task) => ({ ...task }));

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Tasks</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          {canUser(auth.user, "tasks.manage")
            ? "Create tasks, assign teammates, and track progress."
            : "Tasks assigned to you, plus anything you created."}
        </p>
      </header>
      <TaskBoard tasks={taskViews} members={activeMembers} viewer={auth.user} />
    </div>
  );
}
