import catalogue from "@/data/gameCatalogue.json";
import { siteData } from "./site-data";
import type { CatalogueGame } from "./slot-db";
import { releaseDate } from "./slot-db";
import artSources from "@/data/game-art-sources.json";

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

const QUALIFIES = (g: CatalogueGame) =>
  g.kind === "slot" && !!g.slug && !!g.demoUrl && (g.rtpVariants?.length ?? 0) > 1;

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

/** Published RTP configurations, best first, deduplicated. */
export function rtpVersions(g: CatalogueSlotPage): number[] {
  return [...new Set(g.rtpVariants ?? [])].sort((a, b) => b - a);
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
