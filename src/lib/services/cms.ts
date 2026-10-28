import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import type { SessionUser } from "@/lib/auth/session";
import { slugify } from "@/lib/validation/cms";
import Profile from "@/models/profile";
import Project from "@/models/project";
import Service from "@/models/service";
import Testimonial from "@/models/testimonial";

export type CmsResult = { ok: boolean; message: string; id?: string };

export type CmsContext = {
  actor: SessionUser;
  ip?: string;
  userAgent?: string;
};

function toLines(value: string | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  return value
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveUniqueSlug(collection: "project" | "service", base: string, excludeId?: string): Promise<string> {
  async function candidate(base: string, suffix: number): Promise<string> {
    const slug = suffix ? `${base}-${suffix}` : base;
    const query: Record<string, unknown> = { slug };
    if (excludeId) query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    const exists =
      collection === "project"
        ? await Project.findOne(query).lean()
        : await Service.findOne(query).lean();
    return exists ? candidate(base, suffix + 1) : slug;
  }
  const clean = slugify(base) || "item";
  return candidate(clean, 0);
}

export async function saveProject(
  input: {
    id?: string;
    title: string;
    slug?: string;
    category?: string;
    summary?: string;
    problem?: string;
    solution?: string;
    result?: string;
    stack?: string;
    image?: string;
    liveUrl?: string;
    repoUrl?: string;
    featured?: boolean;
    published?: boolean;
    order?: number;
  },
  ctx: CmsContext,
): Promise<CmsResult> {
  await connectDB();
  const requestedSlug = input.slug ? slugify(input.slug) : "";
  const base = requestedSlug || input.title;
  const slug = await resolveUniqueSlug("project", base, input.id || undefined);

  const doc = input.id
    ? await Project.findById(input.id)
    : null;
  if (input.id && !doc) return { ok: false, message: "Project not found." };

  const payload = {
    title: input.title,
    slug,
    category: input.category || undefined,
    summary: input.summary || undefined,
    problem: input.problem || undefined,
    solution: input.solution || undefined,
    result: input.result || undefined,
    stack: toLines(input.stack),
    image: input.image || undefined,
    liveUrl: input.liveUrl || undefined,
    repoUrl: input.repoUrl || undefined,
    featured: input.featured ?? false,
    published: input.published ?? true,
    order: input.order ?? 0,
  };

  let saved;
  if (doc) {
    doc.set(payload);
    saved = doc;
  } else {
    saved = new Project(payload);
  }
  await saved.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: doc ? "cms.project_updated" : "cms.project_created",
    targetType: "project",
    targetId: String(saved._id),
    metadata: { title: input.title, slug, published: payload.published },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: doc ? "Project saved." : "Project created.", id: String(saved._id) };
}

export async function saveService(
  input: {
    id?: string;
    title: string;
    slug?: string;
    copy?: string;
    benefits?: string;
    technologies?: string;
    image?: string;
    published?: boolean;
    order?: number;
  },
  ctx: CmsContext,
): Promise<CmsResult> {
  await connectDB();
  const requestedSlug = input.slug ? slugify(input.slug) : "";
  const base = requestedSlug || input.title;
  const slug = await resolveUniqueSlug("service", base, input.id || undefined);

  const doc = input.id ? await Service.findById(input.id) : null;
  if (input.id && !doc) return { ok: false, message: "Service not found." };

  const payload = {
    title: input.title,
    slug,
    copy: input.copy || undefined,
    benefits: toLines(input.benefits),
    technologies: toLines(input.technologies),
    image: input.image || undefined,
    published: input.published ?? true,
    order: input.order ?? 0,
  };

  let saved;
  if (doc) {
    doc.set(payload);
    saved = doc;
  } else {
    saved = new Service(payload);
  }
  await saved.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: doc ? "cms.service_updated" : "cms.service_created",
    targetType: "service",
    targetId: String(saved._id),
    metadata: { title: input.title, slug, published: payload.published },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: doc ? "Service saved." : "Service created.", id: String(saved._id) };
}

export async function saveTestimonial(
  input: {
    id?: string;
    name: string;
    company?: string;
    quote: string;
    image?: string;
    published?: boolean;
    order?: number;
  },
  ctx: CmsContext,
): Promise<CmsResult> {
  await connectDB();
  const doc = input.id ? await Testimonial.findById(input.id) : null;
  if (input.id && !doc) return { ok: false, message: "Testimonial not found." };

  const payload = {
    name: input.name,
    company: input.company || undefined,
    quote: input.quote,
    image: input.image || undefined,
    published: input.published ?? true,
    order: input.order ?? 0,
  };

  let saved;
  if (doc) {
    doc.set(payload);
    saved = doc;
  } else {
    saved = new Testimonial(payload);
  }
  await saved.save();

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: doc ? "cms.testimonial_updated" : "cms.testimonial_created",
    targetType: "testimonial",
    targetId: String(saved._id),
    metadata: { name: input.name, published: payload.published },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: doc ? "Testimonial saved." : "Testimonial created.", id: String(saved._id) };
}

export async function saveProfile(
  input: {
    name: string;
    role?: string;
    tagline?: string;
    intro?: string;
    location?: string;
    availability?: string;
    email?: string;
    whatsapp?: string;
    resumeUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    xUrl?: string;
    heroImage?: string;
    contactImage?: string;
    aboutTitle?: string;
    aboutIntro?: string;
    techStack?: string;
  },
  ctx: CmsContext,
): Promise<CmsResult> {
  await connectDB();
  const existing = await Profile.findOne().sort({ createdAt: -1 });
  const payload = {
    name: input.name,
    role: input.role || undefined,
    tagline: input.tagline || undefined,
    intro: input.intro || undefined,
    location: input.location || undefined,
    availability: input.availability || undefined,
    email: input.email || undefined,
    whatsapp: input.whatsapp || undefined,
    resumeUrl: input.resumeUrl || undefined,
    githubUrl: input.githubUrl || undefined,
    linkedinUrl: input.linkedinUrl || undefined,
    xUrl: input.xUrl || undefined,
    heroImage: input.heroImage || undefined,
    contactImage: input.contactImage || undefined,
    aboutTitle: input.aboutTitle || undefined,
    aboutIntro: input.aboutIntro || undefined,
    techStack: toLines(input.techStack),
  };

  if (existing) {
    existing.set(payload);
    await existing.save();
  } else {
    await Profile.create({ ...payload, name: input.name, role: input.role || "Founder", tagline: input.tagline || "", intro: input.intro || "" });
  }

  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: "cms.profile_updated",
    targetType: "profile",
    targetId: ctx.actor.id,
    metadata: { name: input.name },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: "Profile saved." };
}

export async function cmsItemAction(
  collection: "projects" | "services" | "testimonials",
  itemId: string,
  action: "publish" | "unpublish" | "delete",
  ctx: CmsContext,
): Promise<CmsResult> {
  await connectDB();
  const models = { projects: Project, services: Service, testimonials: Testimonial } as const;
  const Model = models[collection] as typeof Project;
  const doc = await Model.findById(itemId);
  if (!doc) return { ok: false, message: "Item not found." };

  if (action === "delete") {
    await doc.deleteOne();
    await recordAudit({
      actorId: ctx.actor.id,
      actorEmail: ctx.actor.email,
      action: `cms.${collection.slice(0, -1)}_deleted`,
      targetType: collection.slice(0, -1),
      targetId: itemId,
      metadata: { title: "title" in doc ? String(doc.title ?? "") : "" },
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    return { ok: true, message: "Deleted." };
  }

  doc.set({ published: action === "publish" });
  await doc.save();
  await recordAudit({
    actorId: ctx.actor.id,
    actorEmail: ctx.actor.email,
    action: `cms.${collection.slice(0, -1)}_${action}ed`,
    targetType: collection.slice(0, -1),
    targetId: itemId,
    metadata: { published: action === "publish" },
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });
  return { ok: true, message: action === "publish" ? "Published." : "Unpublished." };
}
