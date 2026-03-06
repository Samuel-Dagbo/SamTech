
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminPortal from "./components/AdminPortal.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import AdminOverview from "./components/admin/AdminOverview.jsx";
import AdminFrontPage from "./components/admin/AdminFrontPage.jsx";
import AdminProfile from "./components/admin/AdminProfile.jsx";
import AdminSocial from "./components/admin/AdminSocial.jsx";
import AdminBrands from "./components/admin/AdminBrands.jsx";
import AdminAbout from "./components/admin/AdminAbout.jsx";
import AdminServices from "./components/admin/AdminServices.jsx";
import AdminProjects from "./components/admin/AdminProjects.jsx";
import AdminTestimonials from "./components/admin/AdminTestimonials.jsx";
import AdminMessages from "./components/admin/AdminMessages.jsx";
import BackToTop from "./components/BackToTop.jsx";
import { fallbackContent } from "./data/fallbackContent.js";
import SiteLayout from "./layout/SiteLayout.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import TestimonialsPage from "./pages/TestimonialsPage.jsx";
import WorkPage from "./pages/WorkPage.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://samtech-server-unvk.onrender.com/api";

export default function App() {
  const [content, setContent] = useState(fallbackContent);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [profileRes, projectsRes, testimonialsRes, servicesRes] = await Promise.all([
          fetch(`${API_BASE}/content/profile`),
          fetch(`${API_BASE}/content/projects`),
          fetch(`${API_BASE}/content/testimonials`),
          fetch(`${API_BASE}/content/services`)
        ]);

        if (!profileRes.ok || !projectsRes.ok || !testimonialsRes.ok || !servicesRes.ok) {
          return;
        }

        const [profile, projects, testimonials, services] = await Promise.all([
          profileRes.json(),
          projectsRes.json(),
          testimonialsRes.json(),
          servicesRes.json()
        ]);

        setContent({
          profile: profile.data || fallbackContent.profile,
          projects: projects.data?.length ? projects.data : fallbackContent.projects,
          testimonials: testimonials.data?.length ? testimonials.data : fallbackContent.testimonials,
          services: services.data?.length ? services.data : fallbackContent.services
        });
      } catch {
        // Fallback content keeps the site useful before the API is configured.
      }
    };

    loadContent();
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/portal/:slug" element={<AdminPortal />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="frontpage" element={<AdminFrontPage />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="social" element={<AdminSocial />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="about" element={<AdminAbout />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
          <Route element={<SiteLayout content={content} />}>
            <Route path="/" element={<HomePage content={content} />} />
            <Route path="/about" element={<AboutPage content={content} />} />
            <Route path="/work" element={<WorkPage content={content} />} />
            <Route path="/work/:slug" element={<ProjectDetailPage content={content} />} />
            <Route path="/testimonials" element={<TestimonialsPage content={content} />} />
            <Route path="/services" element={<ServicesPage content={content} />} />
            <Route path="/contact" element={<ContactPage content={content} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <BackToTop />
      </BrowserRouter>
    </ToastProvider>
  );
}

