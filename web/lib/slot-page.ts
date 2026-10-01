import catalogue from "@/data/gameCatalogue.json";
import { siteData } from "./site-data";
import type { CatalogueGame } from "./slot-db";
import { releaseDate, volatilityOf } from "./slot-db";
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
const OVERRIDES = (
  rtpOverrides as {
    overrides: Record<string, { versions: number[]; studio: string; sourceUrl: string; versionsFrom?: "studio" | "mixed" }>;
  }
).overrides;

/** Studio names are compared on their letters: the catalogue and the studio
 *  sheets disagree on the apostrophe in "Play'n GO". */
const studioKey = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The override for this title — only if it was read from THIS title's studio.
 *
 * Overrides are keyed by slug, and ten catalogue slugs are used by two
 * different studios. Three of them carry an override, so looking up by slug
 * alone published Pragmatic's figures on Endorphina's Argonauts, Hacksaw's
 * Gold Rush and Spade Gaming's Money Mouse — another studio's RTP under the
 * wrong studio's name, cited to the wrong studio's page.
 *
 * Where the studios disagree there is no override, so the title falls back to
 * the catalogue feed rather than to someone else's number.
 */
function overrideOf(g: CatalogueGame) {
  const o = g.slug ? OVERRIDES[g.slug] : undefined;
  if (!o) return undefined;
  return studioKey(o.studio) === studioKey(g.provider) ? o : undefined;
}

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
const hasStudioPage = (g: CatalogueGame) => !!overrideOf(g)?.sourceUrl;

const QUALIFIES = (g: CatalogueGame) =>
  g.kind === "slot" &&
  !!g.slug &&
  (((!!g.demoUrl || hasStudioPage(g)) && rtpVersionsFor(g).length > 1) || isTopSlot(g.slug));

/** Slugs already owned by a hand-written review — those pages win. */
const REVIEWED = new Set(siteData.slots.map((s) => s.slug));

/**
 * Qualifying titles by slug, minus any slug two different titles claim.
 *
 * Ten catalogue slugs are used by two studios — Argonauts is both a Pragmatic
 * and an Endorphina title, Gold Rush both Pragmatic and Hacksaw. Building the
 * map straight from the list let the later title silently replace the earlier
 * one, so /slots/<slug> would show one studio's figures under the other's
 * name with no sign anything had been dropped.
 *
 * None are ambiguous today. This keeps it that way: where two qualifying
 * titles want the same slug, neither gets the page, because the page can only
 * be one of them and we cannot tell the reader which.
 */
const PAGES: Map<string, CatalogueSlotPage> = (() => {
  const claims = new Map<string, CatalogueSlotPage[]>();
  for (const g of DB.games) {
    if (!QUALIFIES(g) || REVIEWED.has(g.slug as string)) continue;
    const slug = g.slug as string;
    const held = claims.get(slug);
    if (held) held.push(g as CatalogueSlotPage);
    else claims.set(slug, [g as CatalogueSlotPage]);
  }
  const out = new Map<string, CatalogueSlotPage>();
  for (const [slug, games] of claims) if (games.length === 1) out.set(slug, games[0]);
  return out;
})();

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
  const o = overrideOf(g);
  if (o?.versions?.length) return [...new Set(o.versions)].sort((a, b) => b - a);
  return [...new Set(g.rtpVariants ?? [])].sort((a, b) => b - a);
}

export function rtpVersions(g: CatalogueSlotPage): number[] {
  return rtpVersionsFor(g);
}

/** Where an overridden figure came from, for the citation on the page. */
export function rtpSource(g: CatalogueSlotPage): { studio: string; sourceUrl: string } | null {
  const o = overrideOf(g);
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

/**
 * What the catalogue holds for one studio.
 *
 * The provider pages were counting titles off siteData.slots — the 21
 * hand-written reviews — which gave Play'n GO "1 title" and Pragmatic "5"
 * while the catalogue held 488 and 688. Worse, it undercounted the thing
 * those pages exist to show: how many of a studio's titles we can state
 * every licensed RTP configuration for, from the studio's own figures.
 *
 * `withVersions` counts only titles where the studio published the whole set
 * of returns. Pragmatic's second build comes from the catalogue feed, not
 * from Pragmatic, so its 417 two-figure titles are `mixedVersions` instead —
 * calling them builds the studio publishes would be the overclaim this
 * sourcing work exists to prevent.
 */
export function studioCatalogue(studioName: string): {
  titles: number;
  sourced: number;
  withVersions: number;
  mixedVersions: number;
  pages: number;
  topRtp: number | null;
  widestSpread: number | null;
} {
  // The slot index and the catalogue feed disagree on the apostrophe in
  // "Play'n GO", so match on the letters rather than the character.
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const want = key(studioName);
  const mine = (catalogue as { games: CatalogueGame[] }).games.filter((g) => key(g.provider ?? "") === want);

  let topRtp: number | null = null;
  let widestSpread: number | null = null;
  let sourced = 0;
  let withVersions = 0;
  let mixedVersions = 0;
  for (const g of mine) {
    const o = overrideOf(g);
    if (!o?.versions?.length) continue;
    sourced++;
    const v = [...new Set(o.versions)].sort((a, b) => b - a);
    if (v.length > 1) {
      if (o.versionsFrom === "mixed") mixedVersions++;
      else withVersions++;
      const spread = Math.round((v[0] - v[v.length - 1]) * 100) / 100;
      if (widestSpread === null || spread > widestSpread) widestSpread = spread;
    }
    if (topRtp === null || v[0] > topRtp) topRtp = v[0];
  }

  return {
    titles: mine.length,
    sourced,
    withVersions,
    mixedVersions,
    pages: mine.filter((g) => g.slug && PAGES.has(g.slug)).length,
    topRtp,
    widestSpread,
  };
}

/**
 * A studio's strongest catalogue titles, as table rows.
 *
 * The provider table drew only on the 21 hand-written reviews, so seventeen of
 * the twenty-four studio pages rendered no title table at all while the
 * catalogue held hundreds of their slots — 418 for Games Global, 381 for Red
 * Tiger. The component hides the table when there are no rows, so the absence
 * was silent.
 *
 * Ordered by what the page is for: titles whose every licensed configuration
 * we hold come first, widest spread at the top, because that gap is the thing
 * a reader cannot get from the lobby. Titles with a single figure follow by
 * RTP. Nothing without a sourced figure is listed at all.
 */
export function studioTopTitles(
  studioName: string,
  limit = 24
): { rows: { name: string; note: string; m1: string; m2: string; m3: string }[]; sourced: boolean } {
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const want = key(studioName);
  const mine = (catalogue as { games: CatalogueGame[] }).games.filter(
    (g) => g.kind === "slot" && key(g.provider ?? "") === want
  );

  const row = (g: CatalogueGame, v: number[], from: "studio" | "feed") => {
    const spread = v.length > 1 ? Math.round((v[0] - v[v.length - 1]) * 100) / 100 : 0;
    return {
      name: g.name,
      note:
        from === "feed"
          ? "Catalogue figure, not read from the studio"
          : spread
            ? `${v.length} published builds, ${spread}pp apart`
            : "One published return",
      m1: spread ? `${v[0]}% – ${v[v.length - 1]}%` : `${v[0]}%`,
      m2: volatilityOf(g) ?? "Not published",
      m3: g.maxWinMultiplier ? `${g.maxWinMultiplier.toLocaleString()}x` : "Not published",
      spread,
      top: v[0],
    };
  };

  const sourced = mine
    .map((g) => {
      const o = overrideOf(g);
      return o?.versions?.length ? row(g, [...new Set(o.versions)].sort((a, b) => b - a), "studio") : null;
    })
    .filter((r): r is NonNullable<typeof r> => !!r);

  /**
   * Nine studios have hundreds of catalogue titles and not one sourced
   * override — Red Tiger has 381, Games Global 418 — so the table rendered
   * empty and the component hides an empty table, making the gap invisible.
   *
   * The feed's figures fill it instead, each row saying plainly that it is a
   * catalogue figure rather than one read from the studio. A labelled
   * third-party number is honest; a blank section that implies we hold
   * nothing is not.
   */
  const pool = sourced.length
    ? sourced
    : mine
        .map((g) => {
          const v = [...new Set(g.rtpVariants?.length ? g.rtpVariants : g.rtp != null ? [g.rtp] : [])].sort(
            (a, b) => b - a
          );
          return v.length ? row(g, v, "feed") : null;
        })
        .filter((r): r is NonNullable<typeof r> => !!r);

  const rows = [...pool]
    .sort((a, b) => b.spread - a.spread || b.top - a.top || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ name, note, m1, m2, m3 }) => ({ name, note, m1, m2, m3 }));

  return { rows, sourced: sourced.length > 0 };
}

/**
 * The editorial picks as index rows, in the order they were given.
 *
 * /slots listed the 21 hand-written reviews and knew nothing about the picks,
 * so the one ranked opinion on the site appeared in the menu and nowhere on
 * the page the menu points at. Six picks are reviews and seven are catalogue
 * pages; this resolves both so the index can lead with the list.
 *
 * Figures come from whichever record owns the title — a review's own fields,
 * or the catalogue's sourced configurations — never re-derived.
 */
export function topSlotRows(): {
  slug: string;
  rank: number;
  name: string;
  provider: string;
  rtp: string;
  volatility: string;
  maxWin: string;
}[] {
  const reviews = new Map(siteData.slots.map((s) => [s.slug, s]));
  return TOP_SLOTS.map((slug, i) => {
    const r = reviews.get(slug);
    if (r) {
      return {
        slug,
        rank: i + 1,
        name: r.name,
        provider: r.provider,
        rtp: typeof r.rtp === "number" ? `${r.rtp}%` : "Not published",
        volatility: r.vol ? `${r.vol[0].toUpperCase()}${r.vol.slice(1)}` : "Not published",
        maxWin: r.maxWin ?? "Not published",
      };
    }
    const g = PAGES.get(slug);
    if (!g) return null;
    const v = rtpVersions(g);
    return {
      slug,
      rank: i + 1,
      name: g.name,
      provider: g.provider ?? "Not stated",
      rtp: v.length > 1 ? `${v[0]}% – ${v[v.length - 1]}%` : v.length === 1 ? `${v[0]}%` : g.rtp != null ? `${g.rtp}%` : "Not published",
      volatility: (() => {
        const vol = volatilityOf(g);
        return vol ? `${vol[0].toUpperCase()}${vol.slice(1)}` : "Not published";
      })(),
      maxWin: g.maxWinMultiplier ? `${g.maxWinMultiplier.toLocaleString()}x` : "Not published",
    };
  }).filter((r): r is NonNullable<typeof r> => !!r);
}
