"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/lib/auth/rbac";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "secretary" | "marketing" | "developer" | "tester";
  pinned: boolean;
  retired: boolean;
  authorName?: string;
  createdAt?: Date | string;
};

const AUDIENCE_STYLES: Record<Announcement["audience"], string> = {
  all: "bg-forest/10 text-forest border-forest/20",
  secretary: "bg-sand text-ink/70 border-black/10",
  marketing: "bg-clay/10 text-clay-strong border-clay/20",
  developer: "bg-black/5 text-ink/70 border-black/10",
  tester: "bg-black/5 text-ink/70 border-black/10",
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

function audienceLabel(value: Announcement["audience"]): string {
  if (value === "all") return "Everyone";
  return DEPARTMENT_LABELS[value as keyof typeof DEPARTMENT_LABELS] ?? value;
}

function AnnouncementCard({
  announcement,
  manage,
  onFeedback,
}: {
  announcement: Announcement;
  manage: boolean;
  onFeedback: (ok: boolean, message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const message = await postApi(`/api/workspace/announcements/${announcement.id}`, body);
      onFeedback(true, message);
      window.location.reload();
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`rounded-2xl border p-5 shadow-panel ${announcement.pinned ? "border-clay/40 bg-clay/5" : "border-black/10 bg-white"}`}>
      <div className="flex flex-wrap items-center gap-2">
        {announcement.pinned ? <span className="rounded-full border border-clay/30 bg-clay/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-clay-strong">pinned</span> : null}
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${AUDIENCE_STYLES[announcement.audience]}`}>
          {audienceLabel(announcement.audience)}
        </span>
        {announcement.retired ? <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-0.5 text-[10px] font-bold uppercase text-black/50">retired</span> : null}
        <span className="ml-auto text-xs text-black/40">
          {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
          {announcement.authorName ? ` · ${announcement.authorName}` : ""}
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-ink">{announcement.title}</h3>
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-black/60">{announcement.body}</p>
      {manage ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => act({ action: "set-pin", pinned: !announcement.pinned })}>
            {announcement.pinned ? "Unpin" : "Pin"}
          </Button>
          {announcement.retired ? (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => act({ action: "restore" })}>
              Restore
            </Button>
          ) : (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => act({ action: "retire" })}>
              Retire
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              if (window.confirm(`Delete "${announcement.title}"? This cannot be undone.`)) {
                act({ action: "delete" });
              }
            }}
          >
            Delete
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function AnnouncementManager({
  announcements,
  manage,
}: {
  announcements: Announcement[];
  manage: boolean;
}) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("all");
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);

  async function postAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const message = await postApi("/api/workspace/announcements", {
        title,
        body,
        audience,
        pinned,
      });
      setFeedback({ ok: true, message });
      setTitle("");
      setBody("");
      setAudience("all");
      setPinned(false);
      setShowForm(false);
      window.location.reload();
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  const visible = announcements.filter((announcement) => manage || !announcement.retired);

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

      {manage ? (
        <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg text-ink">Post an announcement</h2>
            <Button variant="outline" size="sm" onClick={() => setShowForm((open) => !open)} aria-expanded={showForm}>
              {showForm ? "Hide form" : "New announcement"}
            </Button>
          </div>
          {showForm ? (
            <form className="mt-5 grid gap-4" onSubmit={postAnnouncement} noValidate>
              <div className="grid gap-1.5">
                <Label htmlFor="announcement-title">Title</Label>
                <Input id="announcement-title" required minLength={2} placeholder="Clinic closed on Friday" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="announcement-body">Message</Label>
                <Textarea id="announcement-body" required rows={5} placeholder="Write the update…" value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="announcement-audience">Audience</Label>
                  <select
                    id="announcement-audience"
                    className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as Announcement["audience"])}
                  >
                    <option value="all">Everyone</option>
                    {DEPARTMENTS.map((department) => (
                      <option key={department} value={department}>
                        {DEPARTMENT_LABELS[department]}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 pb-2.5 text-sm text-ink">
                  <input type="checkbox" className="h-4 w-4 accent-forest" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                  Pin to top
                </label>
                <Button type="submit" disabled={busy}>
                  {busy ? "Posting…" : "Post announcement"}
                </Button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}

      <div className="grid gap-4">
        {visible.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            manage={manage}
            onFeedback={(ok, message) => setFeedback({ ok, message })}
          />
        ))}
        {visible.length === 0 ? (
          <p className="rounded-[28px] border border-black/10 bg-white/70 px-6 py-10 text-center text-sm text-black/45 shadow-panel">
            No announcements yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
