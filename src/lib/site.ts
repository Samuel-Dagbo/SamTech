/**
 * Site-wide constants. Business details below come from the existing
 * SamTech Labs website/profile data — nothing is invented here.
 */

export const site = {
  name: "SamTech",
  fullName: "SamTech Labs",
  role: "Full Stack MERN Developer",
  description:
    "Full Stack MERN Developer building modern websites, web applications, and digital products. Expert in React, Node.js, Express, MongoDB, and React Native.",
  keywords: [
    "full stack developer",
    "MERN developer",
    "React developer",
    "Node.js developer",
    "web developer",
    "MongoDB",
    "React Native",
    "Ghana",
    "Accra",
  ],
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ] as const,
  // Preserved from the legacy site's footer/profile (real contact points).
  emailFallback: "samueldagbo50@gmail.com",
  whatsappFallback: "+233550624203",
  locationFallback: "Accra, Ghana",
};

export function whatsappLink(rawNumber: string | undefined, message: string): string {
  const digits = rawNumber?.replace(/\D/g, "") || site.whatsappFallback.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
