import { Link } from "react-router-dom";

function buildWhatsAppLink(whatsappNumber, message) {
  const cleanNumber = whatsappNumber?.replace(/\D/g, "") || "233550624203";
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

const cardClass =
  "rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel backdrop-blur";

export default function HomePage({ content }) {
  const featuredProjects = content.projects.filter((project) => project.featured);

  return (
    <main className="px-3 pb-6 pt-6 sm:px-6 sm:pt-8">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className={`${cardClass} overflow-hidden`}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Full stack web developer | MERN engineer | React Native builder
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl leading-none text-ink sm:text-6xl lg:text-7xl">
            Building modern websites and digital products that look sharp, work fast, and scale well.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-black/65 sm:text-lg">
            {content.profile.tagline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/work"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
            >
              Explore projects
            </Link>
            <a
              href={buildWhatsAppLink(content.profile.whatsapp, "Hello SamTech, I want to discuss a new project.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/60 px-6 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Talk on WhatsApp
            </a>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              [content.profile.yearsExperience, "Years shipping products"],
              ["Business to Custom", "Corporate sites, platforms, landing pages, and more"],
              ["Web + Mobile", "React, Node.js, MongoDB, and React Native"]
            ].map(([title, copy]) => (
              <article key={title} className="rounded-[24px] border border-black/10 bg-white/65 p-4">
                <strong className="block text-lg text-ink">{title}</strong>
                <span className="mt-2 block text-sm leading-6 text-black/55">{copy}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          {content.profile.heroImage ? (
            <div className="relative min-h-[26rem] overflow-hidden rounded-[32px] border border-black/10 bg-forest shadow-panel sm:min-h-[34rem]">
              <img
                src={content.profile.heroImage}
                alt={`${content.profile.name} portrait`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="grid min-h-[26rem] place-items-center rounded-[32px] border border-black/10 bg-gradient-to-br from-forest to-[#12201d] p-8 text-[#f8f1e7] shadow-panel sm:min-h-[34rem]">
              <div className="max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">
                  Front page image
                </p>
                <h3 className="mt-3 text-3xl leading-tight">
                  Upload your own hero image from the admin dashboard.
                </h3>
              </div>
            </div>
          )}

          <div className={cardClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Current focus</p>
            <h3 className="mt-3 text-2xl leading-tight text-ink">
              Creating high-quality digital experiences for businesses, brands, startups, and growing teams.
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <strong className="text-sm uppercase tracking-[0.16em] text-ink">Websites</strong>
                <span className="mt-2 block text-sm leading-6 text-black/55">
                  Business websites, portfolio sites, landing pages, dashboards, and tailored web experiences.
                </span>
              </div>
              <div>
                <strong className="text-sm uppercase tracking-[0.16em] text-ink">Products</strong>
                <span className="mt-2 block text-sm leading-6 text-black/55">
                  Full stack platforms with strong backend systems, clean user flows, and dependable performance.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-4 md:grid-cols-3">
        {[
          ["What I build", "Business websites, custom web platforms, landing pages, mobile apps, and scalable digital products."],
          ["How I think", "Presentation matters, but structure and maintainability matter just as much."],
          ["Why clients hire me", "I can handle both the interface people see and the backend system that runs it."]
        ].map(([title, copy]) => (
          <article key={title} className={`${cardClass} p-5 sm:p-6`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{title}</p>
            <h3 className="mt-3 text-xl leading-tight text-ink sm:text-2xl">{copy}</h3>
          </article>
        ))}
      </section>

      {/* Featured Clients/Brands Section */}
      {(content.profile.brands || []).length > 0 && (
        <section className="mx-auto mt-8 max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
              Trusted by
            </span>
            <h2 className="mt-3 text-3xl leading-none text-ink sm:text-4xl">
              Brands and businesses I've worked with
            </h2>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {content.profile.brands.map((brand, index) => (
              <div
                key={`${brand}-${index}`}
                className="flex items-center justify-center rounded-[22px] border border-black/10 bg-white/70 px-6 py-4 shadow-panel backdrop-blur"
              >
                <span className="text-lg font-semibold text-ink">{brand}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Social Links Section */}
      <section className="mx-auto mt-8 max-w-7xl">
        <div className="grid gap-5 rounded-[32px] border border-black/10 bg-white/70 p-6 shadow-panel backdrop-blur md:grid-cols-2 lg:p-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Connect</span>
            <h3 className="mt-3 text-3xl leading-tight text-ink sm:text-4xl">
              Let's build something together
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-black/60 sm:text-base">
              Feel free to reach out for project inquiries, collaborations, or just to say hello.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {content.profile.githubUrl && (
                <a
                  href={content.profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                >
                  GitHub
                </a>
              )}
              {content.profile.linkedinUrl && (
                <a
                  href={content.profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                >
                  LinkedIn
                </a>
              )}
              {content.profile.xUrl && (
                <a
                  href={content.profile.xUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                >
                  X
                </a>
              )}
              {content.profile.email && (
                <a
                  href={`mailto:${content.profile.email}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                >
                  Email
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-semibold text-white transition hover:bg-black"
            >
              Get in touch
            </Link>
            {content.profile.resumeUrl && (
              <a
                href={content.profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-8 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
              >
                Download CV
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Selected work
          </span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            Selected projects across different industries, business needs, and product types.
          </h2>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {(featuredProjects.length ? featuredProjects : content.projects).map((project) => (
            <article
              key={project._id}
              className="overflow-hidden rounded-[28px] border border-black/10 bg-white/75 shadow-panel"
            >
              <img src={project.image} alt={project.title} className="h-64 w-full object-cover sm:h-72" />
              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">
                  {project.category}
                </p>
                <h3 className="mt-3 text-2xl text-ink">{project.title}</h3>
                <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">{project.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/work/${project.slug}`}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      View case study
                    </Link>
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                      >
                        Visit site
                      </a>
                    ) : (
                      <span className="inline-flex h-11 items-center text-sm text-black/45">Live link coming soon</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-5 lg:grid-cols-[1fr_auto]">
        <article className={`${cardClass} p-6 sm:p-8`}>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Next step</span>
          <h2 className="mt-3 max-w-3xl text-3xl leading-tight text-ink sm:text-4xl">
            Need a business website, custom platform, admin dashboard, or mobile-ready product?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-black/65 sm:text-base">
            I build for businesses and teams that need more than a good-looking interface. The goal is a product
            that is clear, useful, and structured well enough to grow.
          </p>
          <Link
            to="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
          >
            Start a project
          </Link>
        </article>
        <div className="flex flex-col gap-3 self-end">
          
          {content.profile.resumeUrl ? (
            <a
              href={content.profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
            >
              Download CV
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
