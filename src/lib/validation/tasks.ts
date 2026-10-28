import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "blocked", "done"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Please give the task a short title").max(200),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  assigneeId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid assignee").optional().or(z.literal("")),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker").optional().or(z.literal("")),
  priority: taskPrioritySchema.optional(),
});

export const taskActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set-status"),
    status: taskStatusSchema,
  }),
  z.object({
    action: z.literal("assign"),
    assigneeId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid assignee").or(z.literal("")),
  }),
  z.object({
    action: z.literal("set-priority"),
    priority: taskPrioritySchema,
  }),
  z.object({
    action: z.literal("delete"),
  }),
]);
