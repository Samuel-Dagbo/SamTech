
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://samtech-server-unvk.onrender.com/api";

export default function AdminPortal() {
  const { slug: secretSlug } = useParams();
  const navigate = useNavigate();
  const existingToken = localStorage.getItem("samtech_admin_token");
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  // If already logged in, redirect to admin dashboard
  if (existingToken) {
    navigate("/admin/overview", { replace: true });
    return null;
  }

  const handleChange = ({ target: { name, value } }) => {
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setDebugInfo(`Connecting to: ${API_BASE}/portal/${secretSlug}/session`);

    try {
      const response = await fetch(`${API_BASE}/portal/${secretSlug}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      
      setDebugInfo(prev => prev + ` | Status: ${response.status}`);
      
      if (!response.ok) {
        const payload = await response.json();
        setDebugInfo(prev => prev + ` | Error: ${payload.message}`);
        throw new Error(payload.message || "Access denied");
      }

      const payload = await response.json();
      localStorage.setItem("samtech_admin_token", payload.token);
      setMessage("Access granted.");
      navigate("/admin/overview");
    } catch (error) {
      // Differentiate between network errors and other errors
      if (!navigator.onLine) {
        setMessage("You are offline. Please check your internet connection.");
      } else if (error.name === "TypeError" && error.message.includes("fetch")) {
        setMessage("Cannot connect to server. Please check if the backend is running.");
        setDebugInfo(prev => prev + ` | Network Error: ${error.message}`);
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-3 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[80vh] max-w-7xl place-items-center">
        <div className="w-full max-w-lg rounded-[32px] border border-black/10 bg-white/75 p-6 shadow-panel backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Private access</p>
          <h1 className="mt-4 text-4xl leading-none text-ink sm:text-5xl">SamTech content control</h1>
          <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
            Authenticate here to manage projects, testimonials, front-page media, and profile
            content.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <input
              type="text"
              name="username"
              placeholder="Admin username"
              value={credentials.username}
              onChange={handleChange}
              required
              className="h-14 rounded-[22px] border border-black/10 bg-white px-5 text-sm outline-none placeholder:text-black/35 focus:border-forest"
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Admin password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="h-14 rounded-[22px] border border-black/10 bg-white px-5 text-sm outline-none placeholder:text-black/35 focus:border-forest"
              />
              <button
                type="button"
                className="inline-flex h-14 items-center justify-center rounded-[22px] border border-black/10 bg-white px-5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Enter portal"}
            </button>
          </form>

          {message ? <p className="mt-4 text-sm text-black/60">{message}</p> : null}
          {debugInfo ? <p className="mt-2 text-xs text-red-400 font-mono">{debugInfo}</p> : null}
        </div>
      </div>
    </main>
  );
}

