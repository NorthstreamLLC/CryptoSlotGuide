import { SITE_URL } from "@/lib/seo";
import { SITEMAP_SECTIONS, sitemapPaths, sectionOf, lastModifiedOf } from "@/lib/sitemap-entries";

export const dynamic = "force-static";

/** The sitemap index: one child sitemap per section, dated by its newest recorded page. */
export function GET() {
  const paths = sitemapPaths();
  const body = SITEMAP_SECTIONS.map((id) => {
    const newest = paths.filter((p) => sectionOf(p) === id).map(lastModifiedOf).filter((d): d is string => !!d).sort().pop();
    return `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/${id}.xml</loc>${newest ? `\n    <lastmod>${newest}</lastmod>` : ""}\n  </sitemap>`;
  }).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
