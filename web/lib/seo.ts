/**
 * Site-wide SEO helpers — not part of the original prototype (which has
 * no metadata beyond a single hardcoded <title> tag; it's a design mockup,
 * not something search engines ever crawled).
 *
 * SITE_URL is a placeholder until a real domain is registered/pointed at
 * this deployment — set NEXT_PUBLIC_SITE_URL in the environment once one
 * exists. Everything here (canonical URLs, sitemap, OG urls) derives from
 * it, so that's the one place to change before launch.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cryptoslotguide.example";
export const SITE_NAME = "CryptoSlotGuide";

/**
 * Builds page-level metadata from the same headline/standfirst copy the
 * page itself renders — so a data edit updates search-result copy too,
 * the same "derived, not hand-authored twice" pattern the rest of the
 * codebase follows (see lib/entity-view.ts's header comment).
 */
export function pageMetadata(title: string, description: string, path: string) {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website" as const,
    },
    twitter: {
      card: "summary" as const,
      title,
      description,
    },
  };
}
