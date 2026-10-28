import { ButtonLink } from "@/components/ui/button";
import { getPublicContent } from "@/lib/content";

export const metadata = {
  title: "Work",
  description: "Case-study style portfolio pieces with clear product value.",
};

export default async function WorkPage() {
  const { projects } = await getPublicContent();

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
          {projects.map((project, index) => {
            const reversed = index % 2 === 1;
            return (
              <article
                key={project._id ?? project.slug}
                className="grid gap-5 overflow-hidden rounded-[32px] border border-black/10 bg-white/80 p-4 shadow-panel backdrop-blur lg:grid-cols-2"
              >
                <div className="overflow-hidden rounded-[28px] bg-black/5">
                  {project.image ? (
                     
                    <img
                      src={project.image}
                      alt={project.title ?? ""}
                      className={`h-auto w-full ${reversed ? "lg:order-2" : ""}`}
                    />
                  ) : null}
                </div>
                <div
                  className={`flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-white to-[#f5ede1] p-6 ${
                    reversed ? "lg:order-1" : ""
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
                    {(project.stack ?? []).map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/60 shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ButtonLink href={`/work/${project.slug}`} variant="outline" size="lg">
                      View case study
                    </ButtonLink>
                    {project.liveUrl ? (
                      <ButtonLink href={project.liveUrl} size="lg" external>
                        Visit website
                      </ButtonLink>
                    ) : (
                      <span className="text-sm text-black/45">Live link coming soon</span>
                    )}
                    {project.repoUrl ? (
                      <ButtonLink href={project.repoUrl} variant="outline" size="lg" external>
                        View code
                      </ButtonLink>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
