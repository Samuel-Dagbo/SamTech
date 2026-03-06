export default function ServicesPage({ content }) {
  const services = content.services || [];

  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Services</span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            What I build for founders, teams, and growing businesses.
          </h2>
          <p className="mt-4 text-base leading-8 text-black/60 sm:text-lg">
            From business websites to full MERN platforms and React Native apps, I build products that are clear,
            responsive, and backed by practical engineering.
          </p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article
              key={service._id || service.title}
              className="overflow-hidden rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur"
            >
              <div className="relative h-52 overflow-hidden bg-sand">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-sand via-white to-mist px-6 text-center text-sm font-semibold uppercase tracking-[0.18em] text-black/35">
                    Service image
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                  Tailored build
                </span>
                <h3 className="mt-3 text-2xl leading-tight text-ink">{service.title}</h3>
                <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">{service.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
