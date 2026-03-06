

import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
const buttonSecondary = "inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-black hover:text-white";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const token = localStorage.getItem("samtech_admin_token");

  const authFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Request failed");
    }
    return payload;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/messages`);
      const data = await res.json();
      setMessages(data.data || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/messages/${id}`, { method: "DELETE" });
      setStatus("Message deleted!");
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const markAsRead = async (id) => {
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/messages/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "read" })
      });
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const sortedMessages = [...messages].sort((a, b) => {
    // New first, then by date
    const statusOrder = { new: 0, read: 1, archived: 2 };
    const aOrder = statusOrder[a.status] ?? 0;
    const bOrder = statusOrder[b.status] ?? 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Contact Messages</p>
          <h3 className="mt-3 text-3xl text-ink">Inbox</h3>
        </div>
        <span className="text-sm font-semibold text-black/45">{messages.length} messages</span>
      </div>
      
      {status && (
        <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
          {status}
        </p>
      )}

      {sortedMessages.length === 0 ? (
        <div className="mt-8 py-12 text-center">
          <p className="text-lg text-black/55">No messages yet.</p>
          <p className="mt-2 text-sm text-black/40">Messages from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {sortedMessages.map((message) => (
            <article
              key={message._id}
              className={`rounded-[24px] border p-5 ${
                message.status === "new" || message.status === undefined
                  ? "border-forest/30 bg-forest/5"
                  : message.status === "archived"
                  ? "border-black/10 bg-white/30"
                  : "border-black/10 bg-white/50"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-ink">
                      {message.name || "Anonymous"}
                    </h4>
                    {(message.status === "new" || message.status === undefined) && (
                      <span className="rounded-full bg-forest px-2 py-0.5 text-xs text-white">New</span>
                    )}
                    {message.status === "read" && (
                      <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs text-black/55">Read</span>
                    )}
                    {message.status === "archived" && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/40">Archived</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-black/55">{message.email}</p>
                  {message.phone && (
                    <p className="text-sm text-black/45">Phone: {message.phone}</p>
                  )}
                  <p className="mt-3 text-sm leading-7 text-black/70">
                    {message.message}
                  </p>
                  <p className="mt-3 text-xs text-black/40">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                  {(message.status === "new" || message.status === undefined) && (
                    <button 
                      type="button" 
                      className={buttonSecondary}
                      onClick={() => markAsRead(message._id)}
                    >
                      Mark as read
                    </button>
                  )}
                  {message.status === "read" && (
                    <button 
                      type="button" 
                      className={buttonSecondary}
                      onClick={() => markAsRead(message._id)}
                    >
                      Archive
                    </button>
                  )}
                  <a 
                    href={`mailto:${message.email}?subject=Re: Your message`}
                    className={buttonSecondary}
                  >
                    Reply
                  </a>
                  <button 
                    type="button" 
                    className={buttonSecondary}
                    onClick={() => handleDelete(message._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


