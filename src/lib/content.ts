import "server-only";
import { cache } from "react";
import { connectDB } from "./db";
import type {
  ProfileData,
  ProjectData,
  ServiceData,
  SiteContent,
  TestimonialData,
} from "./types";
import Profile from "@/models/profile";
import Project from "@/models/project";
import Service from "@/models/service";
import Testimonial from "@/models/testimonial";
import { fallbackContent } from "@/data/fallback-content";

/**
 * Public content service. All public pages read through here so a single
 * request performs (at most) one DB round-trip, deduplicated by React cache.
 * If the database is unreachable, the bundled fallback keeps the site usable
 * while the failure is logged loudly server-side.
 */

function plain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export const getPublicContent = cache(async (): Promise<SiteContent> => {
  try {
    await connectDB();
    const [profile, projects, services, testimonials] = await Promise.all([
      Profile.findOne().sort({ createdAt: -1 }).lean(),
      Project.find({ slug: { $ne: "" }, title: { $ne: "" } })
        .sort({ order: 1, featured: -1, createdAt: -1 })
        .lean(),
      Service.find().sort({ order: 1, createdAt: -1 }).lean(),
      Testimonial.find().sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    return {
      profile: (profile ? plain<ProfileData>(profile) : null) ?? fallbackContent.profile,
      projects: projects.length ? projects.map((doc) => plain<ProjectData>(doc)) : fallbackContent.projects,
      services: services.length ? services.map((doc) => plain<ServiceData>(doc)) : fallbackContent.services,
      testimonials: testimonials.length
        ? testimonials.map((doc) => plain<TestimonialData>(doc))
        : fallbackContent.testimonials,
    };
  } catch (error) {
    logContentFailure(error);
    return fallbackContent;
  }
});

export async function getProjectBySlug(slug: string): Promise<ProjectData | null> {
  const fallbackMatch = fallbackContent.projects.find((project) => project.slug === slug) ?? null;
  try {
    await connectDB();
    const project = await Project.findOne({ slug }).lean();
    return project ? plain<ProjectData>(project) : fallbackMatch;
  } catch (error) {
    logContentFailure(error);
    return fallbackMatch;
  }
}

function logContentFailure(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[content] Database unavailable, serving bundled fallback: ${message}`);
}
