"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { canUser } from "@/lib/auth/rbac";
import type { SessionUser } from "@/lib/auth/session";

type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdById: string;
  createdByName?: string;
  completedAt?: Date | string;
  createdAt?: Date | string;
};

export type MemberOption = { id: string; name: string; role: string };

const STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-clay/10 text-clay-strong border-clay/20",
  medium: "bg-amber-100 text-amber-900 border-amber-200",
  low: "bg-black/5 text-black/55 border-black/10",
};

async function postApi(url: string, body: unknown): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? "Something went wrong. Please try again.");
  }
  return payload?.message ?? "Done.";
}

function TaskCard({
  task,
  canManage,
  viewerId,
  onFeedback,
}: {
  task: Task;
  canManage: boolean;
  viewerId: string;
  onFeedback: (ok: boolean, message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const isAssignee = task.assigneeId === viewerId;
  const isCreator = task.createdById === viewerId;
  const canTouch = canManage || isAssignee || isCreator;

  async function act(body: Record<string, unknown>) {
    if (!canTouch) return;
    setBusy(true);
    try {
      const message = await postApi(`/api/workspace/tasks/${task.id}`, body);
      onFeedback(true, message);
      window.location.reload();
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{task.title}</h3>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description ? <p className="mt-1 line-clamp-3 text-xs leading-5 text-black/55">{task.description}</p> : null}
      <dl className="mt-2 grid gap-0.5 text-xs text-black/50">
        <div>
          <dt className="inline font-semibold text-black/60">Assignee: </dt>
          <dd className="inline">{task.assigneeName ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-black/60">Due: </dt>
          <dd className="inline">{task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</dd>
        </div>
      </dl>
      {canTouch ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_COLUMNS.filter((column) => column.key !== task.status).map((column) => (
            <Button
              key={column.key}
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => act({ action: "set-status", status: column.key })}
            >
              → {column.label}
            </Button>
          ))}
          {canManage || isCreator ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
                  act({ action: "delete" });
                }
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function TaskBoard({
  tasks,
  members,
  viewer,
}: {
  tasks: Task[];
  members: MemberOption[];
  viewer: SessionUser;
}) {
  const canManage = canUser(viewer, "tasks.manage");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        (task.assigneeName ?? "").toLowerCase().includes(q) ||
        (task.description ?? "").toLowerCase().includes(q),
    );
  }, [tasks, query]);

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const message = await postApi("/api/workspace/tasks", {
        title,
        description: description || undefined,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        priority,
      });
      setFeedback({ ok: true, message });
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      setPriority("medium");
      window.location.reload();
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6">
      {feedback ? (
        <div
          role="status"
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.ok ? "border-forest/20 bg-forest/10 text-forest" : "border-clay/30 bg-clay/10 text-clay-strong"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg text-ink">Board ({filtered.length})</h2>
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search tasks…"
              className="h-10 max-w-56"
              aria-label="Search tasks"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {canManage ? (
              <Button size="sm" onClick={() => setShowForm((open) => !open)} aria-expanded={showForm}>
                {showForm ? "Close" : "New task"}
              </Button>
            ) : null}
          </div>
        </div>

        {showForm && canManage ? (
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={createTask} noValidate>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="task-title">Title</Label>
              <Input id="task-title" required minLength={2} placeholder="Prepare October content calendar" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="task-description">Details (optional)</Label>
              <Textarea id="task-description" rows={3} placeholder="What needs to happen?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="task-assignee">Assignee</Label>
              <select
                id="task-assignee"
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create task"}
              </Button>
            </div>
          </form>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUS_COLUMNS.map((column) => {
          const columnTasks = filtered.filter((task) => task.status === column.key);
          return (
            <section key={column.key} className="rounded-[28px] border border-black/10 bg-white/50 p-4">
              <h3 className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-[0.14em] text-black/45">
                {column.label}
                <span>{columnTasks.length}</span>
              </h3>
              <div className="mt-3 grid gap-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canManage={canManage}
                    viewerId={viewer.id}
                    onFeedback={(ok, message) => setFeedback({ ok, message })}
                  />
                ))}
                {columnTasks.length === 0 ? (
                  <p className="px-1 py-4 text-xs text-black/40">Nothing here.</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
