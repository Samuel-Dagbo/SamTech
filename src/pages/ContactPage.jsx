
import { useState } from "react";

function buildWhatsAppLink(whatsappNumber, message) {
  const cleanNumber = whatsappNumber?.replace(/\D/g, "") || "233550624203";
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ContactPage({ content }) {
  const [contact, setContact] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  
  const profile = content?.profile || {};
  const whatsappNumber = profile.whatsapp || "233550624203";
  
  const whatsappMessage = `Hello SamTech, my name is ${contact.name || "Client"}. 
Email: ${contact.email || "not provided"}.
${contact.phone ? `Phone: ${contact.phone}` : ""}
Message: ${contact.message || "I would like to discuss a project."}`;

  const submitContact = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch(`${API_BASE}/content/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to send message");
      }
      setStatus("Message saved! I'll get back to you soon.");
      setContact({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-3 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Contact</span>
          <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">
            Let's talk about the product you want to build.
          </h2>
          <p className="mt-4 text-base leading-8 text-black/60 sm:text-lg">
            {profile.availability || "Available for freelance and product builds"}
          </p>
        </div>

        <div className="mt-6 grid gap-5 rounded-[32px] border border-black/10 bg-white/75 p-5 shadow-panel backdrop-blur lg:grid-cols-[0.75fr_1fr_0.75fr] lg:p-8">
          <div className="rounded-[28px] bg-[#171411] p-6 text-[#f8f1e7] lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">
              Direct channel
            </p>
            <h3 className="mt-4 text-3xl leading-tight">
              Choose your preferred way to reach out.
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/70">
              I'm responsive on WhatsApp and email. Fill the form and I'll get back to you within 24 hours.
            </p>
            <a
              href={buildWhatsAppLink(whatsappNumber, whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink transition hover:bg-[#f0e5d7]"
            >
              Open WhatsApp
            </a>
            <a
              href={`mailto:${profile.email || "samueldagbo50@gmail.com"}?subject=${encodeURIComponent("Project inquiry")}&body=${encodeURIComponent(whatsappMessage)}`}
              className="mt-3 inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-transparent px-6 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
            >
              Send email
            </a>
            
            {/* Social Links */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c5a7]">
                Connect
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white">
                    GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white">
                    LinkedIn
                  </a>
                )}
                {profile.xUrl && (
                  <a href={profile.xUrl} target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white">
                    X (Twitter)
                  </a>
                )}
              </div>
            </div>
          </div>

          <form className="grid gap-4 lg:col-span-1" onSubmit={submitContact}>
            <input
              type="text"
              placeholder="Your name *"
              value={contact.name}
              onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))}
              required
              className="h-14 rounded-[22px] border border-black/10 bg-white px-5 text-sm outline-none placeholder:text-black/35 focus:border-forest"
            />
            <input
              type="email"
              placeholder="Your email *"
              value={contact.email}
              onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))}
              required
              className="h-14 rounded-[22px] border border-black/10 bg-white px-5 text-sm outline-none placeholder:text-black/35 focus:border-forest"
            />
            <input
              type="tel"
              placeholder="Your phone (optional)"
              value={contact.phone}
              onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
              className="h-14 rounded-[22px] border border-black/10 bg-white px-5 text-sm outline-none placeholder:text-black/35 focus:border-forest"
            />
            <textarea
              placeholder="Tell me about your project *"
              value={contact.message}
              onChange={(event) => setContact((current) => ({ ...current, message: event.target.value }))}
              required
              rows="8"
              className="rounded-[22px] border border-black/10 bg-white px-5 py-4 text-sm outline-none placeholder:text-black/35 focus:border-forest"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send inquiry"}
            </button>
            {status ? <p className="text-sm leading-7 text-black/60">{status}</p> : null}
          </form>

          {profile.contactImage ? (
            <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white lg:col-span-1">
              <img
                src={profile.contactImage}
                alt="Contact visual"
                className="h-auto w-full"
              />
            </div>
          ) : null}
        </div>

        {(profile.faqItems || []).length ? (
          <section className="mt-6">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">FAQ</span>
              <h3 className="mt-3 text-3xl text-ink sm:text-4xl">Questions clients usually ask</h3>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {profile.faqItems.map((item, index) => (
                <article key={`${item.question}-${index}`} className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur">
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

