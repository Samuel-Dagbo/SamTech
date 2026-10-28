import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getPublicAppUrl } from "@/lib/env";
import { recordAudit, type AuditEntry } from "@/lib/audit";
import { sendEmail } from "@/lib/mail/mailjet";
import { invitationEmail } from "@/lib/mail/templates";
import { INVITE_TTL_HOURS, generateToken, invitationExpiry } from "@/lib/auth/tokens";
import { hashToken } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createSession, type SessionUser } from "@/lib/auth/session";
import { DEPARTMENT_LABELS, ROLE_LABELS, normalizeScopes, type Department, type Role } from "@/lib/auth/rbac";
import Invitation, { type InvitationDoc } from "@/models/invitation";
import User from "@/models/user";

/**
 * Shared server-side invitation service used by the team APIs, the public
 * acceptance route and the founder bootstrap script path.
 */

export type EmailOutcome = { sent: boolean; error?: string };

function inviteLink(token: string): string {
  return `${getPublicAppUrl()}/invite/accept?token=${encodeURIComponent(token)}`;
}

function roleLabelFor(invitation: InvitationDoc): string {
  const parts = [
    ROLE_LABELS[invitation.role as Role] ?? invitation.role,
    invitation.department ? DEPARTMENT_LABELS[invitation.department as Department] : undefined,
  ].filter(Boolean);
  return parts.join(" · ");
}

async function deliverInvitationEmail(invitation: InvitationDoc, token: string): Promise<EmailOutcome> {
  const template = invitationEmail({
    name: invitation.name,
    title: invitation.title,
    roleLabel: roleLabelFor(invitation),
    welcomeMessage: invitation.welcomeMessage,
    acceptUrl: inviteLink(token),
    expiresAt: invitation.expiresAt,
  });
  const result = await sendEmail({
    to: invitation.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  return result.sent ? { sent: true } : { sent: false, error: result.error };
}

export type CreateInvitationResult =
  | { ok: true; invitationId: string; email: EmailOutcome; token?: string }
  | { ok: false; reason: "email-exists" | "invalid-role" };

export async function createInvitation(input: {
  email: string;
  name: string;
  title?: string;
  role: Role;
  department?: Department;
  scopes?: string[];
  welcomeMessage?: string;
  actor: { id?: string; email?: string } & Partial<AuditEntry>;
  /** Bootstrap path re-uses this service without an HTTP context. */
  founderPath?: boolean;
}): Promise<CreateInvitationResult> {
  await connectDB();
  const email = input.email.toLowerCase().trim();

  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return { ok: false, reason: "email-exists" };
  }

  // Only one live invitation per email: supersede previous pending ones.
  await Invitation.updateMany(
    { email, status: "pending" },
    { $set: { status: "revoked" } },
  );

  const { token, tokenHash, expiresAt } = generateToken(INVITE_TTL_HOURS * 60 * 60 * 1000);
  const invitation = await Invitation.create({
    email,
    name: input.name.trim(),
    title: input.title?.trim() || undefined,
    role: input.role,
    department: input.department || undefined,
    scopes: normalizeScopes(input.scopes),
    status: "pending",
    tokenHash,
    invitedBy: input.actor.id,
    welcomeMessage: input.welcomeMessage?.trim() || undefined,
    expiresAt,
  });

  const outcome = await deliverInvitationEmail(invitation, token);
  invitation.emailSentAt = outcome.sent ? new Date() : undefined;
  invitation.emailError = outcome.sent ? undefined : outcome.error;
  await invitation.save();

  await recordAudit({
    actorId: input.actor.id,
    actorEmail: input.actor.email,
    action: "team.invited",
    targetType: "invitation",
    targetId: String(invitation._id),
    metadata: { inviteeEmail: email, role: input.role, department: input.department ?? null, scopes: normalizeScopes(input.scopes), emailSent: outcome.sent },
    ip: input.actor.ip,
    userAgent: input.actor.userAgent,
  });

  return {
    ok: true,
    invitationId: String(invitation._id),
    email: outcome,
    // The raw token is returned ONLY to the bootstrap path (printed to the
    // founder's own terminal). HTTP handlers never receive it.
    token: input.founderPath ? token : undefined,
  };
}

export type InvitationView = {
  id: string;
  email: string;
  name: string;
  title?: string;
  role: Role;
  department?: Department;
  scopes: string[];
  status: InvitationDoc["status"];
  expired: boolean;
  emailSent: boolean;
  emailError?: string;
  createdAt?: Date;
  expiresAt: Date;
  acceptedAt?: Date;
};

export async function listInvitations(): Promise<InvitationView[]> {
  await connectDB();
  const docs = await Invitation.find().sort({ createdAt: -1 }).limit(200).lean<(InvitationDoc & { _id: mongoose.Types.ObjectId })[]>();
  const now = Date.now();
  return docs.map((doc) => ({
    id: String(doc._id),
    email: doc.email,
    name: doc.name,
    title: doc.title,
    role: doc.role as Role,
    department: doc.department as Department | undefined,
    scopes: normalizeScopes(doc.scopes),
    status: doc.status,
    expired: doc.status === "pending" && doc.expiresAt.getTime() < now,
    emailSent: Boolean(doc.emailSentAt),
    emailError: doc.emailError,
    createdAt: doc.createdAt,
    expiresAt: doc.expiresAt,
    acceptedAt: doc.acceptedAt,
  }));
}

export type ResendResult = { ok: boolean; email?: EmailOutcome; message: string };

export async function resendInvitation(
  invitationId: string,
  actor: { id: string; email: string; ip?: string; userAgent?: string },
): Promise<ResendResult> {
  await connectDB();
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) return { ok: false, message: "Invitation not found." };
  if (invitation.status !== "pending") return { ok: false, message: "Only pending invitations can be resent." };
  if (invitation.emailSentAt && Date.now() - invitation.emailSentAt.getTime() < 60_000) {
    return { ok: false, message: "Please wait a minute before resending." };
  }

  // New token for every send; the previous link stops working immediately.
  const { token, tokenHash } = generateToken(INVITE_TTL_HOURS * 60 * 60 * 1000);
  invitation.tokenHash = tokenHash;
  invitation.expiresAt = invitationExpiry();
  const outcome = await deliverInvitationEmail(invitation, token);
  invitation.emailSentAt = outcome.sent ? new Date() : invitation.emailSentAt;
  invitation.emailError = outcome.sent ? undefined : outcome.error;
  await invitation.save();

  await recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "team.invite_resent",
    targetType: "invitation",
    targetId: invitationId,
    metadata: { inviteeEmail: invitation.email, emailSent: outcome.sent },
    ip: actor.ip,
    userAgent: actor.userAgent,
  });

  return {
    ok: true,
    email: outcome,
    message: outcome.sent ? "Invitation email sent." : `Email could not be sent: ${outcome.error}`,
  };
}

export async function revokeInvitation(
  invitationId: string,
  actor: { id: string; email: string; ip?: string; userAgent?: string },
): Promise<ResendResult> {
  await connectDB();
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) return { ok: false, message: "Invitation not found." };
  if (invitation.status !== "pending") return { ok: false, message: "Only pending invitations can be revoked." };

  invitation.status = "revoked";
  await invitation.save();

  await recordAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "team.invite_revoked",
    targetType: "invitation",
    targetId: invitationId,
    metadata: { inviteeEmail: invitation.email },
    ip: actor.ip,
    userAgent: actor.userAgent,
  });

  return { ok: true, message: "Invitation revoked." };
}

export type InvitationCheck =
  | { valid: true; invitation: { name: string; title?: string; roleLabel: string; expiresAt: Date } }
  | { valid: false; reason: "invalid" | "expired" | "used" | "revoked" | "account-exists" };

export async function checkInvitationToken(token: string): Promise<InvitationCheck> {
  await connectDB();
  const invitation = await Invitation.findOne({ tokenHash: hashToken(token) }).lean<InvitationDoc & { _id: mongoose.Types.ObjectId }>();
  if (!invitation) return { valid: false, reason: "invalid" };
  if (invitation.status === "accepted") return { valid: false, reason: "used" };
  if (invitation.status === "revoked") return { valid: false, reason: "revoked" };
  if (invitation.expiresAt.getTime() < Date.now()) return { valid: false, reason: "expired" };

  const existingUser = await User.findOne({ email: invitation.email }).lean();
  if (existingUser) return { valid: false, reason: "account-exists" };

  return {
    valid: true,
    invitation: {
      name: invitation.name,
      title: invitation.title,
      roleLabel: roleLabelFor(invitation),
      expiresAt: invitation.expiresAt,
    },
  };
}

export type AcceptResult =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: "invalid" | "expired" | "used" | "revoked" | "account-exists" | "weak-password"; message: string };

/**
 * Acceptance consumes the invitation and creates the account in a MongoDB
 * transaction (Atlas replica sets support them), so an account can never be
 * created without the invitation being marked used — and vice versa.
 */
export async function acceptInvitation(input: {
  token: string;
  password: string;
  meta: { ip?: string; userAgent?: string };
}): Promise<AcceptResult> {
  await connectDB();
  const invitation = await Invitation.findOne({ tokenHash: hashToken(input.token) });
  if (!invitation) return { ok: false, reason: "invalid", message: "This invitation link is not valid." };
  if (invitation.status === "accepted") return { ok: false, reason: "used", message: "This invitation was already used." };
  if (invitation.status === "revoked") return { ok: false, reason: "revoked", message: "This invitation was revoked." };
  if (invitation.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired", message: "This invitation has expired. Ask the founder to resend it." };

  const email = invitation.email;
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) return { ok: false, reason: "account-exists", message: "An account with this email already exists. Try signing in instead." };

  const passwordHash = await hashPassword(input.password);
  const connection = mongoose.connection;

  const tx = await connection.startSession();
  let createdUserId: mongoose.Types.ObjectId | null = null;
  try {
    await tx.withTransaction(async () => {
      const inserted = await User.create(
        [
          {
            name: invitation.name,
            email,
            passwordHash,
            role: invitation.role,
            title: invitation.title,
            department: invitation.department || undefined,
            scopes: normalizeScopes(invitation.scopes),
            status: "active",
          },
        ],
        { session: tx },
      );
      createdUserId = inserted[0]._id;
      invitation.status = "accepted";
      invitation.acceptedAt = new Date();
      await invitation.save({ session: tx });
    });
  } finally {
    await tx.endSession();
  }

  if (!createdUserId) {
    return { ok: false, reason: "invalid", message: "Could not activate the account. Please try again." };
  }

  await recordAudit({
    actorId: String(createdUserId),
    actorEmail: email,
    action: "team.invite_accepted",
    targetType: "invitation",
    targetId: String(invitation._id),
    metadata: { role: invitation.role },
    ip: input.meta.ip,
    userAgent: input.meta.userAgent,
  });

  await createSession(createdUserId, input.meta);

  return {
    ok: true,
    user: {
      id: String(createdUserId),
      name: invitation.name,
      email,
      role: invitation.role as Role,
      title: invitation.title,
      department: (invitation.department as Department) || undefined,
      scopes: normalizeScopes(invitation.scopes),
    },
  };
}
