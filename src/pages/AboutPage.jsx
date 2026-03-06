import RichText from "../components/RichText.jsx";

const cardClass =
  "rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur";

export default function AboutPage({ content }) {
  const aboutGallery =
    content.profile.aboutGallery?.length
      ? content.profile.aboutGallery
      : content.profile.aboutImage
        ? [content.profile.aboutImage]
        : [
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
          ];

  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">About</span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            {content.profile.aboutTitle || "Full stack development with a builder's mindset."}
          </h2>
          <p className="mt-4 text-base leading-8 text-black/60 sm:text-lg">
            {content.profile.aboutIntro || content.profile.intro}
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            className={`grid gap-3 ${
              aboutGallery.length === 1
                ? "grid-cols-1"
                : aboutGallery.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
            }`}
          >
            {aboutGallery.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`overflow-hidden rounded-[30px] border border-black/10 bg-white/70 shadow-panel ${
                  aboutGallery.length === 1
                    ? ""
                    : index === 0 && aboutGallery.length > 2
                      ? "col-span-2"
                      : ""
                }`}
              >
                <img
                  src={image}
                  alt={`${content.profile.name} about visual ${index + 1}`}
                  className={`w-full object-contain ${
                    aboutGallery.length === 1
                      ? "h-full min-h-[20rem] sm:min-h-[28rem]"
                      : index === 0 && aboutGallery.length > 2
                        ? "h-64 sm:h-80"
                        : "h-52 sm:h-64"
                  }`}
                />
              </div>
            ))}
          </div>

          <article className={`${cardClass} grid content-start gap-4`}>
            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                Personal profile
              </span>
              <h3 className="mt-3 text-2xl text-ink">
                {content.profile.aboutName || content.profile.name || "Samuel Dagbo"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-black/60">
                {content.profile.aboutEducation ||
                  "BSc. Information Technology, University of Ghana"}
              </p>
            </div>
            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <h3 className="text-2xl text-ink">{content.profile.aboutWhoTitle || "Who I am"}</h3>
              <RichText
                value={content.profile.aboutWhoBody || content.profile.intro}
                className="mt-3 grid gap-3 text-sm leading-7 text-black/60 sm:text-base"
              />
            </div>
            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <h3 className="text-2xl text-ink">
                {content.profile.aboutStackTitle || "What I work with"}
              </h3>
              <RichText
                value={
                  content.profile.aboutStackBody ||
                  "React, Node.js, Express, MongoDB, and React Native."
                }
                className="mt-3 grid gap-3 text-sm leading-7 text-black/60 sm:text-base"
              />
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              content.profile.aboutJourneyTitle || "My journey",
              content.profile.aboutJourneyBody ||
                "I have worked steadily to grow from curiosity into real technical capability, learning through practice, discipline, and consistent building."
            ],
            [
              content.profile.aboutInspirationTitle || "What drives me",
              content.profile.aboutInspirationBody ||
                "Where I am today came from hard work, patience, and refusing to stop improving."
            ],
            [
              content.profile.aboutApproachTitle || "How I work",
              content.profile.aboutApproachBody ||
                "I care about clean structure, speed, and maintainable systems."
            ],
            [
              "What clients get",
              "Clear communication, thoughtful product decisions, responsive interfaces, and backend systems that are practical to manage."
            ]
          ].map(([title, copy]) => (
            <article key={title} className={cardClass}>
              <h3 className="text-xl text-ink sm:text-2xl">{title}</h3>
              <RichText value={copy} className="mt-3 grid gap-3 text-sm leading-7 text-black/60 sm:text-base" />
            </article>
          ))}
        </div>

        {(content.profile.techStack || []).length ? (
          <section className="mt-6 rounded-[32px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Tech stack</span>
            <h3 className="mt-3 text-3xl text-ink">Tools I work with regularly</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {content.profile.techStack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {(content.profile.experienceTimeline || []).length ? (
          <section className="mt-6">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Timeline</span>
              <h3 className="mt-3 text-3xl text-ink sm:text-4xl">Experience and growth path</h3>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {content.profile.experienceTimeline.map((item, index) => (
                <article key={`${item.title}-${index}`} className={cardClass}>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{item.period}</span>
                  <h4 className="mt-3 text-2xl text-ink">{item.title}</h4>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-black/45">{item.subtitle}</p>
                  <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {(content.profile.brands || []).length ? (
          <section className="mt-6 rounded-[32px] border border-black/10 bg-[#171411] p-6 text-[#f8f1e7] shadow-panel sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">Featured brands</span>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {content.profile.brands.map((brand) => (
                <div key={brand} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white/78">
                  {brand}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
