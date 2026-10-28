"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  GRANTABLE_SCOPES,
  ROLE_LABELS,
  type Role,
} from "@/lib/auth/rbac";

const SCOPE_LABELS: Record<(typeof GRANTABLE_SCOPES)[number], string> = {
  "tasks.manage": "Tasks",
  "announcements.publish": "Announcements",
  "resources.manage": "Resources",
  "marketing.manage": "Marketing calendar",
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  status: "active" | "suspended";
  department?: string;
  scopes: string[];
  lastLoginAt?: string;
  createdAt?: string;
};

export type Invitation = {
  id: string;
  email: string;
  name: string;
  title?: string;
  role: Role;
  department?: string;
  scopes: string[];
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

function departmentLabel(value?: string): string {
  if (!value) return "—";
  return DEPARTMENT_LABELS[value as keyof typeof DEPARTMENT_LABELS] ?? value;
}

function ScopesEditor({
  scopes,
  disabled,
  onToggle,
}: {
  scopes: string[];
  disabled: boolean;
  onToggle: (scope: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {GRANTABLE_SCOPES.map((scope) => {
        const checked = scopes.includes(scope);
        return (
          <label
            key={scope}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              checked
                ? "border-forest/30 bg-forest/10 text-forest"
                : "border-black/10 bg-white text-black/60 hover:border-black/20"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-forest"
              checked={checked}
              disabled={disabled}
              onChange={() => onToggle(scope)}
            />
            {SCOPE_LABELS[scope]}
          </label>
        );
      })}
    </div>
  );
}

function InvitationRow({ invitation, onDone, onError }: { invitation: Invitation; onDone: (message: string) => void; onError: (message: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function act(action: "resend" | "revoke") {
    if (action === "revoke" && !window.confirm(`Revoke the pending invitation for ${invitation.email}? The link will stop working immediately.`)) {
      return;
    }
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
      <td className="px-4 py-3 text-black/60">
        {ROLE_LABELS[invitation.role]}
        {invitation.department ? <span className="block text-xs text-black/45">{departmentLabel(invitation.department)}</span> : null}
      </td>
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
  const [accessOpen, setAccessOpen] = useState(false);
  const [draftScopes, setDraftScopes] = useState<string[]>(member.scopes);

  async function act(action: "suspend" | "reactivate" | "change-role" | "send-password-reset", role?: Role) {
    if (action === "suspend" && !window.confirm(`Suspend ${member.name}? Their sessions end immediately and they cannot sign in.`)) {
      return;
    }
    if (action === "change-role" && role === "founder" && !window.confirm(`Promote ${member.name} to Founder? Founders hold full access to everything, including this team page.`)) {
      return;
    }
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

  async function saveDepartment(department: string) {
    setBusy("set-department");
    try {
      const result = await postApi(`/api/workspace/team/${member.id}`, {
        action: "set-department",
        department: department || undefined,
      });
      onDone(result.message ?? "Done.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  async function saveScopes() {
    setBusy("set-scopes");
    try {
      const result = await postApi(`/api/workspace/team/${member.id}`, {
        action: "set-scopes",
        scopes: draftScopes,
      });
      onDone(result.message ?? "Done.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  function toggleDraftScope(scope: string) {
    setDraftScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope],
    );
  }

  return (
    <>
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
          <select
            aria-label={`Department for ${member.name}`}
            className="rounded-xl border border-black/10 bg-white px-2 py-1.5 text-sm text-ink disabled:opacity-50"
            value={member.department ?? ""}
            disabled={member.role === "founder" || busy !== null}
            onChange={(event) => saveDepartment(event.target.value)}
          >
            <option value="">Not set</option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {DEPARTMENT_LABELS[department]}
              </option>
            ))}
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
            {member.role !== "founder" ? (
              <Button size="sm" variant={accessOpen ? "outline" : "ghost"} disabled={busy !== null} aria-expanded={accessOpen} onClick={() => setAccessOpen((open) => !open)}>
                Access ({member.scopes.length})
              </Button>
            ) : null}
            {isSelf ? null : member.status === "active" ? (
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
      {accessOpen && member.role !== "founder" ? (
        <tr className="border-b border-black/5 bg-sand/40 text-sm">
          <td colSpan={6} className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">Module access</p>
            <div className="mt-2 grid gap-3">
              <ScopesEditor scopes={draftScopes} disabled={busy !== null} onToggle={toggleDraftScope} />
              <div className="flex gap-2">
                <Button size="sm" disabled={busy !== null} onClick={saveScopes}>
                  {busy === "set-scopes" ? "Saving…" : "Save access"}
                </Button>
                <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => setDraftScopes(member.scopes)}>
                  Reset
                </Button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function TeamManager({ members, invitations, selfId }: { members: TeamMember[]; invitations: Invitation[]; selfId: string }) {
  const [showInviteForm, setShowInviteForm] = useState(invitations.filter((i) => i.status === "pending").length === 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
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
        department: department || undefined,
        scopes,
        welcomeMessage: welcomeMessage || undefined,
      });
      setFeedback({ ok: true, message: result.message ?? "Invitation sent." });
      setName("");
      setEmail("");
      setTitle("");
      setDepartment("");
      setScopes([]);
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

  function toggleInviteScope(scope: string) {
    setScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope],
    );
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
              <Label htmlFor="invite-department">Department</Label>
              <select
                id="invite-department"
                className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Not set</option>
                {DEPARTMENTS.map((value) => (
                  <option key={value} value={value}>
                    {DEPARTMENT_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>Module access (optional)</Label>
              <ScopesEditor scopes={scopes} disabled={inviteBusy} onToggle={toggleInviteScope} />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
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
          <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.14em] text-black/45">
                <th className="px-4 py-2 font-semibold">Member</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Department</th>
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
                  <td colSpan={6} className="px-4 py-6 text-sm text-black/45">
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
