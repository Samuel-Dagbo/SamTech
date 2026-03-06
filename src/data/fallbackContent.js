export const fallbackContent = {
  profile: {
    name: "SamTech",
    role: "Full Stack MERN Developer",
    tagline: "I design, build, and ship web and mobile products that feel sharp, fast, and production-ready.",
    intro:
      "I work across React, Node.js, MongoDB, Express, and React Native to deliver complete products from concept to deployment.",
    heroImage: "",
    contactImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    githubUrl: "https://github.com/example",
    linkedinUrl: "https://linkedin.com/in/example",
    xUrl: "https://x.com/example",
    resumeUrl: "",
    brands: ["SwiftCart", "Nova Labs", "LaunchStack", "PrimeCare Services"],
    aboutTitle: "Full stack development with a builder's mindset.",
    aboutIntro:
      "I build web and mobile systems end-to-end, from interface structure to backend logic, data modeling, and deployment-ready APIs.",
    aboutImage:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    aboutGallery: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
    ],
    aboutName: "Samuel Dagbo",
    aboutEducation: "BSc. Information Technology, University of Ghana",
    aboutJourneyTitle: "My journey",
    aboutJourneyBody:
      "I have worked steadily to grow from curiosity into real technical capability, learning through practice, discipline, and consistent building.",
    aboutInspirationTitle: "What drives me",
    aboutInspirationBody:
      "Where I am today came from hard work, patience, and refusing to stop improving. I want every product I build to reflect that growth and determination.",
    aboutWhoTitle: "Who I am",
    aboutWhoBody:
      "I build web and mobile systems end-to-end, from interface structure to backend logic, data modeling, and deployment-ready APIs.",
    aboutStackTitle: "What I work with",
    aboutStackBody:
      "React, Node.js, Express, MongoDB, and React Native, with a strong focus on real product flow and maintainable architecture.",
    aboutApproachTitle: "How I work",
    aboutApproachBody:
      "I care about clean structure, speed, responsive UI, and backend systems that make admin operations easy instead of painful.",
    techStack: ["React", "Node.js", "Express", "MongoDB", "React Native", "Tailwind CSS", "JWT"],
    experienceTimeline: [
      {
        period: "Today",
        title: "Full Stack MERN Developer",
        subtitle: "Independent builder",
        description: "Designing and developing business websites, dashboards, custom platforms, and mobile-ready systems."
      },
      {
        period: "University journey",
        title: "BSc. Information Technology",
        subtitle: "University of Ghana",
        description: "Building technical range through study, practice, and consistent product work."
      }
    ],
    faqItems: [
      {
        question: "What kind of projects do you build?",
        answer: "Business websites, product platforms, dashboards, internal tools, and mobile apps backed by strong engineering."
      },
      {
        question: "Do you work across both frontend and backend?",
        answer: "Yes. I handle interface architecture, APIs, data flow, admin tools, and product structure end to end."
      }
    ],
    location: "Accra, Ghana",
    yearsExperience: "4+",
    availability: "Available for freelance and product builds",
    whatsapp: "+233550624203",
    email: "samtech@example.com"
  },
  projects: [
    {
      _id: "p1",
      title: "Ops Dashboard",
      slug: "ops-dashboard",
      category: "SaaS Platform",
      summary: "A multi-role admin dashboard for operations tracking, approvals, and live analytics.",
      stack: ["React", "Node.js", "MongoDB", "Charting"],
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      screenshots: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
      ],
      problem: "Operations data lived in fragmented spreadsheets and manual approvals were too slow.",
      solution: "Built a role-based dashboard with secure auth, approvals, analytics, and clearer operational control.",
      result: "Faster decisions, cleaner visibility, and less manual admin follow-up across the operations team.",
      caseStudyBody:
        "The build focused on reducing friction for internal staff while giving leadership better visibility.\n\nI balanced information density with clarity so the dashboard could support daily operational use without becoming noisy.",
      metrics: [
        { label: "Approval time", value: "43% faster" },
        { label: "Team usage", value: "28 staff users" },
        { label: "Admin time", value: "12 hrs/week saved" }
      ],
      liveUrl: "#",
      repoUrl: "#",
      featured: true,
      order: 1
    },
    {
      _id: "p2",
      title: "Delivery Mobile App",
      slug: "delivery-mobile-app",
      category: "React Native",
      summary: "A dispatch and customer tracking app with push notifications and order state management.",
      stack: ["React Native", "Expo", "Node.js"],
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
      screenshots: [
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80"
      ],
      problem: "Customers lacked visibility and riders needed a cleaner mobile workflow.",
      solution: "Created a real-time order status flow with rider actions, customer tracking, and lean backend APIs.",
      result: "Lower support pressure, clearer delivery-state tracking, and better field usability.",
      caseStudyBody:
        "The product needed to work for riders moving fast and customers waiting for updates.\n\nThat required simple state transitions, strong mobile UX, and backend endpoints that stayed reliable under repeated use.",
      metrics: [
        { label: "Tracking calls", value: "31% fewer" },
        { label: "Status visibility", value: "3 core live stages" },
        { label: "Primary platform", value: "Daily rider usage" }
      ],
      liveUrl: "#",
      repoUrl: "#",
      featured: true,
      order: 2
    },
    {
      _id: "p3",
      title: "Booking Engine",
      slug: "booking-engine",
      category: "Service Marketplace",
      summary: "A full booking flow with payments, customer records, and admin-side fulfillment tools.",
      stack: ["MERN", "JWT", "Cloud Storage"],
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      screenshots: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"
      ],
      problem: "Scheduling and provider coordination were being handled manually, causing conflicts and weak visibility.",
      solution: "Built a booking system with customer flow, provider management, and admin-side operational control.",
      result: "More reliable scheduling, better fulfillment oversight, and a more organized service pipeline.",
      caseStudyBody:
        "This build centered on workflow rather than decoration.\n\nThe priority was making the system easier to operate under real booking volume while giving admins better oversight and less guesswork.",
      metrics: [
        { label: "Workflow", value: "End-to-end digital booking" },
        { label: "Scheduling issues", value: "Reduced significantly" },
        { label: "Admin control", value: "Single dashboard view" }
      ],
      liveUrl: "#",
      repoUrl: "#",
      featured: false,
      order: 3
    }
  ],
  services: [
    {
      _id: "s1",
      title: "Business and company websites",
      copy:
        "High-quality websites for brands, businesses, schools, churches, and organizations that need credibility, speed, and a strong online presence.",
      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
      order: 1
    },
    {
      _id: "s2",
      title: "Custom MERN web applications",
      copy:
        "Full-stack products with protected APIs, dashboards, database architecture, and admin flows built for real operational needs.",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
      order: 2
    },
    {
      _id: "s3",
      title: "React Native mobile apps",
      copy:
        "Cross-platform mobile apps with clean user experience, API integrations, and backend systems that support reliable production use.",
      image:
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
      order: 3
    }
  ],
  testimonials: [
    {
      _id: "t1",
      name: "Product Lead",
      company: "Nova Labs",
      quote: "SamTech translated rough product ideas into a clean production system with very little supervision.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
      order: 1
    },
    {
      _id: "t2",
      name: "Founder",
      company: "SwiftCart",
      quote: "Strong execution, good product taste, and dependable backend thinking.",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
      order: 2
    }
  ]
};
