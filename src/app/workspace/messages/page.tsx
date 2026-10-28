import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { canUser } from "@/lib/auth/rbac";
import { listMessages } from "@/lib/services/messages";
import { InboxManager, type MessageItem } from "@/components/workspace/inbox-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/messages");
  }
  if (!canUser(auth.user, "messages.manage")) {
    redirect("/workspace");
  }

  const messages = await listMessages();
  const items: MessageItem[] = messages.map((message) => ({ ...message }));

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Contact inbox</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          Every inquiry submitted through the website form lands here. Replying by email is
          one click away.
        </p>
      </header>
      <InboxManager messages={items} contactEmail={auth.user.email} />
    </div>
  );
}
