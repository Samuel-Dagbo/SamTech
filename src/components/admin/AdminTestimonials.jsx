

import { useEffect, useState } from "react";
import { compressImageToDataUrl } from "../../utils/image.js";

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

function UploadPanel({ label, filename, onChange, image, onRemove, alt }) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-dashed border-black/10 bg-white/50 p-4">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <input type="file" accept="image/*" onChange={onChange} className="text-sm text-black/60" />
      </label>
      <small className="text-xs leading-6 text-black/50">
        {filename || "Selected image will be compressed before save."}
      </small>
      {image ? (
        <div className="grid gap-3">
          <img src={image} alt={alt} className="h-48 w-full rounded-[22px] object-cover" />
          <button type="button" className={buttonSecondary} onClick={onRemove}>
            Remove image
          </button>
        </div>
      ) : null}
    </div>
  );
}

const emptyTestimonial = {
  name: "",
  company: "",
  quote: "",
  image: "",
  order: 0
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial);
  const [editingTestimonialId, setEditingTestimonialId] = useState("");
  const [imageName, setImageName] = useState("");
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
      const res = await fetch(`${API_BASE}/content/testimonials`);
      const data = await res.json();
      setTestimonials(data.data || []);
    } catch (error) {
      console.error("Failed to load testimonials:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const endpoint = editingTestimonialId
        ? `${API_BASE}/content/testimonials/${editingTestimonialId}`
        : `${API_BASE}/content/testimonials`;
      const method = editingTestimonialId ? "PUT" : "POST";
      await authFetch(endpoint, { method, body: JSON.stringify(testimonialForm) });
      setStatus(editingTestimonialId ? "Testimonial updated!" : "Testimonial created!");
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
      await authFetch(`${API_BASE}/content/testimonials/${id}`, { method: "DELETE" });
      setStatus("Testimonial deleted!");
      if (editingTestimonialId === id) resetForm();
      await loadData();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (testimonial) => {
    setEditingTestimonialId(testimonial._id);
    setImageName(testimonial.image?.startsWith("data:") ? "Saved image" : "");
    setTestimonialForm({
      name: testimonial.name || "",
      company: testimonial.company || "",
      quote: testimonial.quote || "",
      image: testimonial.image || "",
      order: testimonial.order || 0
    });
  };

  const resetForm = () => {
    setTestimonialForm(emptyTestimonial);
    setEditingTestimonialId("");
    setImageName("");
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageToDataUrl(file, 900, 0.76);
      setTestimonialForm((current) => ({ ...current, image: compressed }));
      setImageName(file.name);
      setStatus("Image compressed and ready to save.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOrderChange = async (id, newOrder) => {
    setBusy(true);
    try {
      const testimonial = testimonials.find((t) => t._id === id);
      if (testimonial) {
        await authFetch(`${API_BASE}/content/testimonials/${id}`, {
          method: "PUT",
          body: JSON.stringify({ ...testimonial, order: parseInt(newOrder) })
        });
        await loadData();
      }
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const sortedTestimonials = [...testimonials].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <div className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Testimonials page</p>
            <h3 className="mt-3 text-3xl text-ink">
              {editingTestimonialId ? "Edit testimonial" : "Create testimonial"}
            </h3>
          </div>
          {editingTestimonialId ? (
            <button type="button" className={buttonSecondary} onClick={resetForm}>
              New testimonial
            </button>
          ) : null}
        </div>

        {status && (
          <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
            {status}
          </p>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <Field 
            placeholder="Name" 
            value={testimonialForm.name} 
            onChange={(e) => setTestimonialForm((c) => ({ ...c, name: e.target.value }))} 
          />
          <Field 
            placeholder="Company" 
            value={testimonialForm.company} 
            onChange={(e) => setTestimonialForm((c) => ({ ...c, company: e.target.value }))} 
          />
          <Field 
            type="number" 
            placeholder="Order (lower numbers appear first)" 
            value={testimonialForm.order} 
            onChange={(e) => setTestimonialForm((c) => ({ ...c, order: parseInt(e.target.value) || 0 }))} 
          />
          <Field 
            placeholder="Image URL" 
            value={testimonialForm.image || ""} 
            onChange={(e) => setTestimonialForm((c) => ({ ...c, image: e.target.value }))} 
          />
          <UploadPanel
            label="Testimonial image or logo"
            filename={imageName || "Paste a URL above or upload a file."}
            onChange={handleImageChange}
            image={testimonialForm.image}
            alt="Testimonial preview"
            onRemove={() => {
              setTestimonialForm((c) => ({ ...c, image: "" }));
              setImageName("");
            }}
          />
          <Area 
            placeholder="Quote" 
            value={testimonialForm.quote} 
            onChange={(e) => setTestimonialForm((c) => ({ ...c, quote: e.target.value }))} 
            rows="6" 
          />
          <button type="submit" className={buttonPrimary} disabled={busy}>
            {busy ? "Saving..." : editingTestimonialId ? "Update testimonial" : "Create testimonial"}
          </button>
        </form>
      </div>

      <div className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-2xl text-ink">Saved testimonials</h4>
          <span className="text-sm font-semibold text-black/45">{testimonials.length}</span>
        </div>
        <div className="mt-5 grid gap-4">
          {sortedTestimonials.map((testimonial) => (
            <article key={testimonial._id} className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                {testimonial.image ? (
                  <img src={testimonial.image} alt={testimonial.name} className="h-16 w-16 rounded-2xl object-cover" />
                ) : null}
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="block text-lg text-ink">{testimonial.name}</strong>
                    <span className="text-xs text-black/40">#{testimonial.order || 0}</span>
                  </div>
                  <p className="mt-1 text-sm text-black/55">{testimonial.company}</p>
                  <small className="mt-3 block text-sm leading-7 text-black/55">{testimonial.quote}</small>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  className="w-16 rounded-xl border border-black/10 bg-white px-2 py-1 text-center text-sm"
                  value={testimonial.order || 0}
                  onChange={(e) => handleOrderChange(testimonial._id, e.target.value)}
                  min="0"
                />
                <button type="button" className={buttonSecondary} onClick={() => startEdit(testimonial)}>
                  Edit
                </button>
                <button type="button" className={buttonSecondary} onClick={() => handleDelete(testimonial._id)}>
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


