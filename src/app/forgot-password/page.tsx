import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-black/10 bg-white/75 p-8 shadow-panel backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            SamTech Labs workspace
          </p>
          <h1 className="mt-3 text-3xl leading-tight text-ink">Reset your password</h1>
          <p className="mt-2 text-sm leading-7 text-black/60">
            Enter the email linked to your workspace account and we&rsquo;ll send a single-use reset
            link.
          </p>
          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-black/55">
          <Link href="/login" className="font-semibold text-forest underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
