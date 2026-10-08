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

import { ogCardPath } from "./og";

/**
 * Builds page-level metadata from the same headline/standfirst copy the
 * page itself renders — so a data edit updates search-result copy too,
 * the same "derived, not hand-authored twice" pattern the rest of the
 * codebase follows (see lib/entity-view.ts's header comment).
 */
export function pageMetadata(title: string, description: string, path: string, image?: string, opts: { noindex?: boolean } = {}) {
  const url = `${SITE_URL}${path}`;
  // A page with no picture of its own still gets a card bearing its title,
  // so a shared link never shows as a blank box.
  const images = [image ? { url: image } : { url: ogCardPath(title, path), width: 1200, height: 630, alt: title }];
  return {
    // The layout appends " | CryptoSlotGuide" (18 characters). Search results
    // cut titles at about 60, so a long title goes out without it rather than
    // losing its own last words.
    title: title.length > 44 ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    // Pages kept for visitors but out of the index until they carry enough of
    // their own content (see app/sitemap.ts, which leaves them out too).
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website" as const,
      images,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images,
    },
  };
}
