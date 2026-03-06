export default function TestimonialsPage({ content }) {
  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
            Testimonials
          </span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            Feedback from people and teams I have built for.
          </h2>
          <p className="mt-4 text-base leading-8 text-black/60 sm:text-lg">
            Real trust is built through delivery, communication, and systems that actually work in
            practice.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {content.testimonials.map((item) => (
            <article
              key={item._id}
              className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur"
            >
              <div className="flex items-center gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-auto w-16 rounded-2xl"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-black/10 bg-white text-lg font-bold text-ink">
                    {item.name?.[0] || "T"}
                  </div>
                )}
                <div>
                  <strong className="block text-xl text-ink">{item.name}</strong>
                  <span className="mt-1 block text-sm uppercase tracking-[0.16em] text-clay">
                    {item.company}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-8 text-black/65 sm:text-base">"{item.quote}"</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
