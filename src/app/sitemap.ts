import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { getPublicAppUrl } from "@/lib/env";
import Project from "@/models/project";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicAppUrl();
  const staticRoutes = ["", "/about", "/work", "/testimonials", "/services", "/contact"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  try {
    await connectDB();
    const projects = await Project.find({ slug: { $ne: "" } })
      .select("slug updatedAt")
      .lean<{ slug: string; updatedAt?: Date }[]>();
    const projectEntries = projects.map((project) => ({
      url: `${base}/work/${project.slug}`,
      lastModified: project.updatedAt ?? new Date(),
    }));
    return [...staticRoutes, ...projectEntries];
  } catch {
    return staticRoutes;
  }
}
