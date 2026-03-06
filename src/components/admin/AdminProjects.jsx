
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none placeholder:text-black/35 focus:border-forest";
const textareaClass = "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-black/35 focus:border-forest";
const buttonPrimary = "inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";
const buttonSecondary = "inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-black hover:text-white";

function Field({ className = "", ...props }) {
  return <input {...props} className={`${inputClass} ${className}`.trim()} />;
}

function Area({ className = "", ...props }) {
  return <textarea {...props} className={`${textareaClass} ${className}`.trim()} />;
}

const emptyProject = {
  title: "",
  slug: "",
  category: "",
  summary: "",
  stack: "",
  image: "",
  liveUrl: "",
  repoUrl: "",
  featured: false,
  order: 0
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingProjectId, setEditingProjectId] = useState("");
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/projects`);
      const data = await res.json();
      setProjects(data.data || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const handleSubmit = async (event) => {
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
      setStatus(editingProjectId ? "Project updated!" : "Project created!");
      resetForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/projects/${id}`, { method: "DELETE" });
      setStatus("Project deleted!");
      if (editingProjectId === id) resetForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (project) => {
    setEditingProjectId(project._id);
    setProjectForm({
      title: project.title || "",
      slug: project.slug || "",
      category: project.category || "",
      summary: project.summary || "",
      stack: (project.stack || []).join(", "),
      image: project.image || "",
      liveUrl: project.liveUrl || "",
      repoUrl: project.repoUrl || "",
      featured: project.featured || false,
      order: project.order || 0
    });
  };

  const resetForm = () => {
    setProjectForm(emptyProject);
    setEditingProjectId("");
  };

  const handleOrderChange = async (id, newOrder) => {
    setBusy(true);
    try {
      const project = projects.find((p) => p._id === id);
      if (project) {
        await authFetch(`${API_BASE}/content/projects/${id}`, {
          method: "PUT",
          body: JSON.stringify({ ...project, order: parseInt(newOrder) })
        });
        await loadData();
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Projects page</p>
            <h3 className="mt-3 text-3xl text-ink">{editingProjectId ? "Edit project" : "Create project"}</h3>
          </div>
          {editingProjectId ? (
            <button type="button" className={buttonSecondary} onClick={resetForm}>
              New project
            </button>
          ) : null}
        </div>

        {status && (
          <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
            {status}
          </p>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field 
              placeholder="Project title" 
              value={projectForm.title} 
              onChange={(e) => setProjectForm((c) => ({ ...c, title: e.target.value }))} 
            />
            <Field 
              placeholder="Slug (e.g., my-project)" 
              value={projectForm.slug} 
              onChange={(e) => setProjectForm((c) => ({ ...c, slug: e.target.value }))} 
            />
          </div>
          
          <Field 
            placeholder="Category (e.g., SaaS Platform)" 
            value={projectForm.category} 
            onChange={(e) => setProjectForm((c) => ({ ...c, category: e.target.value }))} 
          />
          
          <Area 
            placeholder="Summary (brief description)" 
            value={projectForm.summary} 
            onChange={(e) => setProjectForm((c) => ({ ...c, summary: e.target.value }))} 
            rows="3" 
          />
          
          <Field 
            placeholder="Tech stack (comma separated, e.g., React, Node.js)" 
            value={projectForm.stack} 
            onChange={(e) => setProjectForm((c) => ({ ...c, stack: e.target.value }))} 
          />
          
          <Field 
            placeholder="Image URL" 
            value={projectForm.image} 
            onChange={(e) => setProjectForm((c) => ({ ...c, image: e.target.value }))} 
          />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Field 
              placeholder="Live URL (e.g., https://myproject.com)" 
              value={projectForm.liveUrl} 
              onChange={(e) => setProjectForm((c) => ({ ...c, liveUrl: e.target.value }))} 
            />
            <Field 
              placeholder="Repository URL (e.g., https://github.com/user/repo)" 
              value={projectForm.repoUrl} 
              onChange={(e) => setProjectForm((c) => ({ ...c, repoUrl: e.target.value }))} 
            />
          </div>
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={projectForm.featured}
              onChange={(e) => setProjectForm((c) => ({ ...c, featured: e.target.checked }))}
              className="h-5 w-5 rounded border-black/20 text-forest focus:ring-forest"
            />
            <span className="text-sm font-medium text-ink">Featured project (shows on homepage)</span>
          </label>
          
          <Field 
            type="number" 
            placeholder="Order (lower numbers appear first)" 
            value={projectForm.order} 
            onChange={(e) => setProjectForm((c) => ({ ...c, order: parseInt(e.target.value) || 0 }))} 
          />
          
          <button type="submit" className={buttonPrimary} disabled={busy}>
            {busy ? "Saving..." : editingProjectId ? "Update project" : "Create project"}
          </button>
        </form>
      </div>

      <div className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-2xl text-ink">Saved projects</h4>
          <span className="text-sm font-semibold text-black/45">{projects.length}</span>
        </div>
        <div className="mt-5 grid gap-4">
          {sortedProjects.map((project) => (
            <article key={project._id} className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="h-20 w-24 rounded-2xl object-cover" />
                ) : null}
                <div>
                  <strong className="block text-lg text-ink">{project.title}</strong>
                  <p className="mt-1 text-sm text-black/55">{project.category}</p>
                  <small className="mt-2 block text-xs leading-6 uppercase tracking-[0.16em] text-black/40">
                    {(project.stack || []).join(", ")} • #{project.order || 0}
                  </small>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  className="w-16 rounded-xl border border-black/10 bg-white px-2 py-1 text-center text-sm"
                  value={project.order || 0}
                  onChange={(e) => handleOrderChange(project._id, e.target.value)}
                  min="0"
                />
                <button type="button" className={buttonSecondary} onClick={() => startEdit(project)}>
                  Edit
                </button>
                <button type="button" className={buttonSecondary} onClick={() => handleDelete(project._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

