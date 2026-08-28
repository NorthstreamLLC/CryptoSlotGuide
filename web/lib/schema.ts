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
  // No `logo` field: the site header is a text wordmark, not an image —
  // there's no real logo file to point at yet. Add one here once a real
  // site logo image exists in public/assets.
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
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
