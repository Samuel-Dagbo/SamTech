import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none placeholder:text-black/35 focus:border-forest";
const buttonPrimary = "inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";

function Field({ className = "", ...props }) {
  return <input {...props} className={`${inputClass} ${className}`.trim()} />;
}

export default function AdminSocial() {
  const [profile, setProfile] = useState({
    githubUrl: "",
    linkedinUrl: "",
    xUrl: "",
    resumeUrl: ""
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
          setProfile({
            githubUrl: data.data.githubUrl || "",
            linkedinUrl: data.data.linkedinUrl || "",
            xUrl: data.data.xUrl || "",
            resumeUrl: data.data.resumeUrl || ""
          });
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
      setStatus("Social links updated successfully!");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      setStatus("Please upload a PDF file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setStatus("File size must be less than 5MB");
      return;
    }

    setBusy(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result;
        setProfile((prev) => ({ ...prev, resumeUrl: base64 }));
        setStatus("Resume uploaded. Click Save to persist.");
        setBusy(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setStatus(error.message);
      setBusy(false);
    }
  };

  return (
    <section className={cardClass}>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Social & CV</p>
        <h3 className="mt-3 text-3xl text-ink">Social links and resume</h3>
        
        {status && (
          <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
            {status}
          </p>
        )}
        
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <Field 
            type="text" 
            placeholder="GitHub URL" 
            value={profile.githubUrl || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, githubUrl: e.target.value }))} 
          />
          <Field 
            type="text" 
            placeholder="LinkedIn URL" 
            value={profile.linkedinUrl || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, linkedinUrl: e.target.value }))} 
          />
          <Field 
            type="text" 
            placeholder="X (Twitter) URL" 
            value={profile.xUrl || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, xUrl: e.target.value }))} 
          />
          <Field 
            type="text" 
            placeholder="Resume URL (PDF link)" 
            value={profile.resumeUrl || ""} 
            onChange={(e) => setProfile((c) => ({ ...c, resumeUrl: e.target.value }))} 
          />
          <div className="grid gap-3 rounded-[24px] border border-dashed border-black/10 bg-white/50 p-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-ink">Upload Resume (PDF)</span>
              <input type="file" accept="application/pdf" className="text-sm text-black/60" onChange={handleResumeUpload} disabled={busy} />
            </label>
            <small className="text-xs leading-6 text-black/50">
              {profile.resumeUrl ? "Saved resume file" : "Upload a PDF file (max 5MB)"}
            </small>
            {profile.resumeUrl && profile.resumeUrl.startsWith("data:") && (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-forest underline">
                View uploaded resume
              </a>
            )}
          </div>
          <button type="submit" className={buttonPrimary} disabled={busy}>
            {busy ? "Saving..." : "Save social links"}
          </button>
        </form>
      </div>
    </section>
  );
}