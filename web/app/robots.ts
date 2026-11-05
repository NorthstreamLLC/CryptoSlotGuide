import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // The slot database's plain pages (?page=N) stay crawlable; filtered and
      // searched views are noindex and kept out here (the longer Allow wins).
      allow: ["/", "/slots/database?page="],
      // Affiliate redirects (app/go/[slug]/route.ts): not pages.
      disallow: ["/go/", "/slots/database?"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
