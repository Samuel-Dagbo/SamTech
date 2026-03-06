
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
const buttonSecondary =
  "inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-black hover:text-white";

export default function AdminOverview() {
  const [profile, setProfile] = useState({ name: "", brands: [] });
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, projectsRes, servicesRes, testimonialsRes, messagesRes] = await Promise.all([
          fetch(`${API_BASE}/content/profile`).then((res) => res.json()),
          fetch(`${API_BASE}/content/projects`).then((res) => res.json()),
          fetch(`${API_BASE}/content/services`).then((res) => res.json()),
          fetch(`${API_BASE}/content/testimonials`).then((res) => res.json()),
          fetch(`${API_BASE}/content/messages`).then((res) => res.json()).catch(() => ({ data: [] }))
        ]);

        setProfile(profileRes.data || { name: "", brands: [] });
        setProjects(projectsRes.data || []);
        setServices(servicesRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setMessages(messagesRes.data || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Projects", projects.length, "/admin/projects"],
          ["Services", services.length, "/admin/services"],
          ["Testimonials", testimonials.length, "/admin/testimonials"],
          ["Messages", messages.length, "/admin/messages"]
        ].map(([title, value, link]) => (
          <article key={title} className={`${cardClass} p-6`}>
            <span className="text-sm font-semibold text-black/55">{title}</span>
            <strong className="mt-3 block text-3xl text-ink">{value}</strong>
            <Link to={link} className={`mt-5 inline-flex ${buttonSecondary}`}>
              Manage {title.toLowerCase()}
            </Link>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className={`${cardClass} p-6`}>
          <span className="text-sm font-semibold text-black/55">Profile</span>
          <strong className="mt-3 block text-2xl text-ink">{profile.name || "Not set"}</strong>
          <Link to="/admin/profile" className={`mt-5 inline-flex ${buttonSecondary}`}>
            Edit profile
          </Link>
        </article>
        <article className={`${cardClass} p-6`}>
          <span className="text-sm font-semibold text-black/55">Social Links</span>
          <strong className="mt-3 block text-2xl text-ink">{profile.brands?.length || 0} brands</strong>
          <Link to="/admin/social" className={`mt-5 inline-flex ${buttonSecondary}`}>
            Manage social & CV
          </Link>
        </article>
        <article className={`${cardClass} p-6`}>
          <span className="text-sm font-semibold text-black/55">Brands</span>
          <strong className="mt-3 block text-2xl text-ink">{profile.brands?.length || 0} brands</strong>
          <Link to="/admin/brands" className={`mt-5 inline-flex ${buttonSecondary}`}>
            Manage brands
          </Link>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Front Page", desc: "Edit hero content and image", path: "/admin/frontpage" },
          { label: "About Page", desc: "Edit about copy and image", path: "/admin/about" },
          { label: "Social & CV", desc: "Social links and resume upload", path: "/admin/social" },
          { label: "Brands", desc: "Featured clients and brands", path: "/admin/brands" },
          { label: "Services", desc: "Manage service cards and images", path: "/admin/services" },
          { label: "Projects", desc: "Create, edit, and remove portfolio work", path: "/admin/projects" }
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${cardClass} min-h-[140px] p-6 text-left transition hover:-translate-y-1`}
          >
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-clay">
              {item.label}
            </span>
            <strong className="mt-3 block text-xl leading-tight text-ink">{item.desc}</strong>
          </Link>
        ))}
      </div>
    </div>
  );
}

