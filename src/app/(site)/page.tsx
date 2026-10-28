import { ButtonLink } from "@/components/ui/button";
import { getPublicContent } from "@/lib/content";
import { whatsappLink } from "@/lib/site";
import type { ProfileData, ProjectData, TestimonialData } from "@/lib/types";

const cardClass =
  "rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel backdrop-blur transition-all duration-300 hover:shadow-lg";

function StarRow() {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="h-5 w-5 text-clay" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <article className={cardClass}>
      <StarRow />
      <p className="mt-4 text-base leading-7 text-black/70">&ldquo;{testimonial.quote}&rdquo;</p>
      <div className="mt-6 flex items-center gap-3">
        {testimonial.image ? (
           
          <img src={testimonial.image} alt={testimonial.name ?? ""} className="h-auto w-12 rounded-full" />
        ) : null}
        <div>
          <strong className="block text-sm font-semibold text-ink">{testimonial.name}</strong>
          {testimonial.company ? <span className="block text-xs text-black/55">{testimonial.company}</span> : null}
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white/75 shadow-panel transition-all duration-300 hover:-translate-y-2 hover:shadow-lift">
      {project.image ? (
        <div className="overflow-hidden">
          { }
          <img src={project.image} alt={project.title ?? ""} className="h-auto w-full" />
        </div>
      ) : null}
      <div className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">{project.category}</p>
        <h3 className="mt-3 text-2xl text-ink">{project.title}</h3>
        <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(project.stack ?? []).map((item) => (
            <span
              key={item}
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/60 transition-colors hover:bg-forest hover:text-white"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={`/work/${project.slug}`}>View case study</ButtonLink>
          {project.liveUrl ? (
            <ButtonLink href={project.liveUrl} variant="outline" external>
              Visit site
            </ButtonLink>
          ) : (
            <span className="inline-flex h-11 items-center text-sm text-black/45">Live link coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

function HeroProfileTile({ profile }: { profile: ProfileData }) {
  if (profile.heroImage) {
    return (
      <div className="overflow-hidden rounded-[32px] border border-black/10 bg-forest shadow-panel">
        { }
        <img src={profile.heroImage} alt={`${profile.name ?? "SamTech"} portrait`} className="h-auto w-full" />
      </div>
    );
  }
  return (
    <div className="grid min-h-[26rem] place-items-center rounded-[32px] border border-black/10 bg-gradient-to-br from-forest to-forest-deep p-8 text-[#f8f1e7] shadow-panel sm:min-h-[34rem]">
      <div className="max-w-xs">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">Front page image</p>
        <h3 className="mt-3 text-3xl leading-tight">Upload your own hero image from the admin dashboard.</h3>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const { profile, projects, testimonials } = await getPublicContent();
  const featuredProjects = projects.filter((project) => project.featured);

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
          <p className="mt-5 max-w-2xl text-base leading-8 text-black/65 sm:text-lg">{profile.tagline}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/work" size="lg">
              Explore projects
            </ButtonLink>
            <ButtonLink
              href={whatsappLink(profile.whatsapp, "Hello SamTech, I want to discuss a new project.")}
              variant="outline"
              size="lg"
              external
            >
              Talk on WhatsApp
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              [profile.yearsExperience || "5+", "Years shipping products"],
              ["Business to Custom", "Corporate sites, platforms, landing pages, and more"],
              ["Web + Mobile", "React, Node.js, MongoDB, and React Native"],
            ].map(([title, copy]) => (
              <article
                key={title}
                className="rounded-[24px] border border-black/10 bg-white/65 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <strong className="block text-lg text-ink">{title}</strong>
                <span className="mt-2 block text-sm leading-6 text-black/55">{copy}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <HeroProfileTile profile={profile} />

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
          ["Why clients hire me", "I can handle both the interface people see and the backend system that runs it."],
        ].map(([title, copy]) => (
          <article key={title} className={`${cardClass} p-5 sm:p-6`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{title}</p>
            <h3 className="mt-3 text-xl leading-tight text-ink sm:text-2xl">{copy}</h3>
          </article>
        ))}
      </section>

      {testimonials.length > 0 ? (
        <section className="mx-auto mt-8 max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Testimonials</span>
            <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
              What clients say about working with me
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <TestimonialCard key={testimonial._id ?? testimonial.name} testimonial={testimonial} />
            ))}
          </div>

          {testimonials.length > 3 ? (
            <div className="mt-6 text-center">
              <ButtonLink href="/testimonials" variant="outline" size="lg">
                View all {testimonials.length} testimonials
              </ButtonLink>
            </div>
          ) : null}
        </section>
      ) : null}

      {(profile.brands ?? []).length > 0 ? (
        <section className="mx-auto mt-8 max-w-7xl">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Trusted by</span>
            <h2 className="mt-3 text-3xl leading-none text-ink sm:text-4xl">
              Brands and businesses I&rsquo;ve worked with
            </h2>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {(profile.brands ?? []).map((brand, index) => (
              <div
                key={`${brand}-${index}`}
                className="flex items-center justify-center rounded-[22px] border border-black/10 bg-white/70 px-6 py-4 shadow-panel backdrop-blur"
              >
                <span className="text-lg font-semibold text-ink">{brand}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Selected work</span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            Selected projects across different industries, business needs, and product types.
          </h2>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {(featuredProjects.length ? featuredProjects : projects).map((project) => (
            <ProjectCard key={project._id ?? project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className={`${cardClass} grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr_auto]`}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Next step</span>
            <h2 className="mt-3 max-w-3xl text-3xl leading-tight text-ink sm:text-4xl">
              Need a business website, custom platform, admin dashboard, or mobile-ready product?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-black/65 sm:text-base">
              I build for businesses and teams that need more than a good-looking interface. The goal is a
              product that is clear, useful, and structured well enough to grow.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-3">
            <ButtonLink href="/contact" size="lg">
              Start a project
            </ButtonLink>
            {profile.resumeUrl ? (
              <ButtonLink href={profile.resumeUrl} variant="outline" size="lg" external>
                Download CV
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
