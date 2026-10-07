import { notFound, permanentRedirect } from "next/navigation";
import renames from "@/data/slug-renames.json";
import { getEntityView, backLink } from "@/lib/entity-view";
import { EntityReviewPage } from "@/components/entity/EntityReviewPage";
import { SlotDataPage } from "@/components/slots/SlotDataPage";
import { cataloguePage, cataloguePageSlugs, rtpVersions, rtpSpread, singleRtp, publishableArt, slotReviewFacts } from "@/lib/slot-page";
import { slotReview } from "@/lib/slot-reviews";
import { SlotReview } from "@/components/slots/SlotReview";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema, entityBreadcrumbSchema, faqSchema, reviewSchema } from "@/lib/schema";
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
  const only = singleRtp(g);
  // A title with one published return gets a title that says so, rather than
  // "RTP: %" from joining an empty list.
  // "96.32% and 94.23% and 92.23% and 86.16%" is what joining on "and" gives
  // once a studio ships four builds, which Hacksaw usually does. Two reads
  // naturally; more than two wants the range.
  const title =
    v.length > 2
      ? `${g.name} RTP: ${v[0]}% down to ${v[v.length - 1]}%`
      : v.length === 2
        ? `${g.name} RTP: ${v[0]}% and ${v[1]}%`
        : only !== null
          ? `${g.name} RTP: ${only}%`
          : `${g.name} RTP and specs`;
  const desc =
    v.length > 1
      ? `${g.provider} licenses ${g.name} at ${v.length} returns${spread ? `, ${spread} percentage points apart` : ""}. The configurations, the specs and which build your casino ships.`
      : `${g.provider} publishes ${only !== null ? `${only}% ` : ""}for ${g.name}. The return, the specs and where to play it.`;
  return pageMetadata(title, desc, `/slots/${slug}`);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = getEntityView("slot", slug);
  if (view) return pageMetadata(view.headline, view.standfirst, `/slots/${slug}`);
  return catalogueMeta(slug) ?? {};
}

/**
 * The thirteen picks carry a long-form review under the sheet, on either page
 * kind. Resolved once here so both branches render the same block and the
 * same Review markup.
 */
function reviewFor(slug: string) {
  const rv = slotReview(slug);
  const facts = rv ? slotReviewFacts(slug) : null;
  if (!rv || !facts) return { node: null, schema: null };
  return {
    node: <SlotReview slug={slug} review={rv} facts={facts} />,
    schema: reviewSchema({ name: facts.name, path: `/slots/${slug}`, studio: facts.studio, score: rv.score, body: rv.verdict, date: rv.read, image: facts.art }),
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const review = reviewFor(slug);

  const view = getEntityView("slot", slug);
  if (view) {
    return (
      <>
        <JsonLd data={[entityBreadcrumbSchema(view.kicker, backLink("slot").href, view.name, `/slots/${slug}`), faqSchema(view.faqs), ...(review.schema ? [review.schema] : [])]} />
        <EntityReviewPage e={view} review={review.node} />
      </>
    );
  }

  const g = cataloguePage(slug);
  if (!g) {
    // Slugs that once carried "&", "'" or "+" were cleaned (data/slug-renames.json);
    // their old addresses, in search indexes and other sites' links, move here.
    const moved = (renames as Record<string, string>)[decodeURIComponent(slug)];
    if (moved) permanentRedirect(`/slots/${moved}`);
    notFound();
  }

  const versions = rtpVersions(g);
  const only = singleRtp(g);
  const rtpList = versions.length ? versions : only !== null ? [only] : [];
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
            // The published returns, as the page shows them. No rating on the
            // Game itself: the thirteen picks carry a separate Review node with
            // the score the page shows, and every other title has none.
            additionalProperty: rtpList.map((v, i) => ({
              "@type": "PropertyValue",
              name: rtpList.length === 1 ? "Return to player" : i === 0 ? "Return to player (best published)" : `Return to player (version ${i + 1})`,
              value: `${v}%`,
            })),
          },
          ...(review.schema ? [review.schema] : []),
        ]}
      />
      <SlotDataPage g={g} review={review.node} />
    </>
  );
}
