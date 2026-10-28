import Link from "next/link";
import type { Metadata } from "next";
import { AcceptInvitationForm } from "@/components/auth/accept-invitation-form";
import { checkInvitationToken } from "@/lib/services/invitations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activate your account",
  robots: { index: false, follow: false },
};

const REASON_MESSAGES: Record<string, string> = {
  invalid: "This invitation link is not valid.",
  expired: "This invitation has expired. Ask the founder to resend it.",
  used: "This invitation was already used.",
  revoked: "This invitation was revoked by the founder.",
  "account-exists": "An account with this email already exists. Try signing in instead.",
};

type PageProps = { searchParams: Promise<{ token?: string }> };

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const check = token ? await checkInvitationToken(token) : null;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-black/10 bg-white/75 p-8 shadow-panel backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            SamTech Labs workspace
          </p>

          {check?.valid ? (
            <>
              <h1 className="mt-3 text-3xl leading-tight text-ink">
                Welcome, {check.invitation.name.split(" ")[0] || check.invitation.name}.
              </h1>
              <p className="mt-2 text-sm leading-7 text-black/60">
                You have been invited to join the SamTech Labs workspace
                {check.invitation.title ? ` as ${check.invitation.title}` : ""} (
                {check.invitation.roleLabel}). Choose a password to activate your account.
              </p>
              <p className="mt-3 rounded-2xl bg-sand/60 px-4 py-3 text-xs text-black/55">
                Expires {check.invitation.expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · single use ·
                linked to the invited email address
              </p>
              <div className="mt-6">
                <AcceptInvitationForm token={token!} />
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-3 text-3xl leading-tight text-ink">Invitation unavailable</h1>
              <p className="mt-3 text-sm leading-7 text-black/60">
                {check
                  ? (REASON_MESSAGES[check.reason] ?? "This invitation link is not valid.")
                  : "No invitation token was provided."}
              </p>
              <p className="mt-5 text-sm text-black/60">
                Ask the founder to send a new invitation, then open the fresh link from your email.
              </p>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-black/55">
          <Link href="/login" className="font-semibold text-forest underline-offset-4 hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </main>
  );
}
