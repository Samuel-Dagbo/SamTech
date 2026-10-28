import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { canUser } from "@/lib/auth/rbac";
import { listAnnouncements } from "@/lib/services/announcements";
import { AnnouncementManager } from "@/components/workspace/announcement-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Announcements",
  robots: { index: false, follow: false },
};

export default async function AnnouncementsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/announcements");
  }

  const manage = canUser(auth.user, "announcements.publish");
  const announcements = await listAnnouncements({
    role: auth.user.role,
    department: auth.user.department,
    manage,
  });

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Announcements</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          {manage
            ? "Post updates to everyone or to a single department."
            : "Updates from the founder, for everyone or your department."}
        </p>
      </header>
      <AnnouncementManager announcements={announcements} manage={manage} />
    </div>
  );
}
