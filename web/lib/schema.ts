/**
 * schema.org JSON-LD helpers. Not part of the original prototype — a
 * design mockup was never a page Google crawled. Scoped deliberately
 * narrow: Organization/WebSite (sitewide) and BreadcrumbList/FAQPage
 * (per page) are well-established, low-risk schema types that describe
 * only what's already visible on the page.
 *
 * Review/AggregateRating schema is NOT included here on purpose. Google
 * requires structured data to match visible page content exactly, and
 * most of this site's scores are currently "field-test pending" —
 * marking a rating up in schema while the page itself says the figure
 * isn't independently verified yet would be the overclaim this whole
 * session's methodology work has been closing, not a new SEO win. Add
 * it once FIELD_TESTED_OPERATOR_SLUGS actually covers an operator.
 */
import { SITE_URL, SITE_NAME } from "./seo";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo.svg`,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Home > category > entity name — the same breadcrumb every entity review page already renders visually. */
export function entityBreadcrumbSchema(kicker: string, categoryHref: string, name: string, path: string) {
  return breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: kicker, path: categoryHref },
    { name, path },
  ]);
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * A ranked list, as the page already shows it.
 *
 * This is the type that was missing, and it is the one that matters most
 * here: nearly every page on this site is a ranked list of something, and
 * "best crypto casino" style queries are the traffic we are after. ItemList
 * tells Google the page IS the list rather than an article that happens to
 * mention some casinos.
 *
 * The order must be the order the reader sees. Passing a differently sorted
 * array would be a mismatch between structured data and visible content,
 * which is the one thing Google penalises outright — so callers pass the
 * same array they render, never a re-sorted copy.
 */
export function itemListSchema(name: string, items: { name: string; path: string }[]) {
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      // An absolute URL passes through: some lists (prediction-market venues,
      // exchanges) are of external sites, and pointing every entry at our own
      // origin would describe a list of pages that do not exist.
      url: /^https?:\/\//.test(item.path) ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * A page that exists to hold a collection, for the index pages where the list
 * is the whole point. Paired with itemListSchema rather than replacing it:
 * CollectionPage describes the page, ItemList describes what is on it.
 */
export function collectionPageSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

/** Article markup for the guides carried over from the WordPress site. */
export function articleSchema(headline: string, description: string, path: string, published: string, modified: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: `${SITE_URL}${path}`,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

/**
 * Review markup for the long-form slot reviews. The author is the site, as an
 * Organization, because that is who wrote it; the rating is the score the
 * page shows, on the same ten-point scale, and nothing else.
 */
export function reviewSchema(opts: { name: string; path: string; studio: string | null; score: number; body: string; date: string; image?: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Game",
      name: opts.name,
      url: `${SITE_URL}${opts.path}`,
      gameItem: { "@type": "Thing", name: "Video slot" },
      ...(opts.image ? { image: `${SITE_URL}${opts.image}` } : {}),
      ...(opts.studio ? { author: { "@type": "Organization", name: opts.studio } } : {}),
    },
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    reviewRating: { "@type": "Rating", ratingValue: opts.score, bestRating: 10, worstRating: 1 },
    reviewBody: opts.body,
    datePublished: opts.date,
    url: `${SITE_URL}${opts.path}#review`,
  };
}
