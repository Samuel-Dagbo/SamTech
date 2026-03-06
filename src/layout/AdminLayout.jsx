import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const sectionItems = [
  { path: "overview", label: "Overview", icon: "🏠", description: "Quick stats and shortcuts" },
  { path: "frontpage", label: "Front Page", icon: "🖼️", description: "Edit hero content and image" },
  { path: "profile", label: "Profile", icon: "👤", description: "Edit your identity and contact" },
  { path: "social", label: "Social & CV", icon: "🔗", description: "Social links and resume upload" },
  { path: "brands", label: "Brands", icon: "🏷️", description: "Featured clients and brands" },
  { path: "about", label: "About Page", icon: "📄", description: "Edit about copy and image" },
  { path: "services", label: "Services", icon: "🛠️", description: "Manage service cards and images" },
  { path: "projects", label: "Projects", icon: "💼", description: "Create, edit, and remove portfolio work" },
  { path: "testimonials", label: "Testimonials", icon: "⭐", description: "Manage client proof and reviews" },
  { path: "messages", label: "Messages", icon: "✉️", description: "View contact form submissions" }
];

const cardClass =
  "rounded-[28px] border border-black/10 bg-white/80 shadow-lg backdrop-blur";

const buttonSecondary =
  "inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-ink transition hover:bg-black hover:text-white";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <main className="px-3 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col gap-4 rounded-[32px] border border-black/10 bg-white/80 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div className="flex items-center gap-4">

            {/* MOBILE MENU */}
            <button
              className="xl:hidden flex h-11 w-11 items-center justify-center rounded-full border border-black/10"
              onClick={() => setMobileSidebar(true)}
            >
              ☰
            </button>

            {/* DESKTOP COLLAPSE */}
            <button
              className="hidden xl:flex h-11 w-11 items-center justify-center rounded-full border border-black/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "←" : "→"}
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                Admin dashboard
              </p>

              <h2 className="mt-1 text-3xl font-bold text-gray-800 sm:text-4xl">
                Portfolio control center
              </h2>
            </div>
          </div>

          <div className="flex gap-3">
            <a href="/" className={buttonSecondary}>
              View site
            </a>

            <button
              className={buttonSecondary}
              onClick={() => {
                localStorage.removeItem("samtech_admin_token");
                window.location.href = "/";
              }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div
          className={`mt-6 grid gap-5 ${
            sidebarOpen ? "xl:grid-cols-[260px_1fr]" : "xl:grid-cols-[80px_1fr]"
          }`}
        >

          {/* DESKTOP SIDEBAR */}
          <aside
            className={`${cardClass} hidden xl:flex flex-col gap-2 p-3 transition-all duration-300`}
          >
            {sectionItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white border-black/10 hover:bg-black hover:text-white"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>

                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <small className="text-xs font-normal opacity-70">
                      {item.description}
                    </small>
                  </div>
                )}
              </NavLink>
            ))}
          </aside>

          {/* MOBILE SIDEBAR */}
          {mobileSidebar && (
            <div
              className="fixed inset-0 z-40 bg-black/40 xl:hidden"
              onClick={() => setMobileSidebar(false)}
            >
              <div
                className="absolute left-0 top-0 h-full w-72 bg-white p-5 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Menu</h3>

                  <button
                    onClick={() => setMobileSidebar(false)}
                    className="rounded-full border px-3 py-1"
                  >
                    ✕
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {sectionItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebar(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-black text-white border-black"
                            : "bg-white border-black/10 hover:bg-black hover:text-white"
                        }`
                      }
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* PAGE CONTENT */}
          <div className="grid gap-5">
            <Outlet />
          </div>

        </div>
      </div>
    </main>
  );
}