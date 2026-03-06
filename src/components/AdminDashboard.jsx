
import { useEffect, useState } from "react";
import { compressImageToDataUrl } from "../utils/image.js";
import {
  AdminOverview,
  AdminFrontPage,
  AdminProfile,
  AdminSocial,
  AdminBrands,
  AdminAbout,
  AdminServices,
  AdminProjects,
  AdminTestimonials
} from "./admin/index.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const sectionItems = [
  { id: "overview", label: "Overview", description: "Quick stats and shortcuts" },
  { id: "frontpage", label: "Front Page", description: "Edit hero content and image" },
  { id: "profile", label: "Profile", description: "Edit your identity and contact" },
  { id: "social", label: "Social & CV", description: "Social links and resume upload" },
  { id: "brands", label: "Brands", description: "Featured clients and brands" },
  { id: "about", label: "About Page", description: "Edit about copy and image" },
  { id: "services", label: "Services", description: "Manage service cards and images" },
  { id: "projects", label: "Projects", description: "Create, edit, and remove portfolio work" },
  { id: "testimonials", label: "Testimonials", description: "Manage client proof and reviews" }
];

const emptyProfile = {
  name: "",
  role: "",
  tagline: "",
  intro: "",
  heroImage: "",
  contactImage: "",
  aboutTitle: "",
  aboutIntro: "",
  aboutImage: "",
  aboutGallery: [],
  aboutName: "",
  aboutEducation: "",
  aboutJourneyTitle: "",
  aboutJourneyBody: "",
  aboutInspirationTitle: "",
  aboutInspirationBody: "",
  aboutWhoTitle: "",
  aboutWhoBody: "",
  aboutStackTitle: "",
  aboutStackBody: "",
  aboutApproachTitle: "",
  aboutApproachBody: "",
  location: "",
  yearsExperience: "",
  availability: "",
  whatsapp: "",
  email: "",
  githubUrl: "",
  linkedinUrl: "",
  xUrl: "",
  resumeUrl: "",
  brands: []
};

const emptyService = {
  title: "",
  copy: "",
  image: "",
  order: 0
};

const emptyProject = {
  title: "",
  category: "",
  summary: "",
  stack: "",
  image: "",
  liveUrl: "",
  repoUrl: "",
  featured: false,
  order: 0
};

const emptyTestimonial = {
  name: "",
  company: "",
  quote: "",
  image: "",
  order: 0
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [profile, setProfile] = useState(emptyProfile);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [editingServiceId, setEditingServiceId] = useState("");
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editingTestimonialId, setEditingTestimonialId] = useState("");
  const [serviceImageName, setServiceImageName] = useState("");
  const [projectImageName, setProjectImageName] = useState("");
  const [testimonialImageName, setTestimonialImageName] = useState("");
  const [brandsInput, setBrandsInput] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const token = localStorage.getItem("samtech_admin_token");

  const authFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || "Request failed");
    }
    return payload;
  };

  const loadData = async () => {
    try {
      const [profileRes, projectsRes, servicesRes, testimonialsRes] = await Promise.all([
        fetch(`${API_BASE}/content/profile`).then((res) => res.json()),
        fetch(`${API_BASE}/content/projects`).then((res) => res.json()),
        fetch(`${API_BASE}/content/services`).then((res) => res.json()),
        fetch(`${API_BASE}/content/testimonials`).then((res) => res.json())
      ]);

      const loadedProfile = profileRes.data || emptyProfile;
      setProfile(loadedProfile);
      setBrandsInput((loadedProfile.brands || []).join(", "));
      setProjects(projectsRes.data || []);
      setServices(servicesRes.data || []);
      setTestimonials(testimonialsRes.data || []);
    } catch (error) {
      setStatus(error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitProfile = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/profile`, {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      setStatus("Profile updated.");
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const saveBrands = async () => {
    setBusy(true);
    try {
      const brands = brandsInput.split(",").map((b) => b.trim()).filter(Boolean);
      await authFetch(`${API_BASE}/content/profile`, {
        method: "PUT",
        body: JSON.stringify({ ...profile, brands })
      });
      setStatus("Brands updated.");
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const resetProjectForm = () => {
    setProjectForm(emptyProject);
    setEditingProjectId("");
    setProjectImageName("");
  };

  const resetServiceForm = () => {
    setServiceForm(emptyService);
    setEditingServiceId("");
    setServiceImageName("");
  };

  const resetTestimonialForm = () => {
    setTestimonialForm(emptyTestimonial);
    setEditingTestimonialId("");
    setTestimonialImageName("");
  };

  const handleProjectImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageToDataUrl(file);
      setProjectForm((current) => ({ ...current, image: compressed }));
      setProjectImageName(file.name);
      setStatus("Image compressed and ready to save.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleServiceImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageToDataUrl(file);
      setServiceForm((current) => ({ ...current, image: compressed }));
      setServiceImageName(file.name);
      setStatus("Service image compressed and ready to save.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleTestimonialImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageToDataUrl(file, 900, 0.76);
      setTestimonialForm((current) => ({ ...current, image: compressed }));
      setTestimonialImageName(file.name);
      setStatus("Testimonial image compressed and ready to save.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submitProject = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...projectForm,
        stack: projectForm.stack.split(",").map((item) => item.trim()).filter(Boolean)
      };
      const endpoint = editingProjectId
        ? `${API_BASE}/content/projects/${editingProjectId}`
        : `${API_BASE}/content/projects`;
      const method = editingProjectId ? "PUT" : "POST";
      await authFetch(endpoint, { method, body: JSON.stringify(payload) });
      setStatus(editingProjectId ? "Project updated." : "Project created.");
      resetProjectForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submitService = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const endpoint = editingServiceId
        ? `${API_BASE}/content/services/${editingServiceId}`
        : `${API_BASE}/content/services`;
      const method = editingServiceId ? "PUT" : "POST";
      await authFetch(endpoint, { method, body: JSON.stringify(serviceForm) });
      setStatus(editingServiceId ? "Service updated." : "Service created.");
      resetServiceForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submitTestimonial = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const endpoint = editingTestimonialId
        ? `${API_BASE}/content/testimonials/${editingTestimonialId}`
        : `${API_BASE}/content/testimonials`;
      const method = editingTestimonialId ? "PUT" : "POST";
      await authFetch(endpoint, { method, body: JSON.stringify(testimonialForm) });
      setStatus(editingTestimonialId ? "Testimonial updated." : "Testimonial created.");
      resetTestimonialForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const removeProject = async (id) => {
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/projects/${id}`, { method: "DELETE" });
      setStatus("Project deleted.");
      if (editingProjectId === id) resetProjectForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const removeService = async (id) => {
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/services/${id}`, { method: "DELETE" });
      setStatus("Service deleted.");
      if (editingServiceId === id) resetServiceForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const removeTestimonial = async (id) => {
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/testimonials/${id}`, { method: "DELETE" });
      setStatus("Testimonial deleted.");
      if (editingTestimonialId === id) resetTestimonialForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const startProjectEdit = (project) => {
    setEditingProjectId(project._id);
    setProjectImageName(project.image?.startsWith("data:") ? "Saved compressed image" : "");
    setProjectForm({
      title: project.title || "",
      category: project.category || "",
      summary: project.summary || "",
      stack: (project.stack || []).join(", "),
      image: project.image || "",
      liveUrl: project.liveUrl || "",
      repoUrl: project.repoUrl || "",
      featured: Boolean(project.featured),
      order: project.order || 0
    });
  };

  const startServiceEdit = (service) => {
    setEditingServiceId(service._id);
    setServiceForm({
      title: service.title || "",
      copy: service.copy || "",
      image: service.image || "",
      order: service.order || 0
    });
    setServiceImageName(service.image?.startsWith("data:") ? "Saved compressed image" : "");
  };

  const startTestimonialEdit = (testimonial) => {
    setEditingTestimonialId(testimonial._id);
    setTestimonialForm({
      name: testimonial.name || "",
      company: testimonial.company || "",
      quote: testimonial.quote || "",
      image: testimonial.image || "",
      order: testimonial.order || 0
    });
    setTestimonialImageName(testimonial.image?.startsWith("data:") ? "Saved image" : "");
  };

  const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
  const buttonSecondary =
    "inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-black hover:text-white";

  return (
    <main className="px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-[32px] border border-black/10 bg-white/75 p-5 shadow-panel backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Admin dashboard</p>
            <h2 className="mt-3 text-4xl leading-none text-ink sm:text-5xl">Portfolio control center</h2>
          </div>
          <button
            type="button"
            className={buttonSecondary}
            onClick={() => {
              localStorage.removeItem("samtech_admin_token");
              window.location.reload();
            }}
          >
            Sign out
          </button>
        </div>

        {status ? (
          <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60 shadow-panel">
            {status}
          </p>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[280px_1fr]">
          <aside className={`${cardClass} grid gap-3 p-3`}>
            {sectionItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${
                  activeSection === item.id
                    ? "border-forest bg-forest text-white"
                    : "border-black/10 bg-white text-ink hover:bg-black hover:text-white"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <small className={`mt-2 block text-xs leading-6 ${activeSection === item.id ? "text-white/75" : "text-black/45"}`}>
                  {item.description}
                </small>
              </button>
            ))}
          </aside>

          <div className="grid gap-5">
            {activeSection === "overview" && (
              <AdminOverview
                profile={profile}
                projects={projects}
                services={services}
                setActiveSection={setActiveSection}
              />
            )}
            {activeSection === "frontpage" && (
              <AdminFrontPage
                profile={profile}
                setProfile={setProfile}
                onSubmit={submitProfile}
                busy={busy}
                setBusy={setBusy}
                setStatus={setStatus}
              />
            )}
            {activeSection === "profile" && (
              <AdminProfile
                profile={profile}
                setProfile={setProfile}
                onSubmit={submitProfile}
                busy={busy}
              />
            )}
            {activeSection === "social" && (
              <AdminSocial
                profile={profile}
                setProfile={setProfile}
                onSubmit={submitProfile}
                busy={busy}
                brandsInput={brandsInput}
                setBrandsInput={setBrandsInput}
                saveBrands={saveBrands}
                status={status}
              />
            )}
            {activeSection === "brands" && (
              <AdminBrands
                profile={profile}
                brandsInput={brandsInput}
                setBrandsInput={setBrandsInput}
                saveBrands={saveBrands}
                busy={busy}
              />
            )}
            {activeSection === "about" && (
              <AdminAbout
                profile={profile}
                setProfile={setProfile}
                onSubmit={submitProfile}
                busy={busy}
                setBusy={setBusy}
                setStatus={setStatus}
                loadData={loadData}
              />
            )}
            {activeSection === "services" && (
              <AdminServices
                services={services}
                serviceForm={serviceForm}
                setServiceForm={setServiceForm}
                editingServiceId={editingServiceId}
                onSubmit={submitService}
                onEdit={startServiceEdit}
                onDelete={removeService}
                onNew={resetServiceForm}
                busy={busy}
                handleImageChange={handleServiceImageChange}
                imageName={serviceImageName}
              />
            )}
            {activeSection === "projects" && (
              <AdminProjects
                projects={projects}
                projectForm={projectForm}
                setProjectForm={setProjectForm}
                editingProjectId={editingProjectId}
                onSubmit={submitProject}
                onEdit={startProjectEdit}
                onDelete={removeProject}
                onNew={resetProjectForm}
                busy={busy}
                handleImageChange={handleProjectImageChange}
                imageName={projectImageName}
              />
            )}
            {activeSection === "testimonials" && (
              <AdminTestimonials
                testimonials={testimonials}
                testimonialForm={testimonialForm}
                setTestimonialForm={setTestimonialForm}
                editingTestimonialId={editingTestimonialId}
                onSubmit={submitTestimonial}
                onEdit={startTestimonialEdit}
                onDelete={removeTestimonial}
                onNew={resetTestimonialForm}
                busy={busy}
                handleImageChange={handleTestimonialImageChange}
                imageName={testimonialImageName}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

