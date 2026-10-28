import mongoose, { model, Schema, type Model, type Types } from "mongoose";

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskDoc {
  title: string;
  description?: string;
  assigneeId?: Types.ObjectId;
  dueDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  createdById: Types.ObjectId;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const taskSchema = new Schema<TaskDoc, Model<TaskDoc>>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
    dueDate: Date,
    status: { type: String, enum: ["todo", "in_progress", "blocked", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: Date,
  },
  { timestamps: true },
);

taskSchema.index({ status: 1, dueDate: 1 });

const Task = (mongoose.models.Task as Model<TaskDoc>) || model<TaskDoc>("Task", taskSchema);
export default Task;
