import catalogue from "@/data/gameCatalogue.json";
import { siteData } from "./site-data";
import type { CatalogueGame } from "./slot-db";
import { releaseDate } from "./slot-db";
import artSources from "@/data/game-art-sources.json";
import rtpOverrides from "@/data/slot-rtp-overrides.json";
import { isTopSlot, TOP_SLOTS } from "./top-slots";

/**
 * The slots that earn a page of their own out of the catalogue.
 *
 * The catalogue holds 8,783 slots. Publishing a page for each would be 8,783
 * pages built from the same few fields, which is the doorway pattern Google
 * demotes a whole domain for — and the database at /slots/database already
 * makes every one of them crawlable and comparable.
 *
 * So a title qualifies only where we hold something worth a page:
 *
 *  - MORE THAN ONE PUBLISHED RTP. This is the whole point. A studio licences
 *    the same game at several returns and the casino picks; the lobby never
 *    tells you which you are playing. The spread is real — across the
 *    qualifying set it is usually a full two percentage points — and nobody
 *    else publishes it per title.
 *  - A DEMO ON THE STUDIO'S OWN DOMAIN, so the page can send a reader
 *    somewhere real and the title is provably the studio's.
 *
 * That is 409 titles, all Pragmatic Play, plus one from AvatarUX. Not a
 * quota: it is every title in the catalogue that passes, and it happens to
 * concentrate in Pragmatic's older library, where dual licensing is the norm.
 * Their newer flagship titles ship a single RTP and so do not qualify.
 *
 * These are NOT the hand-written reviews in slots.json. Those are played and
 * argued; these are the published configurations, laid out. The two never
 * collide — checked, no slug appears in both.
 */

interface Catalogue {
  asOf: string;
  games: CatalogueGame[];
}

/** Fields the catalogue carries that slot-db's narrower view leaves out. */
export interface CatalogueSlotPage extends CatalogueGame {
  rows?: number | null;
  minBet?: number | null;
  maxBet?: number | null;
  studioCaveat?: string | null;
}

const DB = catalogue as unknown as Catalogue;
const ART = (artSources as { art: Record<string, { file?: string }> }).art;
const OVERRIDES = (rtpOverrides as { overrides: Record<string, { versions: number[]; studio: string; sourceUrl: string }> }).overrides;

/**
 * A title earns a page two ways.
 *
 * The bar above — a studio demo plus more than one published RTP — is the
 * automatic one, and it is what keeps this at 410 pages instead of 8,783.
 *
 * An editorial pick also earns one. Those are chosen by hand, one at a time,
 * and a "top slots" list that links a third of itself nowhere is worse than
 * no list. They are not held to the multi-RTP bar because the bar exists to
 * stop bulk publishing, and thirteen hand-picked titles are not bulk.
 */
/**
 * A studio demo OR a studio source page satisfies the same requirement. The
 * demo was never the point in itself — it was there to prove the title is
 * the studio's and to give the reader somewhere real to go. A page on the
 * studio's own site, which is where the RTP figures were read from, does
 * both and cites better. 45 Push Gaming titles have one and no demo.
 */
const hasStudioPage = (g: CatalogueGame) => !!(g.slug && OVERRIDES[g.slug]?.sourceUrl);

const QUALIFIES = (g: CatalogueGame) =>
  g.kind === "slot" &&
  !!g.slug &&
  (((!!g.demoUrl || hasStudioPage(g)) && rtpVersionsFor(g).length > 1) || isTopSlot(g.slug));

/** Slugs already owned by a hand-written review — those pages win. */
const REVIEWED = new Set(siteData.slots.map((s) => s.slug));

const PAGES: Map<string, CatalogueSlotPage> = new Map(
  DB.games
    .filter((g) => QUALIFIES(g) && !REVIEWED.has(g.slug as string))
    .map((g) => [g.slug as string, g as CatalogueSlotPage])
);

export const cataloguePageSlugs = (): string[] => [...PAGES.keys()];
export const cataloguePage = (slug: string): CatalogueSlotPage | undefined => PAGES.get(slug);
export const cataloguePageCount = PAGES.size;

/**
 * Art we are allowed to publish, served from our own domain.
 *
 * Two separate reasons this resolves to a local file rather than the URL in
 * the catalogue:
 *
 *  - RIGHTS. Only images from our own api.slotessentials.com are ours. A file
 *    on an operator's CDN is the studio's copyright under that operator's
 *    licence, so a working URL is not permission — the line
 *    data/game-art-sources.json already draws.
 *  - IT DOES NOT WORK HOTLINKED. api.slotessentials.com 307s to a presigned
 *    S3 URL whose response carries Cross-Origin-Resource-Policy, so a browser
 *    on another origin refuses the image outright
 *    (ERR_BLOCKED_BY_RESPONSE.NotSameOrigin) even though curl fetches it
 *    happily. Every one of these pages would have shipped a broken image.
 *
 * scripts/fetch-game-art.mjs --pages copies them into public/assets/games and
 * records each file's origin. A title with no local file renders without art
 * rather than pointing at someone else's server.
 */
export function publishableArt(g: CatalogueSlotPage): string | null {
  const rec = g.slug ? ART[g.slug] : undefined;
  return rec?.file ? `/assets/games/${rec.file}` : null;
}

/**
 * Published RTP configurations, best first.
 *
 * A studio's own game page beats the catalogue import outright. The import is
 * a third-party feed; where a studio publishes its own numbers we take those
 * and drop the feed's, rather than showing both and implying we can tell
 * which is right. data/slot-rtp-overrides.json records each override's source
 * page and why it was taken.
 */
function rtpVersionsFor(g: CatalogueGame): number[] {
  const o = g.slug ? OVERRIDES[g.slug] : undefined;
  if (o?.versions?.length) return [...new Set(o.versions)].sort((a, b) => b - a);
  return [...new Set(g.rtpVariants ?? [])].sort((a, b) => b - a);
}

export function rtpVersions(g: CatalogueSlotPage): number[] {
  return rtpVersionsFor(g);
}

/** Where an overridden figure came from, for the citation on the page. */
export function rtpSource(g: CatalogueSlotPage): { studio: string; sourceUrl: string } | null {
  const o = g.slug ? OVERRIDES[g.slug] : undefined;
  return o ? { studio: o.studio, sourceUrl: o.sourceUrl } : null;
}

/**
 * The gap between the best and worst configuration, in percentage points —
 * the number that makes the page worth reading. Returned raw so the caller
 * decides the wording; a 2pp gap is a fifth of the house edge on a 96% game.
 */
export function rtpSpread(g: CatalogueSlotPage): number | null {
  const v = rtpVersions(g);
  return v.length > 1 ? Math.round((v[0] - v[v.length - 1]) * 100) / 100 : null;
}

/** The single published return, where that is all a studio licenses. */
export function singleRtp(g: CatalogueSlotPage): number | null {
  const v = rtpVersions(g);
  if (v.length === 1) return v[0];
  return v.length === 0 && typeof g.rtp === "number" ? g.rtp : null;
}

/** Specs worth a row, skipping anything the catalogue does not hold. */
export function slotSpecs(g: CatalogueSlotPage): { k: string; v: string }[] {
  const out: { k: string; v: string }[] = [];
  const reels = g.reels && g.rows ? `${g.reels}×${g.rows}` : g.reels ? `${g.reels} reels` : null;
  if (reels) out.push({ k: "Layout", v: reels });
  if (g.paylines) out.push({ k: "Ways to win", v: g.paylines.toLocaleString("en-GB") });
  if (g.volatility) out.push({ k: "Volatility", v: g.volatility[0].toUpperCase() + g.volatility.slice(1) });
  if (g.maxWinMultiplier) out.push({ k: "Max win", v: `${g.maxWinMultiplier.toLocaleString("en-GB")}×` });
  if (g.minBet != null && g.maxBet != null) out.push({ k: "Bet range", v: `${g.minBet} – ${g.maxBet}` });
  // releaseDate, not g.released: the feed stamps whole batches under that
  // heading, and every title here carries the same one.
  const rel = releaseDate(g);
  if (rel) out.push({ k: "Released", v: rel });
  return out;
}

/**
 * The editorial picks as links, resolved across both page kinds.
 *
 * Six are hand-written reviews and seven are catalogue pages; a reader does
 * not care which, they are all /slots/<slug>. Resolving in one place keeps
 * the menu and the index from having to know the difference, and a pick that
 * loses its page shows up as a gap here rather than a 404 on three surfaces.
 *
 * This lives here rather than in top-slots.ts because slot-page already
 * imports top-slots. Putting it the other way round makes a cycle, and a bad
 * one: slot-page calls isTopSlot while building PAGES at module-init time, so
 * whichever module loaded second would read the other's consts in TDZ.
 */
export function topSlotEntries(): { slug: string; name: string; href: string }[] {
  const reviews = new Map(siteData.slots.map((s) => [s.slug, s.name]));
  return TOP_SLOTS.map((slug) => {
    const name = reviews.get(slug) ?? PAGES.get(slug)?.name;
    return name ? { slug, name, href: `/slots/${slug}` } : null;
  }).filter((x): x is { slug: string; name: string; href: string } => !!x);
}
