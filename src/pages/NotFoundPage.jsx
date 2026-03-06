import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="min-h-[80vh] px-3 py-12 sm:px-6">
      <div className="mx-auto grid max-w-7xl place-items-center text-center">
        <div className="animate-fade-in-up">
          <span className="text-[12rem] leading-none font-bold text-forest/10 sm:text-[16rem]">
            404
          </span>
        </div>
        
        <div className="mt-[-2rem] animate-fade-in animation-delay-200">
          <h1 className="text-4xl font-bold text-ink sm:text-5xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-black/60">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-semibold text-white transition hover:bg-black hover:scale-105"
            >
              Go back home
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-8 text-sm font-semibold text-ink transition hover:bg-black hover:text-white"
            >
              Contact me
            </Link>
          </div>
        </div>
        
        <div className="mt-16 animate-fade-in animation-delay-400">
          <p className="text-sm text-black/45">
            Or explore some of my work
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/work"
              className="rounded-full border border-black/10 bg-white/70 px-5 py-2 text-sm font-medium text-ink transition hover:bg-white hover:shadow-md"
            >
              View Projects
            </Link>
            <Link
              to="/services"
              className="rounded-full border border-black/10 bg-white/70 px-5 py-2 text-sm font-medium text-ink transition hover:bg-white hover:shadow-md"
            >
              Services
            </Link>
            <Link
              to="/about"
              className="rounded-full border border-black/10 bg-white/70 px-5 py-2 text-sm font-medium text-ink transition hover:bg-white hover:shadow-md"
            >
              About Me
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

