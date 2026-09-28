import { notFound } from "next/navigation";
import { getEntityView, backLink } from "@/lib/entity-view";
import { EntityReviewPage } from "@/components/entity/EntityReviewPage";
import { SlotDataPage } from "@/components/slots/SlotDataPage";
import { cataloguePage, cataloguePageSlugs, rtpVersions, rtpSpread, publishableArt } from "@/lib/slot-page";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema, entityBreadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Two kinds of slot page share this route.
 *
 * A hand-written review in slots.json wins the slug outright. Everything else
 * falls through to the catalogue, which publishes a page only for titles a
 * studio licenses at more than one RTP — see lib/slot-page.ts for why that is
 * the bar and why 8,783 pages would be the wrong answer.
 */

export function generateStaticParams() {
  // The catalogue pages only. The reviews already prerender through their own
  // data and are far fewer; listing both here would duplicate them.
  return cataloguePageSlugs().map((slug) => ({ slug }));
}

function catalogueMeta(slug: string) {
  const g = cataloguePage(slug);
  if (!g) return null;
  const v = rtpVersions(g);
  const spread = rtpSpread(g);
  return pageMetadata(
    `${g.name} RTP: ${v.join("% and ")}%`,
    `${g.provider} licenses ${g.name} at ${v.length} returns${spread ? `, ${spread} percentage points apart` : ""}. The configurations, the specs and which build your casino ships.`,
    `/slots/${slug}`
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("slot", slug);
  if (view) return pageMetadata(view.headline, view.standfirst, `/slots/${slug}`);
  return catalogueMeta(slug) ?? {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const view = getEntityView("slot", slug);
  if (view) {
    return (
      <>
        <JsonLd data={[entityBreadcrumbSchema(view.kicker, backLink("slot").href, view.name, `/slots/${slug}`), faqSchema(view.faqs)]} />
        <EntityReviewPage e={view} />
      </>
    );
  }

  const g = cataloguePage(slug);
  if (!g) notFound();

  const versions = rtpVersions(g);
  const art = publishableArt(g);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Slots", path: "/slots" },
            { name: g.name, path: `/slots/${slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Game",
            name: g.name,
            url: `${SITE_URL}/slots/${slug}`,
            gameItem: { "@type": "Thing", name: "Video slot" },
            // Absolute: publishableArt returns a site-relative path.
            ...(art ? { image: `${SITE_URL}${art}` } : {}),
            ...(g.provider ? { author: { "@type": "Organization", name: g.provider } } : {}),
            // The published returns, as the page shows them. No rating and no
            // review: we have not played this title, and marking one up would
            // be the overclaim the whole spec-sheet approach exists to avoid.
            additionalProperty: versions.map((v, i) => ({
              "@type": "PropertyValue",
              name: i === 0 ? "Return to player (best published)" : `Return to player (version ${i + 1})`,
              value: `${v}%`,
            })),
          },
        ]}
      />
      <SlotDataPage g={g} />
    </>
  );
}
