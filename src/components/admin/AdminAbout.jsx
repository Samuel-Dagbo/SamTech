

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

export default function AdminAbout() {
  const [profile, setProfile] = useState({
    aboutTitle: "",
    aboutIntro: "",
    aboutName: "",
    aboutEducation: "",
    aboutImage: "",
    aboutGallery: [],
    aboutWhoTitle: "",
    aboutWhoBody: "",
    aboutStackTitle: "",
    aboutStackBody: "",
    aboutJourneyTitle: "",
    aboutJourneyBody: "",
    aboutInspirationTitle: "",
    aboutInspirationBody: "",
    aboutApproachTitle: "",
    aboutApproachBody: ""
  });
  const [aboutGalleryUrl, setAboutGalleryUrl] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
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
      setStatus("About page updated successfully!");
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
      setProfile((current) => {
        const next = { ...current, [key]: compressed };
        if (key === "aboutImage") {
          next.aboutGallery = current.aboutGallery?.length
            ? [compressed, ...current.aboutGallery.filter((item) => item !== compressed)].slice(0)
            : [compressed];
        }
        return next;
      });
      setUploadedFileName(file.name);
      setStatus("Image compressed and ready to save.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const addGalleryUrl = () => {
    const value = aboutGalleryUrl.trim();
    if (!value) return;

    const nextProfile = {
      ...profile,
      aboutGallery: [...(profile.aboutGallery || []), value]
    };
    nextProfile.aboutImage = nextProfile.aboutGallery[0] || profile.aboutImage || "";

    setBusy(true);
    authFetch(`${API_BASE}/content/profile`, {
      method: "PUT",
      body: JSON.stringify(nextProfile)
    })
      .then(() => {
        setProfile(nextProfile);
        setAboutGalleryUrl("");
        setStatus("Gallery image URL added.");
      })
      .catch((error) => {
        setStatus(error.message);
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const removeGalleryImage = (index) => {
    const nextGallery = (profile.aboutGallery || []).filter((_, itemIndex) => itemIndex !== index);
    const nextProfile = {
      ...profile,
      aboutGallery: nextGallery,
      aboutImage: nextGallery[0] || ""
    };

    setBusy(true);
    authFetch(`${API_BASE}/content/profile`, {
      method: "PUT",
      body: JSON.stringify(nextProfile)
    })
      .then(() => {
        setProfile(nextProfile);
        setStatus("Gallery image removed.");
      })
      .catch((error) => {
        setStatus(error.message);
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">About page</p>
      <h3 className="mt-3 text-3xl text-ink">Edit about content</h3>
      
      {status && (
        <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
          {status}
        </p>
      )}
      
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <Field 
          type="text" 
          placeholder="About page title" 
          value={profile.aboutTitle || ""} 
          onChange={(e) => setProfile((c) => ({ ...c, aboutTitle: e.target.value }))} 
        />
        <Area 
          placeholder="About page intro" 
          value={profile.aboutIntro || ""} 
          onChange={(e) => setProfile((c) => ({ ...c, aboutIntro: e.target.value }))} 
          rows="4" 
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field 
            type="text" 
            placeholder="Your name" 
            value={profile.aboutName || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutName: e.target.value }))} 
          />
          <Field 
            type="text" 
            placeholder="Education" 
            value={profile.aboutEducation || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutEducation: e.target.value }))} 
          />
        </div>

        <Field 
          type="text" 
          placeholder="About image URL" 
          value={profile.aboutImage || ""} 
          onChange={(e) => setProfile((c) => ({ ...c, aboutImage: e.target.value }))} 
        />
        <UploadPanel
          label="About page image"
          filename={uploadedFileName || profile.aboutImage ? "Saved image" : "Paste a URL above or upload a file."}
          onChange={(e) => handleImageChange(e, "aboutImage")}
          image={profile.aboutImage}
          alt="About page preview"
          onRemove={() => {
            setProfile((c) => ({ ...c, aboutImage: "", aboutGallery: [] }));
            setUploadedFileName("");
          }}
        />

        <div className="grid gap-4 rounded-[24px] border border-black/10 bg-white/55 p-4">
          <span className="text-sm font-semibold text-ink">About Gallery Images</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Field
              type="text"
              placeholder="Add gallery image URL"
              value={aboutGalleryUrl}
              onChange={(e) => setAboutGalleryUrl(e.target.value)}
              className="flex-1"
            />
            <button type="button" className={buttonSecondary} onClick={addGalleryUrl}>
              Add URL
            </button>
          </div>
          {(profile.aboutGallery || []).length > 0 && (
            <div className={`grid gap-3 ${profile.aboutGallery.length === 1 ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"}`}>
              {profile.aboutGallery.map((image, index) => (
                <div key={`${image}-${index}`} className="grid gap-2 rounded-[22px] border border-black/10 bg-white p-3">
                  <img src={image} alt={`About gallery ${index + 1}`} className="h-32 w-full rounded-[18px] object-cover" />
                  <button type="button" className={buttonSecondary} onClick={() => removeGalleryImage(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field 
            type="text" 
            placeholder="Who I am - title" 
            value={profile.aboutWhoTitle || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutWhoTitle: e.target.value }))} 
          />
          <Field 
            type="text" 
            placeholder="Tech stack - title" 
            value={profile.aboutStackTitle || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutStackTitle: e.target.value }))} 
          />
          <Area 
            placeholder="Who I am - body" 
            value={profile.aboutWhoBody || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutWhoBody: e.target.value }))} 
            rows="5" 
          />
          <Area 
            placeholder="Tech stack - body" 
            value={profile.aboutStackBody || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutStackBody: e.target.value }))} 
            rows="5" 
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field 
            type="text" 
            placeholder="My journey - title" 
            value={profile.aboutJourneyTitle || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutJourneyTitle: e.target.value }))} 
          />
          <Field 
            type="text" 
            placeholder="What drives me - title" 
            value={profile.aboutInspirationTitle || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutInspirationTitle: e.target.value }))} 
          />
          <Area 
            placeholder="My journey - body" 
            value={profile.aboutJourneyBody || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutJourneyBody: e.target.value }))} 
            rows="5" 
          />
          <Area 
            placeholder="What drives me - body" 
            value={profile.aboutInspirationBody || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, aboutInspirationBody: e.target.value }))} 
            rows="5" 
          />
        </div>

        <Field 
          type="text" 
          placeholder="How I work - title" 
          value={profile.aboutApproachTitle || ""} 
          onChange={(e) => setProfile((c) => ({ ...c, aboutApproachTitle: e.target.value }))} 
        />
        <Area 
          placeholder="How I work - body" 
          value={profile.aboutApproachBody || ""} 
          onChange={(e) => setProfile((c) => ({ ...c, aboutApproachBody: e.target.value }))} 
          rows="5" 
        />

        <button type="submit" className={buttonPrimary} disabled={busy}>
          {busy ? "Saving..." : "Save about page"}
        </button>
      </form>
    </section>
  );
}


