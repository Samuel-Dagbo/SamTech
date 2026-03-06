import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/work", label: "Work" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" }
];

const linkBase =
  "rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/70 hover:text-ink";

export default function SiteLayout({ content }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [brandTapCount, setBrandTapCount] = useState(0);

  const handleSecretTrigger = () => {
    setBrandTapCount((current) => {
      const next = current + 1;
      if (next >= 4) {
        setAccessOpen(true);
        return 0;
      }
      return next;
    });
  };

  const handleAccessSubmit = (event) => {
    event.preventDefault();
    if (!accessKey.trim()) {
      return;
    }
    setAccessOpen(false);
    navigate(`/portal/${accessKey.trim()}`);
  };

  const profile = content?.profile || {};
  const socialLinks = [
    ["GitHub", profile.githubUrl],
    ["LinkedIn", profile.linkedinUrl],
    ["X", profile.xUrl],
    ["Email", profile.email ? `mailto:${profile.email}` : ""]
  ].filter(([, href]) => href);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 rounded-[28px] border border-black/10 bg-white/70 px-4 py-4 shadow-panel backdrop-blur xl:grid-cols-[auto_1fr_auto]">
          <NavLink to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-base font-extrabold text-white">
              S
            </span>
            <span className="min-w-0">
              <strong className="block text-base leading-none text-ink sm:text-lg">SamTech</strong>
              <small className="block truncate pt-1 text-xs uppercase tracking-[0.18em] text-black/55 sm:text-[11px]">
                Full Stack Developer
              </small>
            </span>
          </NavLink>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/60 text-ink xl:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <nav
            className={`${mobileOpen ? "flex" : "hidden"} col-span-2 flex-col gap-2 xl:col-span-1 xl:flex xl:flex-row xl:items-center xl:justify-center`}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? "bg-white text-ink shadow-sm" : "text-black/60"}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/contact"
            className={`${mobileOpen ? "col-span-2 flex" : "hidden"} items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-black xl:flex`}
            onClick={() => setMobileOpen(false)}
          >
            Hire me
          </NavLink>
        </div>
      </header>

      <Outlet />

      <section className="px-3 pt-8 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-[32px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Call to action</span>
            <h3 className="mt-3 max-w-3xl text-3xl leading-tight text-ink sm:text-4xl">
              Need a website or product that feels deliberate and works properly behind the scenes?
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-black/65 sm:text-base">
              I build for businesses, founders, and teams that need clean frontend execution with a strong backend foundation.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <NavLink
              to="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              Start a conversation
            </NavLink>
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
              >
                Download CV
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="px-3 pb-6 pt-10 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl gap-6 rounded-[32px] border border-black/10 bg-[#171411] px-6 py-8 text-[#f8f1e7] shadow-panel md:grid-cols-[1.2fr_0.7fr_0.8fr]">
          <div>
            <button type="button" className="bg-transparent p-0 text-left" onClick={handleSecretTrigger}>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">
                SamTech
              </span>
            </button>
            <h3 className="mt-3 max-w-sm text-2xl leading-tight sm:text-3xl">
              Modern web and mobile products with strong backend engineering.
            </h3>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Pages</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="transition hover:text-white">
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Reach out</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
              <a href={`mailto:${profile.email || "samueldagbo50@gmail.com"}`} className="transition hover:text-white">
                {profile.email || "samueldagbo50@gmail.com"}
              </a>
              <a href="https://wa.me/233550624203" target="_blank" rel="noreferrer" className="transition hover:text-white">
                WhatsApp
              </a>
              <span>{profile.location || "Accra, Ghana"}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Socials</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
              {socialLinks.map(([label, href]) => (
                <a key={label} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noreferrer"} className="transition hover:text-white">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {accessOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm"
          onClick={() => setAccessOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] border border-black/10 bg-[#fffaf2] p-6 shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Private access</p>
            <h3 className="mt-3 text-2xl text-ink">Enter your private key</h3>
            <p className="mt-3 text-sm leading-7 text-black/60">
              Use your hidden access word here and the site will take you to the admin login.
            </p>
            <form className="mt-5 grid gap-3" onSubmit={handleAccessSubmit}>
              <input
                type="text"
                placeholder="Private key"
                value={accessKey}
                onChange={(event) => setAccessKey(event.target.value)}
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-0 placeholder:text-black/35 focus:border-forest"
              />
              <button type="submit" className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black">
                Continue
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
