import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-black/10 bg-white/75 p-8 shadow-panel backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            SamTech Labs workspace
          </p>
          <h1 className="mt-3 text-3xl leading-tight text-ink">Set a new password</h1>
          {token ? (
            <>
              <p className="mt-2 text-sm leading-7 text-black/60">
                Choose a strong new password for your account. All other sessions will be signed out.
              </p>
              <div className="mt-6">
                <ResetPasswordForm token={token} />
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm leading-7 text-black/60">
              This link is missing its token. Open the latest reset email and use its button, or
              request a new link.
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-black/55">
          <Link href="/forgot-password" className="font-semibold text-forest underline-offset-4 hover:underline">
            Request a new reset link
          </Link>
        </p>
      </div>
    </main>
  );
}
