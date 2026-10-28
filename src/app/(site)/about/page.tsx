import { RichText } from "@/components/site/rich-text";
import { getPublicContent } from "@/lib/content";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur";

const defaultGallery = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
];

function buildGallery(aboutImage?: string, aboutGallery?: string[]): string[] {
  const gallery = aboutGallery ?? [];
  if (aboutImage && gallery.length > 0) {
    const alreadyIncluded = gallery.some(
      (image) => image === aboutImage || image.includes(aboutImage.slice(0, 50)),
    );
    return alreadyIncluded ? gallery : [aboutImage, ...gallery];
  }
  if (gallery.length > 0) return gallery;
  if (aboutImage) return [aboutImage];
  return defaultGallery;
}

export default async function AboutPage() {
  const { profile } = await getPublicContent();
  const aboutGallery = buildGallery(profile.aboutImage, profile.aboutGallery);

  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">About</span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            {profile.aboutTitle || "Full stack development with a builder's mindset."}
          </h2>
          <p className="mt-4 text-base leading-8 text-black/60 sm:text-lg">
            {profile.aboutIntro || profile.intro}
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`grid gap-3 ${aboutGallery.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {aboutGallery.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={`overflow-hidden rounded-[30px] border border-black/10 bg-white/70 shadow-panel ${
                  index === 0 && aboutGallery.length > 2 ? "col-span-2" : ""
                }`}
              >
                { }
                <img
                  src={image}
                  alt={`${profile.name ?? "SamTech"} about visual ${index + 1}`}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <article className={`${cardClass} grid content-start gap-4`}>
            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                Personal profile
              </span>
              <h3 className="mt-3 text-2xl text-ink">{profile.aboutName || profile.name || "Samuel Dagbo"}</h3>
              <p className="mt-2 text-sm leading-7 text-black/60">
                {profile.aboutEducation || "BSc. Information Technology, University of Ghana"}
              </p>
            </div>
            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <h3 className="text-2xl text-ink">{profile.aboutWhoTitle || "Who I am"}</h3>
              <RichText text={profile.aboutWhoBody || profile.intro} className="mt-3" />
            </div>
            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <h3 className="text-2xl text-ink">{profile.aboutStackTitle || "What I work with"}</h3>
              <RichText
                text={profile.aboutStackBody || "React, Node.js, Express, MongoDB, and React Native."}
                className="mt-3"
              />
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            [profile.aboutJourneyTitle || "My journey", profile.aboutJourneyBody],
            [profile.aboutInspirationTitle || "What drives me", profile.aboutInspirationBody],
            [profile.aboutApproachTitle || "How I work", profile.aboutApproachBody],
            [
              "What clients get",
              "Clear communication, thoughtful product decisions, responsive interfaces, and backend systems that are practical to manage.",
            ],
          ].map(([title, copy]) => (
            <article key={title} className={cardClass}>
              <h3 className="text-xl text-ink sm:text-2xl">{title}</h3>
              <RichText text={copy} className="mt-3" />
            </article>
          ))}
        </div>

        {(profile.techStack ?? []).length ? (
          <section className="mt-6 rounded-[32px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Tech stack</span>
            <h3 className="mt-3 text-3xl text-ink">Tools I work with regularly</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {(profile.techStack ?? []).map((item) => (
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

        {(profile.experienceTimeline ?? []).length ? (
          <section className="mt-6">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Timeline</span>
              <h3 className="mt-3 text-3xl text-ink sm:text-4xl">Experience and growth path</h3>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {(profile.experienceTimeline ?? []).map((item, index) => (
                <article key={`${item.title}-${index}`} className={cardClass}>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                    {item.period}
                  </span>
                  <h4 className="mt-3 text-2xl text-ink">{item.title}</h4>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                    {item.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {(profile.brands ?? []).length ? (
          <section className="mt-6 rounded-[32px] border border-black/10 bg-ink p-6 text-[#f8f1e7] shadow-panel sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">
              Featured brands
            </span>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(profile.brands ?? []).map((brand) => (
                <div
                  key={brand}
                  className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-5 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white/80"
                >
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
