import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Affiliate redirects (app/go/[slug]/route.ts): not pages.
      disallow: "/go/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
