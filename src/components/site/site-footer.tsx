import Link from "next/link";
import { site } from "@/lib/site";
import type { ProfileData } from "@/lib/types";

export function SiteFooter({ profile }: { profile: ProfileData }) {
  const email = profile.email || site.emailFallback;
  const socialCandidates = [
    ["GitHub", profile.githubUrl],
    ["LinkedIn", profile.linkedinUrl],
    ["X", profile.xUrl],
    ["Email", `mailto:${email}`],
  ] as Array<readonly [label: string, href: string | undefined]>;

  const socialLinks = socialCandidates.filter(
    (entry): entry is readonly [string, string] => Boolean(entry[1]),
  );

  return (
    <footer className="px-3 pb-6 pt-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6 rounded-[32px] border border-black/10 bg-ink px-6 py-8 text-[#f8f1e7] shadow-panel md:grid-cols-[1.2fr_0.7fr_0.8fr_0.8fr]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">
            {site.name}
          </span>
          <h3 className="mt-3 max-w-sm text-2xl leading-tight sm:text-3xl">
            Modern web and mobile products with strong backend engineering.
          </h3>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Pages</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Reach out</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <a href={`mailto:${email}`} className="break-all transition hover:text-white">
              {email}
            </a>
            <a
              href={`https://wa.me/${site.whatsappFallback.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              WhatsApp
            </a>
            <span>{profile.location || site.locationFallback}</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Socials</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            {socialLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="transition hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
