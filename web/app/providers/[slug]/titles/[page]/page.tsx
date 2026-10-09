import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getEntityView } from "@/lib/entity-view";
import { catalogueOnlyStudio } from "@/lib/studio-pages";
import { studioAllTitles } from "@/lib/slot-page";
import { pageMetadata } from "@/lib/seo";
import { TITLES_PER_PAGE } from "@/lib/titles";
import { TitlesTable, TitlesPager } from "@/components/studios/TitlesTable";
import type { TableRow } from "@/lib/entity-view";

/**
 * Page 2 onwards of a studio's titles. The studio page shows the first
 * fifteen; the rest are here, fifteen a page, so a reader can walk Pragmatic
 * Play's 681 titles without one page carrying all of them. Out of the index
 * (noindex, follow): each page is a slice of a list, not a page with its own
 * subject, and the slot pages it links to are what should rank.
 */
function titlesFor(slug: string): { name: string; rows: TableRow[] } | null {
  const v = getEntityView("provider", slug, { fullTable: true });
  if (v) return { name: v.name, rows: v.tableRows };
  const cs = catalogueOnlyStudio(slug);
  return cs ? { name: cs.name, rows: studioAllTitles(cs.name).rows } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params;
  const t = titlesFor(slug);
  if (!t) return {};
  return pageMetadata(`${t.name} slots, page ${page}`, `${t.name} titles ${(Number(page) - 1) * TITLES_PER_PAGE + 1} onwards, with the return, volatility and max win of each.`, `/providers/${slug}/titles/${page}`, undefined, { noindex: true });
}

export default async function Page({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page: raw } = await params;
  const t = titlesFor(slug);
  if (!t) notFound();
  const page = Number(raw);
  const pages = Math.ceil(t.rows.length / TITLES_PER_PAGE);
  if (page === 1) permanentRedirect(`/providers/${slug}#titles`);
  if (!Number.isInteger(page) || page < 2 || page > pages) notFound();
  const rows = t.rows.slice((page - 1) * TITLES_PER_PAGE, page * TITLES_PER_PAGE);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 64px" }}>
      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#83919A", marginBottom: 22 }}>
        <Link href="/providers" style={{ color: "#83919A" }}>Studios</Link> / <Link href={`/providers/${slug}`} style={{ color: "#83919A" }}>{t.name}</Link> /{" "}
        <span style={{ color: "#A8B6BE" }}>Titles, page {page}</span>
      </div>
      <h1 style={{ margin: "0 0 8px", fontSize: 34, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-.03em", color: "#fff" }}>
        {t.name} slots <span style={{ color: "#83919A", fontWeight: 600 }}>· page {page} of {pages}</span>
      </h1>
      <p style={{ margin: "0 0 20px", maxWidth: "80ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>
        All {t.rows.length.toLocaleString("en-GB")} {t.name} titles we hold, in the same order as on{" "}
        <Link href={`/providers/${slug}`} style={{ color: "#5FE3E8" }}>the {t.name} review</Link>. Titles with a page here link to it; the rest link to SlotEssentials, our sister site.
      </p>
      <TitlesTable rows={rows} />
      <TitlesPager slug={slug} total={t.rows.length} page={page} perPage={TITLES_PER_PAGE} />
    </main>
  );
}
