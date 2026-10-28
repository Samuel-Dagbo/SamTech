export interface MetricData {
  label: string;
  value: string;
}

export interface TimelineItemData {
  period?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface FaqItemData {
  question?: string;
  answer?: string;
}

export interface ProfileData {
  _id?: string;
  name?: string;
  role?: string;
  tagline?: string;
  intro?: string;
  heroImage?: string;
  contactImage?: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  aboutTitle?: string;
  aboutIntro?: string;
  aboutImage?: string;
  aboutGallery?: string[];
  aboutName?: string;
  aboutEducation?: string;
  aboutJourneyTitle?: string;
  aboutJourneyBody?: string;
  aboutInspirationTitle?: string;
  aboutInspirationBody?: string;
  aboutWhoTitle?: string;
  aboutWhoBody?: string;
  aboutStackTitle?: string;
  aboutStackBody?: string;
  aboutApproachTitle?: string;
  aboutApproachBody?: string;
  techStack?: string[];
  experienceTimeline?: TimelineItemData[];
  faqItems?: FaqItemData[];
  brands?: string[];
  location?: string;
  yearsExperience?: string;
  availability?: string;
  whatsapp?: string;
  email?: string;
  createdAt?: string;
}

export interface ProjectData {
  _id?: string;
  title?: string;
  slug?: string;
  category?: string;
  summary?: string;
  stack?: string[];
  image?: string;
  screenshots?: string[];
  problem?: string;
  solution?: string;
  result?: string;
  caseStudyBody?: string;
  metrics?: MetricData[];
  liveUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceData {
  _id?: string;
  title?: string;
  copy?: string;
  image?: string;
  order?: number;
}

export interface TestimonialData {
  _id?: string;
  name?: string;
  company?: string;
  quote?: string;
  image?: string;
  order?: number;
}

export interface SiteContent {
  profile: ProfileData;
  projects: ProjectData[];
  services: ServiceData[];
  testimonials: TestimonialData[];
}
