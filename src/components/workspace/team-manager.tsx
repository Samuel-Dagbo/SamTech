"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { ROLE_LABELS, type Role } from "@/lib/auth/rbac";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  status: "active" | "suspended";
  lastLoginAt?: string;
  createdAt?: string;
};

export type Invitation = {
  id: string;
  email: string;
  name: string;
  title?: string;
  role: Role;
  status: "pending" | "accepted" | "revoked";
  expired: boolean;
  emailSent: boolean;
  emailError?: string;
  createdAt?: string;
  expiresAt?: string;
};

type ApiResult = { message?: string };

async function postApi(url: string, body: unknown): Promise<ApiResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as (ApiResult & { invitationId?: string }) | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? "Something went wrong. Please try again.");
  }
  return payload ?? {};
}

const STATUS_STYLES: Record<Invitation["status"], string> = {
  pending: "bg-amber-100 text-amber-900 border-amber-200",
  accepted: "bg-forest/10 text-forest border-forest/20",
  revoked: "bg-black/5 text-black/50 border-black/10",
};

function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function InvitationRow({ invitation, onDone, onError }: { invitation: Invitation; onDone: (message: string) => void; onError: (message: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function act(action: "resend" | "revoke") {
    setBusy(action);
    try {
      const result = await postApi(`/api/workspace/invitations/${invitation.id}`, { action });
      onDone(result.message ?? "Done.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <tr className="border-b border-black/5 text-sm">
      <td className="px-4 py-3">
        <strong className="text-ink">{invitation.name}</strong>
        <span className="block text-xs text-black/50">{invitation.email}</span>
      </td>
      <td className="px-4 py-3 text-black/60">{ROLE_LABELS[invitation.role]}</td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[invitation.status]}`}>
          {invitation.status === "pending" && invitation.expired ? "expired" : invitation.status}
        </span>
        {invitation.status === "pending" && !invitation.emailSent && invitation.emailError ? (
          <span className="mt-1 block text-xs text-clay-strong" title={invitation.emailError}>
            email not delivered
          </span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-black/60">{formatDate(invitation.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {invitation.status === "pending" ? (
            <>
              <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => act("resend")}>
                {busy === "resend" ? "Sending…" : "Resend"}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => act("revoke")}>
                {busy === "revoke" ? "Revoking…" : "Revoke"}
              </Button>
            </>
          ) : (
            <span className="text-xs text-black/40">{invitation.status === "accepted" ? "Completed" : "Closed"}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

function MemberRow({ member, isSelf, onDone, onError }: { member: TeamMember; isSelf: boolean; onDone: (message: string) => void; onError: (message: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function act(action: "suspend" | "reactivate" | "change-role" | "send-password-reset", role?: Role) {
    setBusy(action);
    try {
      const result = await postApi(`/api/workspace/team/${member.id}`, { action, role });
      onDone(result.message ?? "Done.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <tr className="border-b border-black/5 text-sm">
      <td className="px-4 py-3">
        <strong className="text-ink">{member.name}</strong>
        {isSelf ? <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/70">you</span> : null}
        <span className="block text-xs text-black/50">{member.email}</span>
      </td>
      <td className="px-4 py-3">
        <select
          aria-label={`Role for ${member.name}`}
          className="rounded-xl border border-black/10 bg-white px-2 py-1.5 text-sm text-ink disabled:opacity-50"
          value={member.role}
          disabled={isSelf || busy !== null}
          onChange={(event) => act("change-role", event.target.value as Role)}
        >
          <option value="founder">{ROLE_LABELS.founder}</option>
          <option value="team_member">{ROLE_LABELS.team_member}</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            member.status === "active" ? "bg-forest/10 text-forest border-forest/20" : "bg-clay/10 text-clay-strong border-clay/20"
          }`}
        >
          {member.status}
        </span>
      </td>
      <td className="px-4 py-3 text-black/60">{formatDate(member.lastLoginAt)}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {isSelf ? (
            <span className="text-xs text-black/40">—</span>
          ) : member.status === "active" ? (
            <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => act("suspend")}>
              {busy === "suspend" ? "Suspending…" : "Suspend"}
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => act("reactivate")}>
              {busy === "reactivate" ? "Restoring…" : "Reactivate"}
            </Button>
          )}
          {!isSelf ? (
            <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => act("send-password-reset")}>
              {busy === "send-password-reset" ? "Sending…" : "Send reset"}
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export function TeamManager({ members, invitations, selfId }: { members: TeamMember[]; invitations: Invitation[]; selfId: string }) {
  const [showInviteForm, setShowInviteForm] = useState(invitations.filter((i) => i.status === "pending").length === 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  const filteredInvitations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invitations;
    return invitations.filter((i) => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
  }, [invitations, query]);

  async function sendInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteBusy(true);
    setFeedback(null);
    try {
      const result = await postApi("/api/workspace/invitations", {
        name,
        email,
        title: title || undefined,
        role: "team_member",
        welcomeMessage: welcomeMessage || undefined,
      });
      setFeedback({ ok: true, message: result.message ?? "Invitation sent." });
      setName("");
      setEmail("");
      setTitle("");
      setWelcomeMessage("");
    } catch (err) {
      setFeedback({
        ok: false,
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setInviteBusy(false);
    }
  }

  return (
    <div className="grid gap-8">
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
          <div>
            <h2 className="text-lg text-ink">Invite a team member</h2>
            <p className="text-sm text-black/55">They receive a single-use email link valid for 72 hours.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowInviteForm((open) => !open)} aria-expanded={showInviteForm}>
            {showInviteForm ? "Hide form" : "New invitation"}
          </Button>
        </div>

        {showInviteForm ? (
          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={sendInvite} noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-name">Full name</Label>
              <Input id="invite-name" required minLength={2} placeholder="Ada Mensah" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-email">Work email</Label>
              <Input id="invite-email" type="email" required placeholder="ada@samtechlabs.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-title">Role title (optional)</Label>
              <Input id="invite-title" placeholder="Operations Lead" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="invite-welcome">Welcome note (optional)</Label>
              <Textarea id="invite-welcome" placeholder="A short line that appears in the invitation email." value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={inviteBusy}>
                {inviteBusy ? "Sending…" : "Send invitation"}
              </Button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg text-ink">Team members ({members.length})</h2>
          <Input
            type="search"
            placeholder="Search by name or email…"
            className="h-10 max-w-64"
            aria-label="Search team"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.14em] text-black/45">
                <th className="px-4 py-2 font-semibold">Member</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Last sign-in</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isSelf={member.id === selfId}
                  onDone={(message) => setFeedback({ ok: true, message })}
                  onError={(message) => setFeedback({ ok: false, message })}
                />
              ))}
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-black/45">
                    No team members match “{query}”.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
        <h2 className="text-lg text-ink">Invitations ({filteredInvitations.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.14em] text-black/45">
                <th className="px-4 py-2 font-semibold">Invitee</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Sent</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvitations.map((invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onDone={(message) => setFeedback({ ok: true, message })}
                  onError={(message) => setFeedback({ ok: false, message })}
                />
              ))}
              {filteredInvitations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-black/45">
                    No invitations yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
