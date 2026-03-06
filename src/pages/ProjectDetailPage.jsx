import { Link, Navigate, useParams } from "react-router-dom";
import RichText from "../components/RichText.jsx";

export default function ProjectDetailPage({ content }) {
  const { slug } = useParams();
  const project = content.projects.find((item) => item.slug === slug);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  const screenshots = project.screenshots?.length ? project.screenshots : project.image ? [project.image] : [];

  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/work"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
        >
          Back to work
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-panel backdrop-blur sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">{project.category}</span>
            <h1 className="mt-4 text-4xl leading-none text-ink sm:text-5xl">{project.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-black/65 sm:text-lg">{project.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(project.stack || []).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/60"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Visit website
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                >
                  View code
                </a>
              ) : null}
            </div>
          </article>

          <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-panel">
            <img src={project.image} alt={project.title} className="h-full min-h-[20rem] w-full object-cover" />
          </div>
        </div>

        {project.metrics?.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {project.metrics.map((metric, index) => (
              <article key={`${metric.label}-${index}`} className="rounded-[26px] border border-black/10 bg-white/80 p-5 shadow-panel">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{metric.label}</span>
                <strong className="mt-3 block text-2xl text-ink sm:text-3xl">{metric.value}</strong>
              </article>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {[
            ["Problem", project.problem],
            ["Solution", project.solution],
            ["Result", project.result]
          ].map(([title, copy]) => (
            <article key={title} className="rounded-[28px] border border-black/10 bg-white/80 p-6 shadow-panel">
              <h2 className="text-2xl text-ink">{title}</h2>
              <p className="mt-4 text-sm leading-8 text-black/65 sm:text-base">{copy}</p>
            </article>
          ))}
        </div>

        {project.caseStudyBody ? (
          <article className="mt-6 rounded-[32px] border border-black/10 bg-white/80 p-6 shadow-panel sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Case study</span>
            <RichText value={project.caseStudyBody} className="mt-4 grid gap-4 text-sm leading-8 text-black/65 sm:text-base" />
          </article>
        ) : null}

        {screenshots.length ? (
          <section className="mt-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Screenshots</span>
              <h2 className="mt-3 text-3xl text-ink sm:text-4xl">Product views from the build</h2>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {screenshots.map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-panel">
                  <img
                    src={image}
                    alt={`${project.title} screenshot ${index + 1}`}
                    loading="lazy"
                    className="h-72 w-full object-cover sm:h-80"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
