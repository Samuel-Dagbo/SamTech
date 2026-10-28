"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type MessageItem = {
  id: string;
  name: string;
  email: string;
  subject?: string;
  phone?: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  repliedAt?: Date | string;
  createdAt?: Date | string;
};

const STATUS_STYLES: Record<MessageItem["status"], string> = {
  new: "bg-clay/10 text-clay-strong border-clay/20",
  read: "bg-amber-100 text-amber-900 border-amber-200",
  replied: "bg-forest/10 text-forest border-forest/20",
  archived: "bg-black/5 text-black/50 border-black/10",
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

function MessageCard({
  message,
  onFeedback,
}: {
  message: MessageItem;
  onFeedback: (ok: boolean, message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(message.status === "new");

  async function act(action: "mark-read" | "mark-replied" | "archive" | "delete") {
    if (action === "delete" && !window.confirm("Delete this message? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    try {
      const result = await postApi(`/api/workspace/messages/${message.id}`, { action });
      onFeedback(true, result);
      window.location.reload();
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`rounded-2xl border p-4 shadow-panel ${message.status === "new" ? "border-clay/40 bg-clay/5" : "border-black/10 bg-white"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-sm text-ink">{message.name}</strong>
        <span className="text-xs text-black/50">{message.email}</span>
        {message.phone ? <span className="text-xs text-black/40">· {message.phone}</span> : null}
        <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[message.status]}`}>
          {message.status}
        </span>
      </div>
      {message.subject ? <p className="mt-1 text-sm font-semibold text-ink">{message.subject}</p> : null}
      <p className="mt-1 text-xs text-black/40">
        {message.createdAt ? new Date(message.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
      </p>
      {open ? (
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-black/70">{message.message}</p>
      ) : (
        <button type="button" className="mt-2 text-xs font-semibold text-clay-strong hover:underline" onClick={() => setOpen(true)}>
          Show message
        </button>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {message.status === "new" ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => act("mark-read")}>
            Mark read
          </Button>
        ) : null}
        <Button size="sm" variant="outline" disabled={busy} onClick={() => act("mark-replied")}>
          Mark replied
        </Button>
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "your message"}`)}`}
          className="inline-flex h-8 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-xs font-semibold text-ink transition hover:bg-black hover:text-white"
        >
          Reply by email
        </a>
        {message.status !== "archived" ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => act("archive")}>
            Archive
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => act("delete")}>
          Delete
        </Button>
      </div>
    </article>
  );
}

export function InboxManager({
  messages,
  contactEmail,
}: {
  messages: MessageItem[];
  contactEmail: string;
}) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [filter, setFilter] = useState<"all" | MessageItem["status"]>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((message) => {
      if (filter !== "all" && message.status !== filter) return false;
      if (!q) return true;
      return (
        message.name.toLowerCase().includes(q) ||
        message.email.toLowerCase().includes(q) ||
        (message.subject ?? "").toLowerCase().includes(q) ||
        message.message.toLowerCase().includes(q)
      );
    });
  }, [messages, filter, query]);

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

      <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(["all", "new", "read", "replied", "archived"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === value
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 bg-white text-black/60 hover:border-black/25"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <Input
            type="search"
            placeholder="Search inbox…"
            className="h-10 max-w-56"
            aria-label="Search inbox"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-3">
          {visible.map((message) => (
            <MessageCard key={message.id} message={message} onFeedback={(ok, result) => setFeedback({ ok, message: result })} />
          ))}
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-black/10 bg-white px-4 py-8 text-center text-sm text-black/45">
              Inbox is empty.
            </p>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-black/40">Contact address on file: {contactEmail}</p>
      </section>
    </div>
  );
}
