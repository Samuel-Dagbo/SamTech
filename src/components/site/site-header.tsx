"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";

const linkBase =
  "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:bg-white/70 hover:text-ink hover:shadow-md active:scale-95";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = site.nav.map((item) => ({
    ...item,
    active: item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  }));

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 rounded-[28px] border border-black/10 bg-white/70 px-4 py-4 shadow-panel backdrop-blur xl:grid-cols-[auto_1fr_auto]">
        <span className="flex items-center gap-3">
          <Link
            href="/login"
            title="Staff login"
            aria-label="Staff login"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-base font-extrabold text-white transition-all duration-300 hover:scale-110 hover:shadow-md"
            onClick={() => setMobileOpen(false)}
          >
            S
          </Link>
          <Link href="/" className="min-w-0" onClick={() => setMobileOpen(false)}>
            <strong className="block text-base leading-none text-ink sm:text-lg">{site.name}</strong>
            <small className="block truncate pt-1 text-xs uppercase tracking-[0.18em] text-black/55 sm:text-[11px]">
              Full Stack Developer
            </small>
          </Link>
        </span>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/60 text-ink xl:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          aria-controls="site-nav"
          onClick={() => setMobileOpen((current) => !current)}
        >
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>

        <nav
          id="site-nav"
          className={`${mobileOpen ? "flex" : "hidden"} col-span-2 flex-col gap-2 xl:col-span-1 xl:flex xl:flex-row xl:items-center xl:justify-center`}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkBase} ${item.active ? "bg-white text-ink shadow-sm" : "text-black/60"}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          className={`${mobileOpen ? "col-span-2 flex" : "hidden"} items-center justify-center gap-2 xl:col-span-1 xl:flex`}
        >
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-black"
            onClick={() => setMobileOpen(false)}
          >
            Hire me
          </Link>
        </div>
      </div>
    </header>
  );
}
