

import { useEffect, useState } from "react";
import { compressImageToDataUrl } from "../../utils/image.js";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none placeholder:text-black/35 focus:border-forest";
const textareaClass = "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none placeholder:text-black/35 focus:border-forest";
const buttonPrimary = "inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";

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
          <button type="button" className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-black hover:text-white" onClick={onRemove}>
            Remove image
          </button>
        </div>
      ) : null}
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminFrontPage() {
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    tagline: "",
    intro: "",
    heroImage: "",
    contactImage: ""
  });
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
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE}/content/profile`);
        const data = await res.json();
        if (data.data) {
          setProfile(data.data);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/profile`, {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      setStatus("Front page updated successfully!");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleImageChange = async (event, key) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageToDataUrl(file);
      setProfile((current) => ({ ...current, [key]: compressed }));
      setStatus("Image compressed and ready to save.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Front page</p>
      <h3 className="mt-3 text-3xl text-ink">Edit hero section</h3>
      
      {status && (
        <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
          {status}
        </p>
      )}
      
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <Field
          type="text"
          placeholder="Your name"
          value={profile.name || ""}
          onChange={(e) => setProfile((current) => ({ ...current, name: e.target.value }))}
        />
        <Field
          type="text"
          placeholder="Your role (e.g., Full Stack Developer)"
          value={profile.role || ""}
          onChange={(e) => setProfile((current) => ({ ...current, role: e.target.value }))}
        />
        <Area
          placeholder="tagline"
          value={profile.tagline || ""}
          onChange={(e) => setProfile((current) => ({ ...current, tagline: e.target.value }))}
          rows="4"
        />
        <Area
          placeholder="intro"
          value={profile.intro || ""}
          onChange={(e) => setProfile((current) => ({ ...current, intro: e.target.value }))}
          rows="4"
        />
        <Field
          type="text"
          placeholder="Front page image URL"
          value={profile.heroImage || ""}
          onChange={(e) => setProfile((current) => ({ ...current, heroImage: e.target.value }))}
        />
        <UploadPanel
          label="Front page image"
          filename={profile.heroImage ? "Saved image" : "Paste a URL above or upload a file."}
          onChange={(e) => handleImageChange(e, "heroImage")}
          image={profile.heroImage}
          alt="Front page preview"
          onRemove={() => setProfile((current) => ({ ...current, heroImage: "" }))}
        />
        <Field
          type="text"
          placeholder="Contact page image URL"
          value={profile.contactImage || ""}
          onChange={(e) => setProfile((current) => ({ ...current, contactImage: e.target.value }))}
        />
        <UploadPanel
          label="Contact page image"
          filename={profile.contactImage ? "Saved image" : "Paste a URL above or upload a file."}
          onChange={(e) => handleImageChange(e, "contactImage")}
          image={profile.contactImage}
          alt="Contact page preview"
          onRemove={() => setProfile((current) => ({ ...current, contactImage: "" }))}
        />
        <button type="submit" className={buttonPrimary} disabled={busy}>
          {busy ? "Saving..." : "Save front page"}
        </button>
      </form>
    </section>
  );
}


