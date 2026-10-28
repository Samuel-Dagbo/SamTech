import { ContactForm } from "@/components/site/contact-form";
import { getPublicContent } from "@/lib/content";

export const metadata = {
  title: "Contact",
  description:
    "Let's talk about the product you want to build. Available for freelance and product builds.",
};

export default async function ContactPage() {
  const { profile } = await getPublicContent();

  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Contact</span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            Let&rsquo;s talk about the product you want to build.
          </h2>
          <p className="mt-4 text-base leading-8 text-black/60 sm:text-lg">
            {profile.availability || "Available for freelance and product builds"}
          </p>
        </div>

        <div className="mt-6 grid gap-5 rounded-[32px] border border-black/10 bg-white/75 p-5 shadow-panel backdrop-blur lg:grid-cols-[0.75fr_1fr_0.75fr] lg:p-8">
          <div className="rounded-[28px] bg-ink p-6 text-[#f8f1e7]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">
              Direct channel
            </p>
            <h3 className="mt-4 text-3xl leading-tight">Choose your preferred way to reach out.</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              I&rsquo;m responsive on WhatsApp and email. Fill the form and I&rsquo;ll get back to you within
              24 hours.
            </p>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">Connect</p>
              <div className="mt-4 flex flex-col gap-2">
                {profile.githubUrl ? (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/70 transition hover:text-white"
                  >
                    GitHub
                  </a>
                ) : null}
                {profile.linkedinUrl ? (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/70 transition hover:text-white"
                  >
                    LinkedIn
                  </a>
                ) : null}
                {profile.xUrl ? (
                  <a
                    href={profile.xUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/70 transition hover:text-white"
                  >
                    X (Twitter)
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <ContactForm profile={profile} />

          {profile.contactImage ? (
            <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
              { }
              <img src={profile.contactImage} alt="Contact visual" className="h-auto w-full" />
            </div>
          ) : null}
        </div>

        {(profile.faqItems ?? []).length ? (
          <section className="mt-6">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">FAQ</span>
              <h3 className="mt-3 text-3xl text-ink sm:text-4xl">Questions clients usually ask</h3>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {(profile.faqItems ?? []).map((item, index) => (
                <article
                  key={`${item.question}-${index}`}
                  className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur"
                >
                  <h4 className="text-xl text-ink">{item.question}</h4>
                  <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
