


import { useEffect, useState } from "react";
import { useToast } from "../../components/Toast.jsx";
import { validate, isValid, schemas } from "../../utils/validation.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none placeholder:text-black/35 focus:border-forest";
const errorClass = "text-xs text-red-500 mt-1";
const buttonPrimary = "inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";

function Field({ error, className = "", ...props }) {
  return (
    <div className={className}>
      <input {...props} className={`${inputClass} ${error ? "border-red-400 focus:border-red-500" : ""} w-full`.trim()} />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    location: "",
    yearsExperience: "",
    availability: "",
    whatsapp: "",
    email: ""
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const token = localStorage.getItem("samtech_admin_token");
  const { addToast } = useToast();

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

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setProfile((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    const validationErrors = validate(profile, schemas.profile);
    setErrors(validationErrors);
    
    if (!isValid(validationErrors)) {
      addToast("Please fix the errors in the form", "error");
      return;
    }
    
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/profile`, {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      addToast("Profile updated successfully!", "success");
    } catch (error) {
      addToast(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Profile page</p>
      <h3 className="mt-3 text-3xl text-ink">Edit identity and contact</h3>
      
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Field 
          type="text" 
          placeholder="Your name *" 
          value={profile.name || ""} 
          onChange={handleChange("name")}
          error={errors.name}
        />
        <Field 
          type="text" 
          placeholder="Your role *" 
          value={profile.role || ""} 
          onChange={handleChange("role")}
          error={errors.role}
        />
        <Field 
          type="text" 
          placeholder="Location (e.g., Accra, Ghana)" 
          value={profile.location || ""} 
          onChange={handleChange("location")}
          error={errors.location}
        />
        <Field 
          type="text" 
          placeholder="Years of experience" 
          value={profile.yearsExperience || ""} 
          onChange={handleChange("yearsExperience")}
          error={errors.yearsExperience}
        />
        <Field 
          type="text" 
          placeholder="Availability (e.g., Available for freelance)" 
          value={profile.availability || ""} 
          onChange={handleChange("availability")}
          error={errors.availability}
        />
        <Field 
          type="tel" 
          placeholder="WhatsApp number" 
          value={profile.whatsapp || ""} 
          onChange={handleChange("whatsapp")}
          error={errors.whatsapp}
        />
        <Field 
          type="email" 
          placeholder="Email address" 
          value={profile.email || ""} 
          onChange={handleChange("email")}
          error={errors.email}
          className="md:col-span-2" 
        />
        <button type="submit" className={`${buttonPrimary} md:col-span-2`} disabled={busy}>
          {busy ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}


