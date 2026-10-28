import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { can } from "@/lib/auth/rbac";
import { listInvitations } from "@/lib/services/invitations";
import { listTeamMembers } from "@/lib/services/team";
import { TeamManager, type Invitation, type TeamMember } from "@/components/workspace/team-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team",
  robots: { index: false, follow: false },
};

function iso(value?: Date): string | undefined {
  return value ? value.toISOString() : undefined;
}

export default async function TeamPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/team");
  }
  if (!can(auth.user.role, "team.manage")) {
    // Team members see the dashboard instead of team administration.
    redirect("/workspace");
  }

  const [members, invitations] = await Promise.all([listTeamMembers(), listInvitations()]);

  const memberViews: TeamMember[] = members.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    title: member.title,
    status: member.status,
    lastLoginAt: iso(member.lastLoginAt),
    createdAt: iso(member.createdAt),
  }));

  const invitationViews: Invitation[] = invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    name: invitation.name,
    title: invitation.title,
    role: invitation.role,
    status: invitation.status,
    expired: invitation.expired,
    emailSent: invitation.emailSent,
    emailError: invitation.emailError,
    createdAt: iso(invitation.createdAt),
    expiresAt: iso(invitation.expiresAt),
  }));

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Team &amp; access</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          Invite teammates by email, manage their roles, and revoke access. Every action here is
          recorded in the audit log.
        </p>
      </header>
      <TeamManager members={memberViews} invitations={invitationViews} selfId={auth.user.id} />
    </div>
  );
}
