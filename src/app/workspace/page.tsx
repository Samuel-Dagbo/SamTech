import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/session";
import { ROLE_LABELS, canUser } from "@/lib/auth/rbac";
import { listTasks } from "@/lib/services/tasks";
import { listAnnouncements } from "@/lib/services/announcements";
import { DEPARTMENT_LABELS, type Department } from "@/lib/auth/rbac";
import Project from "@/models/project";
import Service from "@/models/service";
import Testimonial from "@/models/testimonial";
import ContactMessage from "@/models/contact-message";
import Profile from "@/models/profile";
import { FounderDashboard } from "@/components/workspace/founder-dashboard";
import type { CmsItem, ProfileForm } from "@/components/workspace/cms-manager";
import { serializeFaq, serializeTimeline } from "@/lib/validation/cms";

export const dynamic = "force-dynamic";

const MODULES = [
  { name: "Content manager", href: "/workspace/cms", permission: "cms.manage", description: "Projects, services, testimonials, profile." },
  { name: "Tasks", href: "/workspace/tasks", permission: "workspace.view", description: "Assign, track, and complete work." },
  { name: "Announcements", href: "/workspace/announcements", permission: "workspace.view", description: "Updates for everyone or one department." },
  { name: "Resources", href: "/workspace/resources", permission: "workspace.view", description: "Briefs, assets, templates, guides." },
  { name: "Marketing", href: "/workspace/marketing", permission: "workspace.view", description: "Plan and track channel posts." },
  { name: "Team", href: "/workspace/team", permission: "team.manage", description: "Invite, suspend, and grant access." },
] as const;

export default async function WorkspaceHomePage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login?next=/workspace");
  }

  const manageCms = canUser(auth.user, "cms.manage");

  if (manageCms) {
    await connectDB();
    const [statsData, profile, projects, services, testimonials] = await Promise.all([
      Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ published: { $ne: false } }),
        Service.countDocuments(),
        Service.countDocuments({ published: { $ne: false } }),
        Testimonial.countDocuments(),
        Testimonial.countDocuments({ published: { $ne: false } }),
        ContactMessage.countDocuments(),
        ContactMessage.countDocuments({ status: "new" }),
      ]).then(([projects, publishedProjects, services, publishedServices, testimonials, publishedTestimonials, messages, newMessages]) => ({
        projects,
        publishedProjects,
        services,
        publishedServices,
        testimonials,
        publishedTestimonials,
        messages,
        newMessages,
      })),
      (async () => {
        const doc = await Profile.findOne().sort({ createdAt: -1 }).lean<{
          name?: string;
          role?: string;
          tagline?: string;
          intro?: string;
          location?: string;
          yearsExperience?: string;
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
          aboutImage?: string;
          aboutGallery?: string[];
          aboutName?: string;
          aboutEducation?: string;
          aboutJourneyTitle?: string;
          aboutJourneyBody?: string;
          aboutInspirationTitle?: string;
          aboutInspirationBody?: string;
          aboutWhoTitle?: string;
          aboutWhoBody?: string;
          aboutStackTitle?: string;
          aboutStackBody?: string;
          aboutApproachTitle?: string;
          aboutApproachBody?: string;
          techStack?: string[];
          brands?: string[];
          experienceTimeline?: { period?: string; title?: string; subtitle?: string; description?: string }[];
          faqItems?: { question?: string; answer?: string }[];
        } | null>();
        const profileForm: ProfileForm = {
          name: doc?.name ?? "",
          role: doc?.role ?? "",
          tagline: doc?.tagline ?? "",
          intro: doc?.intro ?? "",
          location: doc?.location ?? "",
          yearsExperience: doc?.yearsExperience ?? "",
          availability: doc?.availability ?? "",
          email: doc?.email ?? "",
          whatsapp: doc?.whatsapp ?? "",
          resumeUrl: doc?.resumeUrl ?? "",
          githubUrl: doc?.githubUrl ?? "",
          linkedinUrl: doc?.linkedinUrl ?? "",
          xUrl: doc?.xUrl ?? "",
          heroImage: doc?.heroImage ?? "",
          contactImage: doc?.contactImage ?? "",
          aboutTitle: doc?.aboutTitle ?? "",
          aboutIntro: doc?.aboutIntro ?? "",
          aboutImage: doc?.aboutImage ?? "",
          aboutGallery: (doc?.aboutGallery ?? []).join("\n"),
          aboutName: doc?.aboutName ?? "",
          aboutEducation: doc?.aboutEducation ?? "",
          aboutJourneyTitle: doc?.aboutJourneyTitle ?? "",
          aboutJourneyBody: doc?.aboutJourneyBody ?? "",
          aboutInspirationTitle: doc?.aboutInspirationTitle ?? "",
          aboutInspirationBody: doc?.aboutInspirationBody ?? "",
          aboutWhoTitle: doc?.aboutWhoTitle ?? "",
          aboutWhoBody: doc?.aboutWhoBody ?? "",
          aboutStackTitle: doc?.aboutStackTitle ?? "",
          aboutStackBody: doc?.aboutStackBody ?? "",
          aboutApproachTitle: doc?.aboutApproachTitle ?? "",
          aboutApproachBody: doc?.aboutApproachBody ?? "",
          techStack: (doc?.techStack ?? []).join(", "),
          brands: (doc?.brands ?? []).join(", "),
          experienceTimelineRaw: serializeTimeline(doc?.experienceTimeline),
          faqItemsRaw: serializeFaq(doc?.faqItems),
        };
        return profileForm;
      })(),
      (async () => {
        const projectDocs = await Project.find().sort({ order: 1, createdAt: -1 }).lean();
        const projects: CmsItem[] = projectDocs.map((doc) => ({
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
        return projects;
      })(),
      (async () => {
        const serviceDocs = await Service.find().sort({ order: 1, createdAt: -1 }).lean();
        const services: CmsItem[] = serviceDocs.map((doc) => ({
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
        return services;
      })(),
      (async () => {
        const testimonialDocs = await Testimonial.find().sort({ order: 1, createdAt: -1 }).lean();
        const testimonials: CmsItem[] = testimonialDocs.map((doc) => ({
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
        return testimonials;
      })(),
    ]);

    return (
      <FounderDashboard
        email={auth.user.email}
        title={auth.user.title}
        department={auth.user.department}
        stats={statsData}
        profile={profile}
        projects={projects}
        services={services}
        testimonials={testimonials}
      />
    );
  }

  // Non-content managers keep the team operations module grid.
  const [tasks, announcements] = await Promise.all([
    listTasks({ viewer: auth.user }),
    listAnnouncements({ role: auth.user.role, department: auth.user.department, manage: canUser(auth.user, "announcements.publish") }),
  ]);
  const firstName = auth.user.name.split(" ")[0] || auth.user.name;
  const openTasks = tasks.filter((task) => task.status !== "done");
  const myOpen = openTasks.filter((task) => task.assigneeId === auth.user.id);
  const latestAnnouncement = announcements[0];

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          {ROLE_LABELS[auth.user.role]} dashboard
        </p>
        <h1 className="mt-3 text-3xl leading-tight text-ink sm:text-4xl">Welcome back, {firstName}.</h1>
        <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">
          You are signed in as <strong>{auth.user.email}</strong>
          {auth.user.title ? ` — ${auth.user.title}` : ""}.
          {auth.user.department
            ? ` Department: ${DEPARTMENT_LABELS[auth.user.department as Department] ?? auth.user.department}.`
            : ""}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/workspace/tasks"
            className="rounded-full border border-forest/15 bg-forest/10 px-3 py-1 text-xs font-semibold text-forest transition hover:bg-forest/20"
          >
            {myOpen.length ? `${myOpen.length} task${myOpen.length === 1 ? "" : "s"} assigned to you` : "No open tasks for you"}
          </Link>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
            {openTasks.length} open across the team
          </span>
          <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/60">
            Session expires {auth.session.expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </section>

      {latestAnnouncement ? (
        <section className="rounded-[28px] border border-clay/30 bg-clay/5 p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-strong">Latest announcement</p>
          <h2 className="mt-2 text-lg text-ink">{latestAnnouncement.title}</h2>
          <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-6 text-black/60">{latestAnnouncement.body}</p>
          <Link href="/workspace/announcements" className="mt-3 inline-block text-sm font-semibold text-clay-strong hover:underline">
            See all announcements →
          </Link>
        </section>
      ) : null}

      <section>
        <h2 className="text-xl text-ink">Modules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => {
            const permitted = canUser(auth.user, module.permission);
            return (
              <Link
                key={module.name}
                href={module.href}
                className="rounded-[22px] border border-black/10 bg-white/75 p-5 shadow-panel backdrop-blur transition hover:border-clay/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg text-ink">{module.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      permitted ? "bg-forest/10 text-forest" : "bg-black/5 text-black/45"
                    }`}
                  >
                    {permitted ? "Access" : "View only"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/55">{module.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
