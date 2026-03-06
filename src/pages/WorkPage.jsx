import { Link } from "react-router-dom";

export default function WorkPage({ content }) {
  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Work</span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            Case-study style portfolio pieces with clear product value.
          </h2>
        </div>

        <div className="mt-6 grid gap-5">
          {content.projects.map((project, index) => (
            <article
              key={project._id}
              className={`grid gap-5 overflow-hidden rounded-[32px] border border-black/10 bg-white/80 p-4 shadow-panel backdrop-blur lg:grid-cols-[1fr_1fr] ${
                index % 2 === 1 ? "lg:grid-reverse" : ""
              }`}
            >
              <div className="relative overflow-hidden rounded-[28px] bg-black/5">
                <img
                  src={project.image}
                  alt={project.title}
                  className={`h-72 w-full object-contain lg:h-full lg:min-h-[22rem] ${
                    index % 2 === 1 ? "lg:order-2" : ""
                  }`}
                />
              </div>
              <div
                className={`flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-white to-[#f5ede1] p-6 ${
                  index % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#f2d7c4] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a3c20]">
                      {project.category}
                    </span>
                    {project.featured ? (
                      <span className="rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-3xl leading-tight text-ink sm:text-4xl">{project.title}</h3>
                  <p className="mt-4 max-w-2xl text-sm leading-8 text-black/60 sm:text-base">
                    {project.summary}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/60 shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to={`/work/${project.slug}`}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                  >
                    View case study
                  </Link>
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Visit website
                    </a>
                  ) : (
                    <span className="text-sm text-black/45">Live link coming soon</span>
                  )}
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
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
