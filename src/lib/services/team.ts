import "server-only";
import { connectDB } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { revokeAllUserSessions, type SessionUser } from "@/lib/auth/session";
import { normalizeScopes, normalizeDepartment, type Department, type Role } from "@/lib/auth/rbac";
import User from "@/models/user";

export type TeamMemberView = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  status: "active" | "suspended";
  department?: Department;
  scopes: string[];
  lastLoginAt?: Date;
  createdAt?: Date;
};

export async function listTeamMembers(): Promise<TeamMemberView[]> {
  await connectDB();
  const docs = await User.find().sort({ createdAt: 1 }).limit(200).lean<{
    _id: import("mongoose").Types.ObjectId;
    name: string;
    email: string;
    role: string;
    title?: string;
    status: string;
    department?: Department;
    scopes?: string[];
    lastLoginAt?: Date;
    createdAt?: Date;
  }[]>();
  return docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role as Role,
    title: doc.title,
    status: doc.status as "active" | "suspended",
    department: doc.department,
    scopes: normalizeScopes(doc.scopes),
    lastLoginAt: doc.lastLoginAt,
    createdAt: doc.createdAt,
  }));
}

export type TeamActionResult = { ok: boolean; message: string };

export type TeamActionContext = {
  actor: SessionUser;
  ip?: string;
  userAgent?: string;
};

async function countActiveFounders(): Promise<number> {
  return User.countDocuments({ role: "founder", status: "active" });
}

export async function suspendMember(
  userId: string,
  ctx: TeamActionContext,
): Promise<TeamActionResult> {
  await connectDB();
  if (userId === ctx.actor.id) {
    return { ok: false, message: "You cannot suspend your own account." };
  }
  const user = await User.findById(userId);
  if (!user) return { ok: false, message: "Team member not found." };
  if (user.status === "suspended") return { ok: false, message: "Account is already suspended." };

  user.status = "suspended";
  await user.save();
  // Suspended users lose access immediately, including live sessions.
  await revokeAllUserSessions(user._id);

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "team.suspended",
    targetType: "user",
    targetId: userId,
    metadata: { targetEmail: user.email },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: `${user.name} suspended and signed out everywhere.` };
}

export async function reactivateMember(
  userId: string,
  ctx: TeamActionContext,
): Promise<TeamActionResult> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return { ok: false, message: "Team member not found." };
  if (user.status !== "suspended") return { ok: false, message: "Account is not suspended." };

  user.status = "active";
  await user.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "team.reactivated",
    targetType: "user",
    targetId: userId,
    metadata: { targetEmail: user.email },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: `${user.name} reactivated.` };
}

export async function changeRole(
  userId: string,
  newRole: Role,
  ctx: TeamActionContext,
): Promise<TeamActionResult> {
  await connectDB();
  if (userId === ctx.actor.id) {
    return { ok: false, message: "You cannot change your own role." };
  }
  const user = await User.findById(userId);
  if (!user) return { ok: false, message: "Team member not found." };
  if (user.role === newRole) return { ok: false, message: `Already a ${newRole}.` };

  // Never leave the workspace without an active founder.
  if (user.role === "founder" && newRole !== "founder") {
    const founders = await countActiveFounders();
    if (founders <= 1) {
      return { ok: false, message: "Cannot demote the only founder." };
    }
  }

  const previous = user.role;
  user.role = newRole;
  await user.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "team.role_changed",
    targetType: "user",
    targetId: userId,
    metadata: { targetEmail: user.email, from: previous, to: newRole },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: `${user.name} is now ${newRole === "founder" ? "a founder" : "a team member"}.` };
}

export async function setMemberDepartment(
  userId: string,
  rawDepartment: string | undefined,
  ctx: TeamActionContext,
): Promise<TeamActionResult> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return { ok: false, message: "Team member not found." };
  if (user.role === "founder") {
    return { ok: false, message: "Founders do not belong to a department." };
  }

  const department: Department | undefined = rawDepartment
    ? normalizeDepartment(rawDepartment)
    : undefined;
  if (rawDepartment && !department) {
    return { ok: false, message: "Unknown department." };
  }

  const previous = user.department;
  user.department = department;
  await user.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "team.department_changed",
    targetType: "user",
    targetId: userId,
    metadata: { targetEmail: user.email, from: previous ?? null, to: department ?? null },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: department ? `${user.name} moved to their department.` : `${user.name}'s department cleared.` };
}

export async function setMemberScopes(
  userId: string,
  rawScopes: string[] | undefined,
  ctx: TeamActionContext,
): Promise<TeamActionResult> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return { ok: false, message: "Team member not found." };
  if (user.role === "founder") {
    return { ok: false, message: "Founders already hold full access." };
  }

  const scopes = normalizeScopes(rawScopes);
  user.scopes = scopes;
  await user.save();
  // Access changes take effect on the next request; no session suppression
  // needed because scopes are resolved from the database on every lookup.

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "team.scopes_changed",
    targetType: "user",
    targetId: userId,
    metadata: { targetEmail: user.email, scopes },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: scopes.length ? `${user.name}'s access updated (${scopes.length} scope${scopes.length === 1 ? "" : "s"}).` : `${user.name}'s scopes cleared.` };
}

export async function sendMemberPasswordReset(
  userId: string,
  ctx: TeamActionContext,
): Promise<TeamActionResult> {
  await connectDB();
  const user = await User.findById(userId).lean<{
    _id: import("mongoose").Types.ObjectId;
    name: string;
    email: string;
  }>();
  if (!user) return { ok: false, message: "Team member not found." };

  const { createPasswordResetForEmail } = await import("@/lib/services/password-reset");
  const result = await createPasswordResetForEmail(user.email);
  if (!result.ok) {
    return { ok: false, message: "Could not create the reset link." };
  }

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "team.password_reset_sent",
    targetType: "user",
    targetId: userId,
    metadata: { targetEmail: user.email, emailSent: result.email?.sent ?? false },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  return {
    ok: true,
    message: result.email?.sent
      ? `Password reset email sent to ${user.email}.`
      : `Reset link created, but the email could not be delivered: ${result.email?.error ?? "email not configured"}`,
  };
}
