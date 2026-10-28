import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-black/10 bg-white/75 p-8 shadow-panel backdrop-blur">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-base font-extrabold text-white">
            S
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            SamTech Labs workspace
          </p>
          <h1 className="mt-3 text-3xl leading-tight text-ink">Sign in to your account</h1>
          <p className="mt-2 text-sm leading-7 text-black/60">
            Internal access only. Team members sign in with the email address their invitation was
            sent to.
          </p>

          <div className="mt-6">
            <Suspense fallback={<div className="h-64 rounded-2xl bg-black/5" aria-hidden="true" />}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-4 text-center text-sm text-black/55">
            <Link href="/forgot-password" className="font-semibold text-forest underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
        <p className="mt-4 text-center text-sm text-black/55">
          Looking for the public site?{" "}
          <Link href="/" className="font-semibold text-forest underline-offset-4 hover:underline">
            Go to samtechlabs
          </Link>
        </p>
      </div>
    </main>
  );
}
