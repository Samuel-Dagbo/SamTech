

import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const cardClass = "rounded-[28px] border border-black/10 bg-white/75 shadow-panel backdrop-blur";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none placeholder:text-black/35 focus:border-forest";
const buttonPrimary = "inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";

function Field({ className = "", ...props }) {
  return <input {...props} className={`${inputClass} ${className}`.trim()} />;
}

export default function AdminBrands() {
  const [profile, setProfile] = useState({ brands: [] });
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

  const saveBrands = async () => {
    const brands = brandsInput.split(",").map((b) => b.trim()).filter(Boolean);
    setBusy(true);
    try {
      await authFetch(`${API_BASE}/content/profile`, {
        method: "PUT",
        body: JSON.stringify({ ...profile, brands })
      });
      setProfile((prev) => ({ ...prev, brands }));
      setStatus("Brands updated successfully!");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${cardClass} p-5 sm:p-6`}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Brands page</p>
      <h3 className="mt-3 text-3xl text-ink">Featured clients and brands</h3>
      
      {status && (
        <p className="mt-4 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/60">
          {status}
        </p>
      )}
      
      <div className="mt-6 grid gap-4">
        <Field 
          type="text" 
          placeholder="Brands (comma separated)" 
          value={brandsInput || (profile.brands || []).join(", ")} 
          onChange={(e) => setBrandsInput(e.target.value)} 
        />
        <p className="text-sm text-black/55">
          Add brand/client names separated by commas. These will appear as logos on the homepage.
        </p>
        {(profile.brands || []).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {profile.brands.map((brand, index) => (
              <span key={index} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink">
                {brand}
              </span>
            ))}
          </div>
        )}
        <button type="button" className={buttonPrimary} onClick={saveBrands} disabled={busy}>
          {busy ? "Saving..." : "Save brands"}
        </button>
      </div>
    </section>
  );
}


