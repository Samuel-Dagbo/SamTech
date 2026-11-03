"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { MediaInput, CollectionSection, type CmsItem, type ProfileForm, PROJECT_FIELDS, SERVICE_FIELDS, TESTIMONIAL_FIELDS, PROFILE_FIELDS, postApi } from "./cms-manager";

export type DashboardTab =
  | "overview"
  | "frontpage"
  | "profile"
  | "social"
  | "brands"
  | "about"
  | "projects"
  | "services"
  | "testimonials"
  | "messages";

type FounderDashboardProps = {
  email: string;
  title?: string;
  department?: string;
  stats: {
    projects: number;
    publishedProjects: number;
    services: number;
    publishedServices: number;
    testimonials: number;
    publishedTestimonials: number;
    messages: number;
    newMessages: number;
  } | null;
  profile: ProfileForm;
  projects: CmsItem[];
  services: CmsItem[];
  testimonials: CmsItem[];
};

const SIDEBAR_TABS: { id: DashboardTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "frontpage", label: "Front Page", icon: "🖼️" },
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "social", label: "Social & CV", icon: "🔗" },
  { id: "brands", label: "Brands", icon: "🤝" },
  { id: "about", label: "About", icon: "✍️" },
  { id: "projects", label: "Projects", icon: "📁" },
  { id: "services", label: "Services", icon: "🧰" },
  { id: "testimonials", label: "Testimonials", icon: "💬" },
  { id: "messages", label: "Messages", icon: "✉️" },
];

const ALL_TABS: DashboardTab[] = [
  "overview",
  "frontpage",
  "profile",
  "social",
  "brands",
  "about",
  "projects",
  "services",
  "testimonials",
  "messages",
];

type Feedback = { ok: boolean; message: string };

export function FounderDashboard({
  email,
  title,
  department,
  stats,
  profile,
  projects,
  services,
  testimonials,
}: FounderDashboardProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: DashboardTab = (ALL_TABS as string[]).includes(tabParam ?? "")
    ? (tabParam as DashboardTab)
    : "overview";

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const onFeedback = (ok: boolean, message: string) => setFeedback({ ok, message });

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-[28px] border border-black/10 bg-white/70 p-4 shadow-panel backdrop-blur lg:sticky lg:top-6">
        <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay">Content</p>
        <nav className="mt-3 flex flex-col gap-1">
          {SIDEBAR_TABS.map((item) => (
            <Link
              key={item.id}
              href={`/workspace?tab=${item.id}`}
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                tab === item.id ? "bg-ink text-white" : "text-ink hover:bg-black/5"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="px-2 pt-6 text-xs font-semibold uppercase tracking-[0.2em] text-clay">Workspace</p>
        <nav className="mt-3 flex flex-col gap-1">
          {[
            { href: "/workspace/tasks", label: "Tasks" },
            { href: "/workspace/announcements", label: "Announcements" },
            { href: "/workspace/resources", label: "Resources" },
            { href: "/workspace/marketing", label: "Marketing" },
            { href: "/workspace/team", label: "Team" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink hover:bg-black/5">
              {item.label}
            </Link>
          ))}
          <Link href="/workspace/messages" className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink hover:bg-black/5">
            Messages
          </Link>
        </nav>
      </aside>

      <div className="grid gap-6">
        {feedback ? (
          <div
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.ok ? "border-forest/20 bg-forest/10 text-forest" : "border-clay/30 bg-clay/10 text-clay-strong"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {tab === "overview" ? <OverviewPanel stats={stats} email={email} title={title} department={department} /> : null}
        {tab === "frontpage" ? <FrontPagePanel profile={profile} onFeedback={onFeedback} /> : null}
        {tab === "profile" ? <ProfilePanel profile={profile} onFeedback={onFeedback} /> : null}
        {tab === "social" ? <SocialPanel profile={profile} onFeedback={onFeedback} /> : null}
        {tab === "brands" ? <BrandsPanel profile={profile} onFeedback={onFeedback} /> : null}
        {tab === "about" ? <AboutPanel profile={profile} onFeedback={onFeedback} /> : null}
        {tab === "projects" ? <CollectionSection collection="projects" label="Projects" items={projects} fields={PROJECT_FIELDS} onFeedback={onFeedback} /> : null}
        {tab === "services" ? <CollectionSection collection="services" label="Services" items={services} fields={SERVICE_FIELDS} onFeedback={onFeedback} /> : null}
        {tab === "testimonials" ? <CollectionSection collection="testimonials" label="Testimonials" items={testimonials} fields={TESTIMONIAL_FIELDS} onFeedback={onFeedback} /> : null}
        {tab === "messages" ? (
          <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
            <h2 className="text-lg text-ink">Messages</h2>
            <p className="mt-2 text-sm text-black/55">
              New messages land here in the workspace inbox — review, reply, or archive from the{" "}
              <Link href="/workspace/messages" className="font-semibold text-forest underline-offset-4 hover:underline">
                messages inbox
              </Link>
              .
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-[22px] border border-black/10 bg-white/75 p-5 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-black/50">{hint}</p>
    </div>
  );
}

function OverviewPanel({
  stats,
  email,
  title,
  department,
}: {
  stats: FounderDashboardProps["stats"];
  email: string;
  title?: string;
  department?: string;
}) {
  const statsData = stats ?? {
    projects: 0,
    publishedProjects: 0,
    services: 0,
    publishedServices: 0,
    testimonials: 0,
    publishedTestimonials: 0,
    messages: 0,
    newMessages: 0,
  };
  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Content overview</p>
        <h2 className="mt-2 text-2xl text-ink">Welcome back to the site dashboard.</h2>
        <p className="mt-2 text-sm text-black/60">
          Signed in as <strong>{email}</strong>
          {title ? ` — ${title}` : ""}
          {department ? ` (${department})` : ""}. Use the sidebar to edit the homepage, profile, services, projects and
          more — or head to the modules for team operations.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/workspace/cms" className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-black">
            Manage content
          </Link>
          <Link href="/workspace/messages" className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:bg-black hover:text-white">
            Messages inbox
          </Link>
          <Link href="/" className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:bg-black hover:text-white">
            View public site
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Projects" value={statsData.projects} hint={`${statsData.publishedProjects} published`} />
        <StatCard label="Services" value={statsData.services} hint={`${statsData.publishedServices} published`} />
        <StatCard label="Testimonials" value={statsData.testimonials} hint={`${statsData.publishedTestimonials} published`} />
        <StatCard label="Messages" value={statsData.messages} hint={`${statsData.newMessages} new`} />
      </div>
    </section>
  );
}

type FieldDef = { name: string; label: string; type?: "textarea"; placeholder?: string; media?: boolean };

function Field({
  field,
  values,
  onChange,
}: {
  field: FieldDef;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const value = values[field.name] ?? "";
  if (field.media) {
    return (
      <div className="grid gap-1.5 sm:col-span-2">
        <MediaInput id={`founder-${field.name}`} value={value} onChange={(v) => onChange(field.name, v)} />
      </div>
    );
  }
  return (
    <div className={`grid gap-1.5 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={`founder-${field.name}`}>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea id={`founder-${field.name}`} rows={3} placeholder={field.placeholder} value={value} onChange={(e) => onChange(field.name, e.target.value)} />
      ) : (
        <Input id={`founder-${field.name}`} placeholder={field.placeholder} value={value} onChange={(e) => onChange(field.name, e.target.value)} />
      )}
    </div>
  );
}

function FrontPagePanel({ profile, onFeedback }: { profile: ProfileForm; onFeedback: (ok: boolean, message: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({
    name: profile.name ?? "",
    role: profile.role ?? "",
    tagline: profile.tagline ?? "",
    intro: profile.intro ?? "",
    heroImage: profile.heroImage ?? "",
    contactImage: profile.contactImage ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const message = await postApi("/api/workspace/cms/profile", {
        name: values.name,
        role: values.role || undefined,
        tagline: values.tagline || undefined,
        intro: values.intro || undefined,
        heroImage: values.heroImage || undefined,
        contactImage: values.contactImage || undefined,
      });
      onFeedback(true, message);
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const fields: FieldDef[] = [
    { name: "name", label: "Full name" },
    { name: "role", label: "Role title", placeholder: "Full-Stack Software Developer" },
    { name: "tagline", label: "Tagline" },
    { name: "intro", label: "Intro", type: "textarea" },
    { name: "heroImage", label: "Hero image", media: true },
    { name: "contactImage", label: "Contact page image", media: true },
  ];

  return (
    <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
      <h2 className="text-lg text-ink">Front Page — hero content</h2>
      <p className="mt-1 text-sm text-black/55">These fields drive the public homepage hero.</p>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void save(); }} noValidate>
        {fields.map((field) => (
          <Field key={field.name} field={field} values={values} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save front page"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function ProfilePanel({ profile, onFeedback }: { profile: ProfileForm; onFeedback: (ok: boolean, message: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({
    name: profile.name ?? "",
    role: profile.role ?? "",
    location: profile.location ?? "",
    yearsExperience: profile.yearsExperience ?? "",
    availability: profile.availability ?? "",
    email: profile.email ?? "",
    whatsapp: profile.whatsapp ?? "",
    resumeUrl: profile.resumeUrl ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const message = await postApi("/api/workspace/cms/profile", {
        name: values.name,
        role: values.role || undefined,
        location: values.location || undefined,
        yearsExperience: values.yearsExperience || undefined,
        availability: values.availability || undefined,
        email: values.email || undefined,
        whatsapp: values.whatsapp || undefined,
        resumeUrl: values.resumeUrl || undefined,
      });
      onFeedback(true, message);
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const fields: FieldDef[] = [
    { name: "name", label: "Full name" },
    { name: "role", label: "Role title", placeholder: "Full-Stack Software Developer" },
    { name: "location", label: "Location" },
    { name: "yearsExperience", label: "Years of experience", placeholder: "4+" },
    { name: "availability", label: "Availability", placeholder: "Open to new projects" },
    { name: "email", label: "Contact email" },
    { name: "whatsapp", label: "WhatsApp number" },
    { name: "resumeUrl", label: "Resume URL (https)" },
  ];

  return (
    <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
      <h2 className="text-lg text-ink">Profile — identity &amp; contact</h2>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void save(); }} noValidate>
        {fields.map((field) => (
          <Field key={field.name} field={field} values={values} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function SocialPanel({ profile, onFeedback }: { profile: ProfileForm; onFeedback: (ok: boolean, message: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({
    resumeUrl: profile.resumeUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    xUrl: profile.xUrl ?? "",
    whatsapp: profile.whatsapp ?? "",
    email: profile.email ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const message = await postApi("/api/workspace/cms/profile", {
        name: profile.name || "SamTech Labs",
        resumeUrl: values.resumeUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        linkedinUrl: values.linkedinUrl || undefined,
        xUrl: values.xUrl || undefined,
        whatsapp: values.whatsapp || undefined,
        email: values.email || undefined,
      });
      onFeedback(true, message);
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const fields: FieldDef[] = [
    { name: "resumeUrl", label: "Resume URL (https)" },
    { name: "githubUrl", label: "GitHub URL (https)" },
    { name: "linkedinUrl", label: "LinkedIn URL (https)" },
    { name: "xUrl", label: "X URL (https)" },
    { name: "whatsapp", label: "WhatsApp number" },
    { name: "email", label: "Contact email" },
  ];

  return (
    <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
      <h2 className="text-lg text-ink">Social &amp; CV</h2>
      <p className="mt-1 text-sm text-black/55">Social links and the resume document.</p>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void save(); }} noValidate>
        {fields.map((field) => (
          <Field key={field.name} field={field} values={values} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save social & CV"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function BrandsPanel({ profile, onFeedback }: { profile: ProfileForm; onFeedback: (ok: boolean, message: string) => void }) {
  const [brands, setBrands] = useState(profile.brands ?? "");

  async function save() {
    const message = await postApi("/api/workspace/cms/profile", { name: profile.name || "SamTech Labs", brands });
    onFeedback(true, message);
  }

  return (
    <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
      <h2 className="text-lg text-ink">Brands / featured clients</h2>
      <p className="mt-1 text-sm text-black/55">Comma-separated client names shown in the dark strip on the homepage.</p>
      <form className="mt-4 grid max-w-2xl gap-4" onSubmit={(e) => { e.preventDefault(); void save(); }} noValidate>
        <div className="grid gap-1.5">
          <Label htmlFor="founder-brands">Brands / featured clients (comma separated)</Label>
          <Input id="founder-brands" value={brands} onChange={(e) => setBrands(e.target.value)} />
        </div>
        <div>
          <Button type="submit">Save brands</Button>
        </div>
      </form>
    </section>
  );
}

const ABOUT_FIELD_NAMES = [
  "aboutTitle",
  "aboutIntro",
  "aboutImage",
  "aboutName",
  "aboutEducation",
  "aboutGallery",
  "aboutJourneyTitle",
  "aboutJourneyBody",
  "aboutInspirationTitle",
  "aboutInspirationBody",
  "aboutWhoTitle",
  "aboutWhoBody",
  "aboutStackTitle",
  "aboutStackBody",
  "aboutApproachTitle",
  "aboutApproachBody",
  "techStack",
];

function AboutPanel({ profile, onFeedback }: { profile: ProfileForm; onFeedback: (ok: boolean, message: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({
    name: profile.name ?? "",
    role: profile.role ?? "",
    tagline: profile.tagline ?? "",
    intro: profile.intro ?? "",
    location: profile.location ?? "",
    yearsExperience: profile.yearsExperience ?? "",
    availability: profile.availability ?? "",
    email: profile.email ?? "",
    whatsapp: profile.whatsapp ?? "",
    resumeUrl: profile.resumeUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    xUrl: profile.xUrl ?? "",
    heroImage: profile.heroImage ?? "",
    contactImage: profile.contactImage ?? "",
    aboutTitle: profile.aboutTitle ?? "",
    aboutIntro: profile.aboutIntro ?? "",
    aboutImage: profile.aboutImage ?? "",
    aboutGallery: profile.aboutGallery ?? "",
    aboutName: profile.aboutName ?? "",
    aboutEducation: profile.aboutEducation ?? "",
    aboutJourneyTitle: profile.aboutJourneyTitle ?? "",
    aboutJourneyBody: profile.aboutJourneyBody ?? "",
    aboutInspirationTitle: profile.aboutInspirationTitle ?? "",
    aboutInspirationBody: profile.aboutInspirationBody ?? "",
    aboutWhoTitle: profile.aboutWhoTitle ?? "",
    aboutWhoBody: profile.aboutWhoBody ?? "",
    aboutStackTitle: profile.aboutStackTitle ?? "",
    aboutStackBody: profile.aboutStackBody ?? "",
    aboutApproachTitle: profile.aboutApproachTitle ?? "",
    aboutApproachBody: profile.aboutApproachBody ?? "",
    techStack: profile.techStack ?? "",
    brands: profile.brands ?? "",
    experienceTimelineRaw: profile.experienceTimelineRaw ?? "",
    faqItemsRaw: profile.faqItemsRaw ?? "",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      const message = await postApi("/api/workspace/cms/profile", {
        name: values.name,
        role: values.role || undefined,
        tagline: values.tagline || undefined,
        intro: values.intro || undefined,
        location: values.location || undefined,
        yearsExperience: values.yearsExperience || undefined,
        availability: values.availability || undefined,
        email: values.email || undefined,
        whatsapp: values.whatsapp || undefined,
        resumeUrl: values.resumeUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        linkedinUrl: values.linkedinUrl || undefined,
        xUrl: values.xUrl || undefined,
        heroImage: values.heroImage || undefined,
        contactImage: values.contactImage || undefined,
        aboutTitle: values.aboutTitle || undefined,
        aboutIntro: values.aboutIntro || undefined,
        aboutImage: values.aboutImage || undefined,
        aboutGallery: values.aboutGallery || undefined,
        aboutName: values.aboutName || undefined,
        aboutEducation: values.aboutEducation || undefined,
        aboutJourneyTitle: values.aboutJourneyTitle || undefined,
        aboutJourneyBody: values.aboutJourneyBody || undefined,
        aboutInspirationTitle: values.aboutInspirationTitle || undefined,
        aboutInspirationBody: values.aboutInspirationBody || undefined,
        aboutWhoTitle: values.aboutWhoTitle || undefined,
        aboutWhoBody: values.aboutWhoBody || undefined,
        aboutStackTitle: values.aboutStackTitle || undefined,
        aboutStackBody: values.aboutStackBody || undefined,
        aboutApproachTitle: values.aboutApproachTitle || undefined,
        aboutApproachBody: values.aboutApproachBody || undefined,
        techStack: values.techStack,
        brands: values.brands,
        experienceTimelineRaw: values.experienceTimelineRaw ?? "",
        faqItemsRaw: values.faqItemsRaw ?? "",
      });
      onFeedback(true, message);
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const aboutFields = PROFILE_FIELDS.filter((field) => ABOUT_FIELD_NAMES.includes(field.name));
  const baseFields = PROFILE_FIELDS.filter((field) =>
    [
      "name",
      "role",
      "tagline",
      "intro",
      "location",
      "yearsExperience",
      "availability",
      "email",
      "whatsapp",
      "resumeUrl",
      "githubUrl",
      "linkedinUrl",
      "xUrl",
      "heroImage",
      "contactImage",
    ].includes(field.name),
  );

  return (
    <section className="grid gap-6">
      <div className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
        <h2 className="text-lg text-ink">About page &amp; homepage content</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          noValidate
        >
          <div className="sm:col-span-2 grid gap-1.5">
            <Label htmlFor="founder-experienceTimelineRaw">Experience timeline — blocks separated by a blank line. First line: “Period | Title | Subtitle”, then description.</Label>
            <Textarea
              id="founder-experienceTimelineRaw"
              rows={7}
              value={values.experienceTimelineRaw ?? ""}
              onChange={(e) => setValues((current) => ({ ...current, experienceTimelineRaw: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2 grid gap-1.5">
            <Label htmlFor="founder-faqItemsRaw">FAQ items — blocks separated by a blank line. First line is the question, remaining lines the answer.</Label>
            <Textarea
              id="founder-faqItemsRaw"
              rows={6}
              value={values.faqItemsRaw ?? ""}
              onChange={(e) => setValues((current) => ({ ...current, faqItemsRaw: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {baseFields.map((field) => (
              <Field key={field.name} field={field} values={values} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {aboutFields.map((field) => (
              <Field key={field.name} field={field} values={values} onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))} />
            ))}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save about & homepage"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
