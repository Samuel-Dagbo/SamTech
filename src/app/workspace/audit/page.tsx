import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/session";
import { canUser } from "@/lib/auth/rbac";
import AuditLog from "@/models/audit-log";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit log",
  robots: { index: false, follow: false },
};

export default async function AuditPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/audit");
  }
  if (!canUser(auth.user, "audit.view")) {
    redirect("/workspace");
  }

  await connectDB();
  const entries = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean<{
      _id: { toString(): string };
      actorEmail?: string;
      action: string;
      targetType?: string;
      metadata?: Record<string, unknown>;
      ip?: string;
      createdAt?: Date;
    }[]>();

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Audit log</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          Append-only record of every sensitive action, most recent first (latest 100).
        </p>
      </header>

      <section className="overflow-x-auto rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.14em] text-black/45">
              <th className="px-3 py-2 font-semibold">When</th>
              <th className="px-3 py-2 font-semibold">Actor</th>
              <th className="px-3 py-2 font-semibold">Action</th>
              <th className="px-3 py-2 font-semibold">Target</th>
              <th className="px-3 py-2 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={String(entry._id)} className="border-b border-black/5">
                <td className="px-3 py-2 text-black/60">
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </td>
                <td className="px-3 py-2 text-black/70">{entry.actorEmail ?? "system"}</td>
                <td className="px-3 py-2 font-semibold text-ink">{entry.action}</td>
                <td className="px-3 py-2 text-black/60">{entry.targetType ?? "—"}</td>
                <td className="px-3 py-2 text-black/45">{entry.ip ?? "—"}</td>
              </tr>
            ))}
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-sm text-black/45">No audit entries yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
