"use client";

import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { compressImageToDataUrl } from "@/lib/image-client";

export type CmsItem = {
  id: string;
  title: string;
  subtitle: string;
  published: boolean;
  featured: boolean;
  order: number;
  fields: Record<string, string>;
};

export type ProfileForm = Record<string, string>;

const MEDIA_FIELD_NAMES = new Set(["image", "heroImage", "contactImage", "aboutImage"]);

const PROJECT_FIELDS: { name: string; label: string; type?: "textarea"; placeholder?: string }[] = [
  { name: "title", label: "Title", placeholder: "Church ERP System" },
  { name: "slug", label: "Slug (auto if blank)" },
  { name: "category", label: "Category", placeholder: "Web platform" },
  { name: "summary", label: "Summary", type: "textarea" },
  { name: "stack", label: "Tech stack (comma separated)", placeholder: "Next.js, MongoDB" },
  { name: "image", label: "Image URL (https)", placeholder: "https://…" },
  { name: "problem", label: "Problem", type: "textarea" },
  { name: "solution", label: "Solution", type: "textarea" },
  { name: "result", label: "Result", type: "textarea" },
  { name: "liveUrl", label: "Live URL (https)" },
  { name: "repoUrl", label: "Repository URL (https)" },
];

const SERVICE_FIELDS: { name: string; label: string; type?: "textarea"; placeholder?: string }[] = [
  { name: "title", label: "Title", placeholder: "Web development" },
  { name: "slug", label: "Slug (auto if blank)" },
  { name: "copy", label: "Copy", type: "textarea" },
  { name: "benefits", label: "Benefits (one per line)", type: "textarea" },
  { name: "technologies", label: "Technologies (one per line)", type: "textarea" },
  { name: "image", label: "Image URL (https)" },
];

const TESTIMONIAL_FIELDS: { name: string; label: string; type?: "textarea"; placeholder?: string }[] = [
  { name: "name", label: "Client name" },
  { name: "company", label: "Company" },
  { name: "quote", label: "Quote", type: "textarea" },
  { name: "image", label: "Image URL (https)" },
];

const PROFILE_FIELDS: { name: string; label: string; type?: "textarea"; placeholder?: string; media?: boolean }[] = [
  { name: "name", label: "Full name" },
  { name: "role", label: "Role title", placeholder: "Full-Stack Software Developer" },
  { name: "tagline", label: "Tagline" },
  { name: "intro", label: "Intro", type: "textarea" },
  { name: "location", label: "Location" },
  { name: "yearsExperience", label: "Years of experience", placeholder: "4+" },
  { name: "availability", label: "Availability", placeholder: "Open to new projects" },
  { name: "email", label: "Contact email" },
  { name: "whatsapp", label: "WhatsApp number" },
  { name: "resumeUrl", label: "Resume URL (https)" },
  { name: "githubUrl", label: "GitHub URL (https)" },
  { name: "linkedinUrl", label: "LinkedIn URL (https)" },
  { name: "xUrl", label: "X URL (https)" },
  { name: "heroImage", label: "Hero image", media: true },
  { name: "contactImage", label: "Contact page image", media: true },
  { name: "aboutTitle", label: "About section title" },
  { name: "aboutIntro", label: "About intro", type: "textarea" },
  { name: "aboutImage", label: "About page image", media: true },
  { name: "aboutName", label: "About card name" },
  { name: "aboutEducation", label: "Education line", placeholder: "University education, study area" },
  { name: "aboutGallery", label: "About gallery — one image URL per line" },
  { name: "aboutJourneyTitle", label: "Journey: heading" },
  { name: "aboutJourneyBody", label: "Journey: story", type: "textarea" },
  { name: "aboutInspirationTitle", label: "Inspiration: heading" },
  { name: "aboutInspirationBody", label: "Inspiration: story", type: "textarea" },
  { name: "aboutWhoTitle", label: "Who I am: heading" },
  { name: "aboutWhoBody", label: "Who I am: story", type: "textarea" },
  { name: "aboutStackTitle", label: "Tech stack: heading" },
  { name: "aboutStackBody", label: "Tech stack: story", type: "textarea" },
  { name: "aboutApproachTitle", label: "How I work: heading" },
  { name: "aboutApproachBody", label: "How I work: story", type: "textarea" },
  { name: "techStack", label: "Tech stack (comma separated)" },
  { name: "brands", label: "Brands / featured clients (comma separated)" },
];

async function postApi(url: string, body: unknown): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? "Something went wrong. Please try again.");
  }
  return payload?.message ?? "Done.";
}

/** URL input plus a legacy-style upload panel: pick a file, it is compressed and stored inline. */
function MediaInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try another image.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  const isUpload = value.startsWith("data:");
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>Image (upload or paste an https URL)</Label>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <Input
            id={id}
            placeholder="https://… or upload below"
            value={isUpload ? "Uploaded image (stored with the content)" : value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <label className={`${buttonClasses("outline", "sm")} cursor-pointer`}>
          {busy ? "Processing…" : "Upload"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFile}
            disabled={busy}
          />
        </label>
      </div>
      {value ? (
        <img
          src={value}
          alt="Preview"
          className="h-20 w-32 rounded-xl border border-black/10 object-cover"
        />
      ) : null}
      {error ? <p className="text-xs text-clay-strong">{error}</p> : null}
      {isUpload ? (
        <p className="text-xs text-black/50">
          Uploaded images are auto-compressed before saving. Choose Upload again to replace.
        </p>
      ) : null}
    </div>
  );
}

type CollectionKey = "projects" | "services" | "testimonials";

function ItemForm({
  collection,
  item,
  fields,
  onDone,
  onCancel,
}: {
  collection: CollectionKey;
  item: CmsItem | null;
  fields: { name: string; label: string; type?: "textarea"; placeholder?: string }[];
  onDone: (ok: boolean, message: string) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(item?.fields ?? {});
  const [published, setPublished] = useState(item ? item.published : true);
  const [featured, setFeatured] = useState(item ? item.featured : false);
  const [order, setOrder] = useState(String(item?.order ?? 0));
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        ...values,
        id: item?.id ?? "",
        published,
        order: Number(order) || 0,
      };
      if (collection === "projects") body.featured = featured;
      const message = await postApi(`/api/workspace/cms/${collection}`, body);
      onDone(true, message);
    } catch (err) {
      onDone(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={save} noValidate>
      {fields.map((field) =>
        MEDIA_FIELD_NAMES.has(field.name) ? (
          <div key={field.name} className="sm:col-span-2">
            <MediaInput
              id={`${collection}-${item?.id ?? "new"}-${field.name}`}
              value={values[field.name] ?? ""}
              onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
            />
          </div>
        ) : (
          <div key={field.name} className="grid gap-1.5 sm:col-span-2 sm:first:col-span-1">
            <Label htmlFor={`${collection}-${item?.id ?? "new"}-${field.name}`}>{field.label}</Label>
            {field.type === "textarea" ? (
              <Textarea
                id={`${collection}-${item?.id ?? "new"}-${field.name}`}
                rows={field.name === "summary" ? 2 : 4}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))}
              />
            ) : (
              <Input
                id={`${collection}-${item?.id ?? "new"}-${field.name}`}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))}
              />
            )}
          </div>
        ),
      )}
      <div className="grid gap-1.5">
        <Label htmlFor={`${collection}-${item?.id ?? "new"}-order`}>Sort order</Label>
        <Input id={`${collection}-${item?.id ?? "new"}-order`} type="number" min={0} max={999} value={order} onChange={(e) => setOrder(e.target.value)} />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-2 pb-2.5 text-sm text-ink">
          <input type="checkbox" className="h-4 w-4 accent-forest" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        {collection === "projects" ? (
          <label className="flex items-center gap-2 pb-2.5 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 accent-forest" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
        ) : null}
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : item ? "Save changes" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function CollectionSection({
  collection,
  label,
  items,
  fields,
  onFeedback,
}: {
  collection: CollectionKey;
  label: string;
  items: CmsItem[];
  fields: { name: string; label: string; type?: "textarea"; placeholder?: string }[];
  onFeedback: (ok: boolean, message: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function act(item: CmsItem, action: "publish" | "unpublish" | "delete") {
    if (action === "delete" && !window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      return;
    }
    setBusyId(item.id);
    try {
      const message = await postApi(`/api/workspace/cms/${collection}/${item.id}`, { action });
      onFeedback(true, message);
      window.location.reload();
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg text-ink">
          {label} <span className="text-sm font-normal text-black/45">({items.length})</span>
        </h2>
        <Button size="sm" variant="outline" onClick={() => { setCreating((open) => !open); setEditingId(null); }}>
          {creating ? "Close" : "New"}
        </Button>
      </div>

      {creating ? (
        <div className="mt-5 rounded-2xl border border-black/10 bg-sand/40 p-4">
          <ItemForm collection={collection} item={null} fields={fields} onDone={onFeedback} onCancel={() => setCreating(false)} />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="rounded-2xl border border-clay/30 bg-sand/40 p-4">
              <ItemForm collection={collection} item={item} fields={fields} onDone={onFeedback} onCancel={() => setEditingId(null)} />
            </div>
          ) : (
            <article key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
              <div className="min-w-0 flex-1">
                <strong className="text-sm text-ink">{item.title}</strong>
                {item.subtitle ? <span className="ml-2 text-xs text-black/45">{item.subtitle}</span> : null}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${item.published ? "border-forest/20 bg-forest/10 text-forest" : "border-black/10 bg-black/5 text-black/50"}`}>
                    {item.published ? "published" : "hidden"}
                  </span>
                  {item.featured ? <span className="rounded-full border border-clay/20 bg-clay/10 px-2 py-0.5 text-[10px] font-bold uppercase text-clay-strong">featured</span> : null}
                  <span className="text-xs text-black/40">order {item.order}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" onClick={() => { setEditingId(item.id); setCreating(false); }}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" disabled={busyId === item.id} onClick={() => act(item, item.published ? "unpublish" : "publish")}>
                  {item.published ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busyId === item.id}
                  onClick={() => act(item, "delete")}
                >
                  Delete
                </Button>
              </div>
            </article>
          ),
        )}
        {items.length === 0 && !creating ? (
          <p className="rounded-2xl border border-black/10 bg-white px-4 py-6 text-sm text-black/45">Nothing yet.</p>
        ) : null}
      </div>
    </section>
  );
}

function ProfileSection({
  profile,
  onFeedback,
}: {
  profile: ProfileForm;
  onFeedback: (ok: boolean, message: string) => void;
}) {
  const [values, setValues] = useState<ProfileForm>(profile);
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const message = await postApi("/api/workspace/cms/profile", values);
      onFeedback(true, message);
    } catch (err) {
      onFeedback(false, err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel">
      <h2 className="text-lg text-ink">Profile, homepage &amp; About page</h2>
      <p className="mt-1 text-sm text-black/55">
        Experience timeline and FAQ use blocks separated by a blank line. Timeline block: first line
        <span className="rounded bg-sand px-1 font-mono text-xs">Period | Title | Subtitle</span>, description on the next lines.
      </p>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={save} noValidate>
        {PROFILE_FIELDS.map((field) =>
          field.media ? (
            <div key={field.name} className="sm:col-span-2">
              <MediaInput
                id={`profile-${field.name}`}
                value={values[field.name] ?? ""}
                onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
              />
            </div>
          ) : (
            <div key={field.name} className={`grid gap-1.5 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
              <Label htmlFor={`profile-${field.name}`}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={`profile-${field.name}`}
                  rows={field.name.startsWith("about") && field.name.endsWith("Body") ? 4 : 3}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))}
                />
              ) : (
                <Input
                  id={`profile-${field.name}`}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValues((current) => ({ ...current, [field.name]: e.target.value }))}
                />
              )}
            </div>
          ),
        )}
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="profile-experienceTimelineRaw">Experience timeline</Label>
          <Textarea
            id="profile-experienceTimelineRaw"
            rows={7}
            placeholder={"2022 – Present | Freelance Full-Stack Developer | SamTech Labs\nBuilding websites and web products for small businesses.\n\n2021 – 2022 | Junior Developer | Company"}
            value={values.experienceTimelineRaw ?? ""}
            onChange={(e) => setValues((current) => ({ ...current, experienceTimelineRaw: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="profile-faqItemsRaw">FAQ items</Label>
          <Textarea
            id="profile-faqItemsRaw"
            rows={6}
            placeholder={"How do we start working together?\nDescribe your project on the contact page and I reply within 24 hours.\n\nWhat is your turnaround time?\nTwo to six weeks depending on scope."}
            value={values.faqItemsRaw ?? ""}
            onChange={(e) => setValues((current) => ({ ...current, faqItemsRaw: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function CmsManager({
  projects,
  services,
  testimonials,
  profile,
}: {
  projects: CmsItem[];
  services: CmsItem[];
  testimonials: CmsItem[];
  profile: ProfileForm;
}) {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className="grid gap-8">
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
      <CollectionSection collection="projects" label="Projects" items={projects} fields={PROJECT_FIELDS} onFeedback={(ok, message) => setFeedback({ ok, message })} />
      <CollectionSection collection="services" label="Services" items={services} fields={SERVICE_FIELDS} onFeedback={(ok, message) => setFeedback({ ok, message })} />
      <CollectionSection collection="testimonials" label="Testimonials" items={testimonials} fields={TESTIMONIAL_FIELDS} onFeedback={(ok, message) => setFeedback({ ok, message })} />
      <ProfileSection profile={profile} onFeedback={(ok, message) => setFeedback({ ok, message })} />
    </div>
  );
}
