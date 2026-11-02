import { SITE_URL } from "@/lib/seo";
import { SITEMAP_SECTIONS, sitemapPaths, sectionOf, lastModifiedOf, type SitemapSection } from "@/lib/sitemap-entries";

export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => SITEMAP_SECTIONS.map((id) => ({ file: `${id}.xml` }));

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One section of the sitemap. lastmod appears only where a record holds a real date. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const id = file.replace(/\.xml$/, "") as SitemapSection;
  if (!SITEMAP_SECTIONS.includes(id)) return new Response("Not found", { status: 404 });
  const urls = sitemapPaths()
    .filter((p) => sectionOf(p) === id)
    .sort()
    .map((p) => {
      const d = lastModifiedOf(p);
      return `  <url>\n    <loc>${esc(SITE_URL + p)}</loc>${d ? `\n    <lastmod>${d}</lastmod>` : ""}\n  </url>`;
    })
    .join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
