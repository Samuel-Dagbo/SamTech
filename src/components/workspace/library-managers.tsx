"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export type ResourceItem = {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  addedByName?: string;
  createdAt?: Date | string;
};

export type MarketingItem = {
  id: string;
  title: string;
  channel: string;
  plannedFor?: string;
  notes?: string;
  status: "planned" | "in_progress" | "published" | "cancelled";
  createdByName?: string;
  createdAt?: Date | string;
};

const CATEGORIES = [
  { value: "client_brief", label: "Client brief" },
  { value: "brand_asset", label: "Brand asset" },
  { value: "template", label: "Template" },
  { value: "guide", label: "Guide" },
  { value: "other", label: "Other" },
];

const CHANNELS = ["whatsapp", "linkedin", "x", "instagram", "email", "blog", "other"];
const MARKETING_STATUSES = ["planned", "in_progress", "published", "cancelled"] as const;

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

function feedbackBox(feedback: { ok: boolean; message: string } | null) {
  if (!feedback) return null;
  return (
    <div
      role="status"
      className={`rounded-2xl border px-4 py-3 text-sm ${
        feedback.ok ? "border-forest/20 bg-forest/10 text-forest" : "border-clay/30 bg-clay/10 text-clay-strong"
      }`}
    >
      {feedback.message}
    </div>
  );
}

export function ResourcesManager({
  resources,
  canManage,
}: {
  resources: ResourceItem[];
  canManage: boolean;
}) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("other");
  const [busy, setBusy] = useState(false);

  async function addResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const message = await postApi("/api/workspace/resources", {
        title,
        description: description || undefined,
        url,
        category,
      });
      setFeedback({ ok: true, message });
      setTitle("");
      setDescription("");
      setUrl("");
      setCategory("other");
      window.location.reload();
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ResourceItem) {
    if (!window.confirm(`Remove "${item.title}" from the library?`)) return;
    setFeedback(null);
    try {
      const message = await postApi(`/api/workspace/resources/${item.id}`, {});
      setFeedback({ ok: true, message });
      window.location.reload();
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  return (
    <div className="grid gap-6">
      {feedbackBox(feedback)}
      {canManage ? (
        <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg text-ink">Shared resource library</h2>
            <Button size="sm" variant="outline" onClick={() => setShowForm((open) => !open)} aria-expanded={showForm}>
              {showForm ? "Close" : "Add resource"}
            </Button>
          </div>
          {showForm ? (
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={addResource} noValidate>
              <div className="grid gap-1.5">
                <Label htmlFor="resource-title">Title</Label>
                <Input id="resource-title" required minLength={2} placeholder="Client onboarding brief" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="resource-category">Category</Label>
                <select id="resource-category" className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="resource-url">URL (https)</Label>
                <Input id="resource-url" type="url" required placeholder="https://drive.google.com/…" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="resource-description">Notes (optional)</Label>
                <Textarea id="resource-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy}>{busy ? "Adding…" : "Add resource"}</Button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-3">
        {resources.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-panel">
            <span className="rounded-full border border-black/10 bg-sand px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink/70">{item.category}</span>
            <div className="min-w-0 flex-1">
              <strong className="text-sm text-ink">{item.title}</strong>
              {item.description ? <p className="text-xs text-black/50">{item.description}</p> : null}
              <a href={item.url} target="_blank" rel="noreferrer" className="block max-w-full truncate text-xs text-clay-strong hover:underline">{item.url}</a>
            </div>
            <span className="text-xs text-black/40">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
              {item.addedByName ? ` · ${item.addedByName}` : ""}
            </span>
            {canManage ? (
              <Button size="sm" variant="ghost" onClick={() => remove(item)}>Remove</Button>
            ) : null}
          </article>
        ))}
        {resources.length === 0 ? (
          <p className="rounded-2xl border border-black/10 bg-white/70 px-4 py-8 text-center text-sm text-black/45 shadow-panel">
            No resources yet.
          </p>
        ) : null}
      </section>
    </div>
  );
}

export function MarketingManager({
  entries,
  canManage,
}: {
  entries: MarketingItem[];
  canManage: boolean;
}) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [plannedFor, setPlannedFor] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const message = await postApi("/api/workspace/marketing", {
        title,
        channel,
        plannedFor: plannedFor || undefined,
        notes: notes || undefined,
      });
      setFeedback({ ok: true, message });
      setTitle("");
      setPlannedFor("");
      setNotes("");
      window.location.reload();
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  async function act(item: MarketingItem, body: Record<string, unknown>) {
    setFeedback(null);
    try {
      const message = await postApi(`/api/workspace/marketing/${item.id}`, body);
      setFeedback({ ok: true, message });
      window.location.reload();
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  return (
    <div className="grid gap-6">
      {feedbackBox(feedback)}
      {canManage ? (
        <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg text-ink">Marketing calendar</h2>
            <Button size="sm" variant="outline" onClick={() => setShowForm((open) => !open)} aria-expanded={showForm}>
              {showForm ? "Close" : "Plan entry"}
            </Button>
          </div>
          {showForm ? (
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={addEntry} noValidate>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="marketing-title">Title</Label>
                <Input id="marketing-title" required minLength={2} placeholder="WhatsApp status: October promo" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="marketing-channel">Channel</Label>
                <select id="marketing-channel" className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink capitalize" value={channel} onChange={(e) => setChannel(e.target.value)}>
                  {CHANNELS.map((value) => (
                    <option key={value} value={value} className="capitalize">{value}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="marketing-date">Planned for</Label>
                <Input id="marketing-date" type="date" value={plannedFor} onChange={(e) => setPlannedFor(e.target.value)} />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="marketing-notes">Notes (optional)</Label>
                <Textarea id="marketing-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={busy}>{busy ? "Planning…" : "Plan entry"}</Button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-3">
        {entries.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-panel">
            <span className="rounded-full border border-black/10 bg-sand px-2.5 py-0.5 text-[10px] font-bold uppercase text-ink/70">{item.channel}</span>
            <div className="min-w-0 flex-1">
              <strong className="text-sm text-ink">{item.title}</strong>
              {item.notes ? <p className="text-xs text-black/50">{item.notes}</p> : null}
              <p className="text-xs text-black/40">
                {item.plannedFor ? new Date(item.plannedFor).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No date"}
                {item.createdByName ? ` · by ${item.createdByName}` : ""}
              </p>
            </div>
            <span className="rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase text-black/55">{item.status.replace("_", " ")}</span>
            {canManage ? (
              <div className="flex flex-wrap gap-1.5">
                {MARKETING_STATUSES.filter((status) => status !== item.status).map((status) => (
                  <Button key={status} size="sm" variant="outline" onClick={() => act(item, { action: "set-status", status })}>
                    {status.replace("_", " ")}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm(`Delete "${item.title}"?`)) {
                      act(item, { action: "delete" });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </article>
        ))}
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-black/10 bg-white/70 px-4 py-8 text-center text-sm text-black/45 shadow-panel">
            Nothing planned yet.
          </p>
        ) : null}
      </section>
    </div>
  );
}
