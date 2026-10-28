"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { whatsappLink } from "@/lib/site";
import type { ProfileData } from "@/lib/types";

type FormState = { name: string; email: string; subject: string; phone: string; message: string; website: string };

const initialState: FormState = { name: "", email: "", subject: "", phone: "", message: "", website: "" };

export function ContactForm({ profile }: { profile: ProfileData }) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const whatsappMessage = `Hello SamTech, my name is ${form.name || "Client"}.\nEmail: ${form.email || "not provided"}.\n${
    form.phone ? `Phone: ${form.phone}\n` : ""
  }Message: ${form.message || "I would like to discuss a project."}`;

  const emailBody = `Hello SamTech,\n\n${form.message}\n\n— ${form.name || "Client"}\nEmail: ${form.email || "not provided"}${
    form.phone ? `\nPhone: ${form.phone}` : ""
  }`;

  const mailtoSubject = form.subject || "Project inquiry";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string; errors?: Record<string, string> }
        | null;

      if (!response.ok) {
        if (payload?.errors) {
          setErrors(payload.errors);
        }
        throw new Error(payload?.message ?? "Unable to send your message. Please try again.");
      }

      toast("Message sent. I'll get back to you soon.", "success");
      setForm(initialState);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="contact-name">Your name</Label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <FieldError message={errors.name} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="contact-email">Your email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <FieldError message={errors.email} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          name="subject"
          type="text"
          placeholder="e.g. E-commerce build for a fashion brand"
          required
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
        />
        <FieldError message={errors.subject} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <Input
          id="contact-phone"
          name="phone"
          type="tel"
          placeholder="Your phone"
          autoComplete="tel"
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
        />
        <FieldError message={errors.phone} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="contact-message">Project details</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Tell me about your project"
          required
          rows={8}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
        />
        <FieldError message={errors.message} />
      </div>

      {/* Honeypot — hidden from humans, catches bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
        />
      </div>

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? "Sending…" : "Send inquiry"}
      </Button>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <a
          href={whatsappLink(profile.whatsapp, whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
        >
          Open WhatsApp
        </a>
        <a
          href={`mailto:${profile.email || "samueldagbo50@gmail.com"}?subject=${encodeURIComponent(
            mailtoSubject,
          )}&body=${encodeURIComponent(emailBody)}`}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
        >
          Send email
        </a>
      </div>
    </form>
  );
}
