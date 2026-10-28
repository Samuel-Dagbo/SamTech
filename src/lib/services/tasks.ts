import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { canUser, type Permission } from "@/lib/auth/rbac";
import type { SessionUser } from "@/lib/auth/session";
import Task, { type TaskDoc, type TaskStatus } from "@/models/task";
import User from "@/models/user";

export type TaskView = {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  createdById: string;
  createdByName?: string;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TaskActionContext = {
  actor: SessionUser;
  ip?: string;
  userAgent?: string;
};

type TaskActionResult = { ok: boolean; message: string };

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

function canManage(user: SessionUser, permission: Permission = "tasks.manage"): boolean {
  return canUser(user, permission);
}

function serializeTask(
  doc: TaskDoc & { _id: mongoose.Types.ObjectId },
  names: Map<string, string>,
): TaskView {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description || undefined,
    assigneeId: doc.assigneeId ? String(doc.assigneeId) : undefined,
    assigneeName: doc.assigneeId ? names.get(String(doc.assigneeId)) : undefined,
    dueDate: doc.dueDate ? doc.dueDate.toISOString() : undefined,
    status: doc.status,
    priority: doc.priority,
    createdById: String(doc.createdById),
    createdByName: names.get(String(doc.createdById)),
    completedAt: doc.completedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function loadNames(ids: string[]): Promise<Map<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return new Map();
  const docs = await User.find({ _id: { $in: unique } })
    .select("name")
    .lean<{ _id: mongoose.Types.ObjectId; name: string }[]>();
  return new Map(docs.map((doc) => [String(doc._id), doc.name]));
}

export async function listTasks(options: { viewer: SessionUser }): Promise<TaskView[]> {
  await connectDB();
  const query = canManage(options.viewer)
    ? {}
    : { $or: [{ assigneeId: options.viewer.id }, { assigneeId: { $exists: false } }, { createdById: options.viewer.id }] };
  const docs = await Task.find(query)
    .sort({ status: 1, dueDate: 1, updatedAt: -1 })
    .limit(300)
    .lean<(TaskDoc & { _id: mongoose.Types.ObjectId })[]>();
  const names = await loadNames([
    ...docs.map((doc) => String(doc.assigneeId ?? "")),
    ...docs.map((doc) => String(doc.createdById)),
  ]);
  return docs.map((doc) => serializeTask(doc, names));
}

export async function createTask(
  input: {
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
  },
  ctx: TaskActionContext,
): Promise<TaskActionResult> {
  if (!canManage(ctx.actor)) {
    return { ok: false, message: "You do not have permission to create tasks." };
  }
  await connectDB();

  let assigneeId: mongoose.Types.ObjectId | undefined;
  if (input.assigneeId) {
    const assignee = await User.findById(input.assigneeId).lean<{ status: string }>();
    if (!assignee || assignee.status !== "active") {
      return { ok: false, message: "Assignee must be an active team member." };
    }
    assigneeId = new mongoose.Types.ObjectId(input.assigneeId);
  }

  const dueDate = input.dueDate ? new Date(`${input.dueDate}T12:00:00.000Z`) : undefined;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return { ok: false, message: "Invalid due date." };
  }

  await Task.create({
    title: input.title,
    description: input.description || undefined,
    assigneeId,
    dueDate,
    priority: input.priority ?? "medium",
    status: "todo",
    createdById: new mongoose.Types.ObjectId(ctx.actor.id),
  });

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "tasks.created",
    targetType: "task",
    metadata: { title: input.title, assigneeId: input.assigneeId ?? null },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: "Task created." };
}

export async function taskAction(
  taskId: string,
  action:
    | { action: "set-status"; status: TaskStatus }
    | { action: "assign"; assigneeId: string }
    | { action: "set-priority"; priority: "low" | "medium" | "high" }
    | { action: "delete" },
  ctx: TaskActionContext,
): Promise<TaskActionResult> {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) return { ok: false, message: "Task not found." };

  const isManager = canManage(ctx.actor);
  const isAssignee = task.assigneeId && String(task.assigneeId) === ctx.actor.id;
  const isCreator = String(task.createdById) === ctx.actor.id;

  if (action.action === "delete") {
    if (!isManager && !isCreator) {
      return { ok: false, message: "Only the task creator or a manager can delete tasks." };
    }
    await task.deleteOne();
    await recordAudit({
      actorId: ctx.actor.id,
      actorEmail: ctx.actor.email,
      action: "tasks.deleted",
      targetType: "task",
      targetId: taskId,
      metadata: { title: task.title },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    return { ok: true, message: "Task deleted." };
  }

  if (action.action === "set-status") {
    if (!isManager && !isAssignee && !isCreator) {
      return { ok: false, message: "You can only update tasks assigned to you." };
    }
    const previous = task.status;
    task.status = action.status;
    task.completedAt = action.status === "done" ? new Date() : undefined;
    await task.save();
    await recordAudit({
      actorId: ctx.actor.id,
      actorEmail: ctx.actor.email,
      action: "tasks.status_changed",
      targetType: "task",
      targetId: taskId,
      metadata: { title: task.title, from: previous, to: action.status },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    return { ok: true, message: `Task moved to ${action.status.replace("_", " ")}.` };
  }

  if (!isManager) {
    return { ok: false, message: "You do not have permission for this action." };
  }

  if (action.action === "assign") {
    if (action.assigneeId) {
      const assignee = await User.findById(action.assigneeId).lean<{ status: string; name: string }>();
      if (!assignee || assignee.status !== "active") {
        return { ok: false, message: "Assignee must be an active team member." };
      }
    }
    task.assigneeId = action.assigneeId ? new mongoose.Types.ObjectId(action.assigneeId) : undefined;
    await task.save();
    await recordAudit({
      actorId: ctx.actor.id,
      actorEmail: ctx.actor.email,
      action: "tasks.assigned",
      targetType: "task",
      targetId: taskId,
      metadata: { title: task.title, assigneeId: action.assigneeId || null },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    return { ok: true, message: action.assigneeId ? "Task assigned." : "Task unassigned." };
  }

  task.priority = action.priority;
  await task.save();
  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "tasks.priority_changed",
    targetType: "task",
    targetId: taskId,
    metadata: { title: task.title, priority: action.priority },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: `Priority set to ${action.priority}.` };
}

export { STATUS_ORDER };
