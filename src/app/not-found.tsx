import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-lg rounded-[32px] border border-black/10 bg-white/75 p-8 text-center shadow-panel backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">404</p>
        <h1 className="mt-3 text-4xl text-ink">This page took a wrong turn.</h1>
        <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
