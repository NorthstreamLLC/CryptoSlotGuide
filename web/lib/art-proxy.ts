import catalogue from "@/data/gameCatalogue.json";

/**
 * Which catalogue tiles the site can serve through /api/art/[slug].
 *
 * The catalogue carries an image URL for 8,716 of its 8,721 slots: 5,367 on
 * api.slotessentials.com, our sister site, whose art we may republish, and
 * 3,349 on an operator's CDN, which is not ours (data/game-art-sources.json
 * records those as held pending rights). The sister-site URLs cannot be
 * hotlinked — the API answers with a 307 to a presigned S3 object that
 * carries Cross-Origin-Resource-Policy, so a browser on this origin refuses
 * it — and copying 5,000 more files into public/ would double the largest
 * thing in the repo. So the route fetches them server-side and the CDN caches
 * the result; this module is the allow list it and the page helpers share.
 */
export const ART_PROXY_HOSTS = new Set(["api.slotessentials.com"]);

const SOURCE_BY_SLUG: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const g of (catalogue as { games: { slug: string | null; image: string | null }[] }).games) {
    if (!g.slug || !g.image) continue;
    try {
      if (ART_PROXY_HOSTS.has(new URL(g.image).hostname)) m.set(g.slug, g.image);
    } catch {
      // not a URL; nothing to serve
    }
  }
  return m;
})();

/** The sister-site URL the route fetches for a slug, or null when there is nothing we may serve. */
export const proxiedArtSource = (slug: string): string | null => SOURCE_BY_SLUG.get(slug) ?? null;

/** The site-relative path a page can put in an <img>, or null. */
export const artProxyPath = (slug: string | null | undefined): string | null => (slug && SOURCE_BY_SLUG.has(slug) ? `/api/art/${slug}` : null);
