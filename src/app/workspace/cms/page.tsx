import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/session";
import { canUser } from "@/lib/auth/rbac";
import Profile from "@/models/profile";
import Project from "@/models/project";
import Service from "@/models/service";
import Testimonial from "@/models/testimonial";
import { CmsManager, type CmsItem, type ProfileForm } from "@/components/workspace/cms-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Content manager",
  robots: { index: false, follow: false },
};

export default async function CmsPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace/cms");
  }
  if (!canUser(auth.user, "cms.manage")) {
    redirect("/workspace");
  }

  await connectDB();
  const [profile, projects, services, testimonials] = await Promise.all([
    Profile.findOne().sort({ createdAt: -1 }).lean<{
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
      techStack?: string[];
    } | null>(),
    Project.find().sort({ order: 1, createdAt: -1 }).lean<{
      _id: { toString(): string };
      title?: string;
      slug?: string;
      category?: string;
      summary?: string;
      problem?: string;
      solution?: string;
      result?: string;
      stack?: string[];
      image?: string;
      liveUrl?: string;
      repoUrl?: string;
      featured?: boolean;
      published?: boolean;
      order?: number;
    }[]>(),
    Service.find().sort({ order: 1, createdAt: -1 }).lean<{
      _id: { toString(): string };
      title?: string;
      slug?: string;
      copy?: string;
      benefits?: string[];
      technologies?: string[];
      image?: string;
      published?: boolean;
      order?: number;
    }[]>(),
    Testimonial.find().sort({ order: 1, createdAt: -1 }).lean<{
      _id: { toString(): string };
      name?: string;
      company?: string;
      quote?: string;
      image?: string;
      published?: boolean;
      order?: number;
    }[]>(),
  ]);

  const projectItems: CmsItem[] = projects.map((doc) => ({
    id: String(doc._id),
    title: doc.title ?? "",
    subtitle: doc.category ?? "",
    published: doc.published !== false,
    featured: Boolean(doc.featured),
    order: doc.order ?? 0,
    fields: {
      title: doc.title ?? "",
      slug: doc.slug ?? "",
      category: doc.category ?? "",
      summary: doc.summary ?? "",
      problem: doc.problem ?? "",
      solution: doc.solution ?? "",
      result: doc.result ?? "",
      stack: (doc.stack ?? []).join(", "),
      image: doc.image ?? "",
      liveUrl: doc.liveUrl ?? "",
      repoUrl: doc.repoUrl ?? "",
    },
  }));

  const serviceItems: CmsItem[] = services.map((doc) => ({
    id: String(doc._id),
    title: doc.title ?? "",
    subtitle: "",
    published: doc.published !== false,
    featured: false,
    order: doc.order ?? 0,
    fields: {
      title: doc.title ?? "",
      slug: doc.slug ?? "",
      copy: doc.copy ?? "",
      benefits: (doc.benefits ?? []).join("\n"),
      technologies: (doc.technologies ?? []).join("\n"),
      image: doc.image ?? "",
    },
  }));

  const testimonialItems: CmsItem[] = testimonials.map((doc) => ({
    id: String(doc._id),
    title: doc.name ?? "",
    subtitle: doc.company ?? "",
    published: doc.published !== false,
    featured: false,
    order: doc.order ?? 0,
    fields: {
      name: doc.name ?? "",
      company: doc.company ?? "",
      quote: doc.quote ?? "",
      image: doc.image ?? "",
    },
  }));

  const profileForm: ProfileForm = {
    name: profile?.name ?? "",
    role: profile?.role ?? "",
    tagline: profile?.tagline ?? "",
    intro: profile?.intro ?? "",
    location: profile?.location ?? "",
    availability: profile?.availability ?? "",
    email: profile?.email ?? "",
    whatsapp: profile?.whatsapp ?? "",
    resumeUrl: profile?.resumeUrl ?? "",
    githubUrl: profile?.githubUrl ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    xUrl: profile?.xUrl ?? "",
    heroImage: profile?.heroImage ?? "",
    contactImage: profile?.contactImage ?? "",
    aboutTitle: profile?.aboutTitle ?? "",
    aboutIntro: profile?.aboutIntro ?? "",
    techStack: (profile?.techStack ?? []).join(", "),
  };

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Workspace</p>
        <h1 className="mt-2 text-3xl text-ink">Content manager</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
          Edit the projects, services, testimonials, and profile shown on the public site.
          Unpublished items stay hidden from visitors.
        </p>
      </header>
      <CmsManager
        projects={projectItems}
        services={serviceItems}
        testimonials={testimonialItems}
        profile={profileForm}
      />
    </div>
  );
}
