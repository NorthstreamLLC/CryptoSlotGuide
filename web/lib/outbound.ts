import ops from "@/data/ops.json";
import sweeps from "@/data/sweeps.json";
import predMarkets from "@/data/predMarkets.json";

/**
 * Affiliate links leave the site through one route, /go/<slug>
 * (app/go/[slug]/route.ts), never straight from a button.
 *
 * Every button already reads `signupUrl` from the data layer, so the data
 * layer is where the swap happens: viaGo() hands pages a copy of the record
 * whose signupUrl is /go/<slug>, and the operator's real tracking URL stays
 * in data/*.json, read only by affiliateTarget() on the server. That gives
 * one place where a click is counted (which page sent it, from which
 * country), one place to change a link, and no affiliate URL in the HTML for
 * a scraper to lift or a stale cached page to keep sending traffic to.
 *
 * A record without a real affiliate link (affiliate: false — BC.Game's bare
 * homepage) is passed through untouched: it is not a tracked link, and the
 * buttons already treat it as an ordinary outbound one.
 */
type Linkable = { slug: string; affiliate?: boolean; signupUrl?: string };

export const goPath = (slug: string) => `/go/${encodeURIComponent(slug)}`;

export function viaGo<T extends Linkable>(x: T): T {
  return x.affiliate && x.signupUrl ? { ...x, signupUrl: goPath(x.slug) } : x;
}

const pm = predMarkets as { crypto: Linkable[]; fiat: Linkable[] };
const GROUPS: [Linkable[], string][] = [
  [ops as Linkable[], "/casinos/"],
  [sweeps as Linkable[], "/sweepstakes-casinos/"],
  [[...pm.crypto, ...pm.fiat], "/prediction-markets/"],
];
const RAW: Linkable[] = GROUPS.flatMap(([rows]) => rows);

/** Our own page for a slug: where /go/ sends a click that has no live link. */
export function reviewPath(slug: string): string {
  const g = GROUPS.find(([rows]) => rows.some((r) => r.slug === slug));
  return g ? g[1] + encodeURIComponent(slug) : "/crypto-casinos";
}

/** The operator's real tracking URL for a slug, or null when it has none. Server only. */
export function affiliateTarget(slug: string): string | null {
  const x = RAW.find((r) => r.slug === slug && r.affiliate && r.signupUrl);
  if (!x?.signupUrl) return null;
  try {
    const u = new URL(x.signupUrl);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}
