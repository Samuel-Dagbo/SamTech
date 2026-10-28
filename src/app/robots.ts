import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/workspace", "/login", "/invite"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
