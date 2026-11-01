import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { getPublicAppUrl } from "@/lib/env";
import { site } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  title: {
    default: `${site.fullName} — ${site.role}`,
    template: `%s — ${site.fullName}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  openGraph: {
    type: "website",
    siteName: site.fullName,
    title: `${site.fullName} — ${site.role}`,
    description: site.description,
    url: getPublicAppUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.fullName} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${getPublicAppUrl()}/#person`,
        name: "Samuel Dagbo",
        alternateName: site.fullName,
        url: getPublicAppUrl(),
        email: `mailto:${site.emailFallback}`,
        description: site.description,
        jobTitle: site.role,
        telephone: site.whatsappFallback,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Accra",
          addressCountry: "GH",
        },
        knowsAbout: [...site.keywords],
      },
      {
        "@type": "WebSite",
        "@id": `${getPublicAppUrl()}/#website`,
        url: getPublicAppUrl(),
        name: site.fullName,
        description: site.description,
        publisher: { "@id": `${getPublicAppUrl()}/#person` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
