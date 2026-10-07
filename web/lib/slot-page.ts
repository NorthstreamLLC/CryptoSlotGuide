import catalogue from "@/data/gameCatalogue.json";
import { siteData } from "./site-data";
import type { CatalogueGame } from "./slot-db";
import { releaseDate, volatilityOf } from "./slot-db";
import artSources from "@/data/game-art-sources.json";
import rtpOverrides from "@/data/slot-rtp-overrides.json";
import { isTopSlot, TOP_SLOTS } from "./top-slots";
import { slotEssentialsLink, slotEssentialsLabel } from "./slotessentials";
import { artProxyPath } from "./art-proxy";

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

/**
 * A figure read off the studio's own page qualifies on its own, one build or
 * several. The multi-build bar above was built to stop bulk pages on FEED
 * numbers; a return cited to the studio's page, with the studio's volatility,
 * max win and release date beside it, is not the thing it guards against.
 * Wazdan and Red Tiger publish one return per title and 579 of theirs were
 * being held back by a rule aimed at a third-party import.
 */
const studioSourced = (g: CatalogueGame) => {
  const o = overrideOf(g);
  return !!o && o.versionsFrom === "studio" && (o.versions?.length ?? 0) > 0;
};

const QUALIFIES = (g: CatalogueGame) =>
  g.kind === "slot" &&
  !!g.slug &&
  (studioSourced(g) || ((!!g.demoUrl || hasStudioPage(g)) && rtpVersionsFor(g).length > 1) || isTopSlot(g.slug));

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
  // A local copy first; else the sister-site tile through /api/art, which
  // lib/art-proxy.ts limits to the host we may republish from.
  return rec?.file ? `/assets/games/${rec.file}` : artProxyPath(g.slug);
}

/**
 * The same art as publishableArt(), at list-row size: the 128px copy in
 * public/assets/games/t (scripts/make-art-thumbs.mjs) or the proxy's
 * 128px rendition. For tiles drawn small; a page's hero keeps the full file.
 */
export function publishableThumb(g: CatalogueSlotPage): string | null {
  const rec = g.slug ? ART[g.slug] : undefined;
  if (rec?.file) return `/assets/games/t/${rec.file}`;
  const p = artProxyPath(g.slug);
  return p ? `${p}?w=128` : null;
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
  /** How many RTP builds the studio publishes for the title; 0 where none is on record. */
  versions: number;
  /** The tile, where we hold art we may serve. */
  image: string | null;
}[] {
  const reviews = new Map(siteData.slots.map((s) => [s.slug, s]));
  return TOP_SLOTS.map((slug, i) => {
    const r = reviews.get(slug);
    if (r) {
      const un = (k: "rtp" | "vol" | "maxWin") => !!r.unpublished?.includes(k);
      const fb = catalogueFallback(slug, r.provider, r.name);
      const vol = un("vol") ? fb.vol : r.vol;
      const g = PAGES.get(slug);
      return {
        slug,
        rank: i + 1,
        name: r.name,
        provider: r.provider,
        rtp: !un("rtp") && typeof r.rtp === "number" ? `${r.rtp}%` : fb.rtp ?? "Not published",
        volatility: vol ? `${vol[0].toUpperCase()}${vol.slice(1)}` : "Not published",
        maxWin: (un("maxWin") ? fb.maxWin : r.maxWin) ?? "Not published",
        versions: r.rtpVersions ? r.rtpVersions.split("/").length : g ? rtpVersions(g).length : 0,
        image: slotArtBySlug(slug),
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
      versions: v.length,
      image: slotArtBySlug(slug),
    };
  }).filter((r): r is NonNullable<typeof r> => !!r);
}

/**
 * Art by slug alone, for surfaces that hold a slug and nothing else — the
 * menu's "Our top slots" column. Same rights rule as publishableArt(): only a
 * file we fetched from our own api.slotessentials.com is ours to serve, so
 * this reads the same ART map and returns null for anything else. Six of the
 * thirteen picks are hand-written reviews rather than catalogue pages, which
 * is why this cannot go through cataloguePage().
 */
export function slotArtBySlug(slug: string): string | null {
  const a = ART[slug];
  return a?.file ? `/assets/games/${a.file}` : artProxyPath(slug);
}

/**
 * Every slot of one studio as table rows, each linked somewhere real.
 *
 * studioTopTitles() capped the provider table at 24. The decision for the
 * ~7,600 titles this site does not review is to list them anyway — stats
 * from the catalogue, labelled — and send the reader to SlotEssentials for
 * the page we do not have. So the cap goes: a studio page lists everything
 * we hold for that studio, in one place a crawler can reach.
 *
 * Links, in order of preference: our own page where the title has one, then
 * SlotEssentials where its sitemap lists the title, else no link — never a
 * URL built from a slug. The label says which kind of page it is.
 *
 * Order: titles whose every build we hold come first, widest spread at the
 * top; then by name, so the long tail is at least scannable.
 */
/**
 * What the catalogue holds for a reviewed title, for the gaps a review leaves.
 *
 * A review written before a studio's sheet was on file says "Not published"
 * for volatility and max win; the catalogue now carries the studio's own
 * rating where we hold the sheet (volatilityOf) and the feed's figure where
 * we do not. Showing "Not published" next to a figure the database page
 * prints for the same title is wrong both ways, so the review's gaps fall
 * back to this — matched on studio, because ten slugs are shared.
 */
export function catalogueFallback(slug: string, studio: string, name?: string): { rtp: string | null; vol: string | null; maxWin: string | null } {
  const key = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  // By slug, else by name: a review's slug can differ from the feed's
  // (gonzo-s-quest-megaways vs gonzos-quest-megaways).
  let same = DB.games.filter((x) => x.slug === slug);
  if (!same.length && name) same = DB.games.filter((x) => x.kind === "slot" && key(x.name) === key(name));
  // The studio's own row first; else the slug alone, when it is not shared —
  // Big Bass Bonanza is Reel Kingdom's to us and Pragmatic Play's in the feed.
  const g = same.find((x) => key(x.provider ?? "") === key(studio)) ?? (same.length === 1 ? same[0] : undefined);
  if (!g) return { rtp: null, vol: null, maxWin: null };
  const v = rtpVersionsFor(g);
  const rtp = v.length > 1 ? `${v[0]}% – ${v[v.length - 1]}%` : v.length === 1 ? `${v[0]}%` : g.rtp != null ? `${g.rtp}%` : null;
  return {
    rtp,
    vol: volatilityOf(g),
    maxWin: g.maxWinMultiplier ? `${g.maxWinMultiplier.toLocaleString("en-GB")}x` : null,
  };
}

export function studioAllTitles(studioName: string): {
  rows: { slug: string | null; name: string; note: string; m1: string; m2: string; m3: string; href?: string; hrefLabel?: string; image?: string }[];
  sourced: boolean;
} {
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const want = key(studioName);
  const mine = (catalogue as { games: CatalogueGame[] }).games.filter(
    (g) => g.kind === "slot" && key(g.provider ?? "") === want
  );
  let anySourced = false;
  const rows = mine.map((g) => {
    const o = overrideOf(g);
    const v = o?.versions?.length
      ? [...new Set(o.versions)].sort((a, b) => b - a)
      : [...new Set(g.rtpVariants?.length ? g.rtpVariants : g.rtp != null ? [g.rtp] : [])].sort((a, b) => b - a);
    const sourced = !!o?.versions?.length;
    if (sourced) anySourced = true;
    const spread = v.length > 1 ? Math.round((v[0] - v[v.length - 1]) * 100) / 100 : 0;
    const ours = g.slug && PAGES.has(g.slug) ? `/slots/${g.slug}` : null;
    const se = slotEssentialsLink(g.slug);
    return {
      slug: g.slug,
      name: g.name,
      note: sourced
        ? spread
          ? `${v.length} published builds, ${spread}pp apart`
          : "One published return"
        : v.length
          ? "Catalogue figure, not read from the studio"
          : "No return in the catalogue",
      m1: v.length ? (spread ? `${v[0]}% – ${v[v.length - 1]}%` : `${v[0]}%`) : "Not published",
      m2: volatilityOf(g) ?? "Not published",
      m3: g.maxWinMultiplier ? `${g.maxWinMultiplier.toLocaleString()}x` : "Not published",
      href: ours ?? se ?? undefined,
      hrefLabel: ours ? "Our page" : se ? slotEssentialsLabel(g.provider) : undefined,
      image: g.slug ? slotArtBySlug(g.slug) ?? undefined : undefined,
      sourced,
      spread,
    };
  });
  rows.sort(
    (a, b) =>
      Number(b.sourced) - Number(a.sourced) || b.spread - a.spread || a.name.localeCompare(b.name)
  );
  return {
    rows: rows.map(({ slug, name, note, m1, m2, m3, href, hrefLabel, image }) => ({ slug, name, note, m1, m2, m3, href, hrefLabel, image })),
    sourced: anySourced,
  };
}

/**
 * Catalogue titles for a mechanic page, from signals the catalogue actually
 * holds. The mechanic pages drew only on the 21 hand-written reviews — 7 to
 * 15 titles each — while the catalogue holds 237 Megaways titles, 347 Hold &
 * Win titles and 2,938 rated high-volatility by their studio or the feed.
 *
 * Only titles with a page of their own are listed, so every card links
 * somewhere real. The signals, and their limits:
 *
 *   megaways       the name carries the trademark — reliable
 *   hold-and-win   "Hold & Win", "Hold and Win", "Hold & Spin", "Hold & Hit"
 *                  in the name — reliable, it is how studios label the format
 *   jackpot        "Jackpot" in the name — the studio's own word for it
 *   high-volatility the studio's own rating where we hold it (Play'n GO,
 *                  Hacksaw 4/5 and 5/5), else the feed's "high"
 *   cluster-pays   "Cluster" in the name only; Play'n GO's grid titles would
 *                  need the game type imported from their sheet first
 *   bonus-buy      no signal in the catalogue — reviews only
 *
 * Sorted by headline return, like the review cards above them.
 */
const MECHANIC_MATCH: Record<string, (g: CatalogueGame) => boolean> = {
  megaways: (g) => /megaways/i.test(g.name),
  "hold-and-win": (g) => /hold\s*(&|and)\s*(win|spin|hit)/i.test(g.name),
  jackpot: (g) => /jackpot/i.test(g.name),
  "high-volatility": (g) => /^(high|very high|super high|extreme|4\/5|5\/5)$/i.test(volatilityOf(g) ?? ""),
  "cluster-pays": (g) => /cluster/i.test(g.name),
};

export function catalogueByMechanic(tag: string, exclude: Set<string> = new Set()): CatalogueSlotPage[] {
  const match = MECHANIC_MATCH[tag];
  if (!match) return [];
  return [...PAGES.values()]
    .filter((g) => !exclude.has(g.slug as string) && match(g))
    .sort((a, b) => (rtpVersions(b)[0] ?? b.rtp ?? 0) - (rtpVersions(a)[0] ?? a.rtp ?? 0) || a.name.localeCompare(b.name));
}

/**
 * Everything the long-form review's stat strip shows for one pick, resolved
 * across both page kinds.
 *
 * A review record (slots.json) owns the RTP, volatility and max win it was
 * written against; the catalogue adds layout, lines, bet range and release
 * date where it holds the same title. A catalogue page owns all of it. The
 * strip never re-derives a figure — it is the same number the page above it
 * already prints, lined up in one place under the score.
 */
export interface SlotReviewFacts {
  name: string;
  studio: string | null;
  studioSlug: string | null;
  stats: { k: string; v: string }[];
  art: string | null;
  demoUrl: string | null;
  demoHost: string | null;
  /** The studio page the figures were read from. */
  sourceUrl: string | null;
  seLink: string | null;
  seLabel: string;
}

const cap = (v: string) => v[0].toUpperCase() + v.slice(1).replace(/-/g, " ");

export function slotReviewFacts(slug: string): SlotReviewFacts | null {
  const r = siteData.slots.find((x) => x.slug === slug);
  const page = PAGES.get(slug);
  const cat: CatalogueSlotPage | CatalogueGame | undefined = page ?? DB.games.find((g) => g.slug === slug);
  if (!r && !cat) return null;

  const stats: { k: string; v: string }[] = [];
  if (r) {
    const vs = r.rtpVersions ? r.rtpVersions.split("/").map((x) => x.trim()).filter(Boolean) : [];
    if (vs.length > 1) stats.push({ k: `${vs.length} published returns`, v: vs.map((x) => `${x}%`).join(" · ") });
    else if (!r.unpublished?.includes("rtp")) stats.push({ k: "RTP", v: `${r.rtp}%` });
    const fb = catalogueFallback(slug, r.provider, r.name);
    const vol = r.unpublished?.includes("vol") ? fb.vol : r.vol;
    const maxWin = r.unpublished?.includes("maxWin") ? fb.maxWin : r.maxWin;
    if (vol) stats.push({ k: "Volatility", v: cap(vol) });
    if (maxWin) stats.push({ k: "Max win", v: maxWin.replace(/x$/i, "×") });
  } else if (page) {
    const vs = rtpVersions(page);
    const only = singleRtp(page);
    if (vs.length > 1) stats.push({ k: `${vs.length} published returns`, v: vs.map((x) => `${x}%`).join(" · ") });
    else if (only !== null) stats.push({ k: "RTP", v: `${only}%` });
    const vol = volatilityOf(page);
    if (vol) stats.push({ k: "Volatility", v: cap(vol) });
    if (page.maxWinMultiplier) stats.push({ k: "Max win", v: `${page.maxWinMultiplier.toLocaleString("en-GB")}×` });
  }
  if (cat) {
    const rows = (cat as CatalogueSlotPage).rows;
    const layout = cat.reels && rows ? `${cat.reels}×${rows}` : cat.reels ? `${cat.reels} reels` : null;
    if (layout) stats.push({ k: "Layout", v: layout });
    if (cat.paylines) stats.push({ k: "Ways to win", v: cat.paylines.toLocaleString("en-GB") });
    const minBet = (cat as CatalogueSlotPage).minBet;
    const maxBet = (cat as CatalogueSlotPage).maxBet;
    if (minBet != null && maxBet != null) stats.push({ k: "Bet range", v: `${minBet} – ${maxBet}` });
    const rel = releaseDate(cat);
    if (rel) stats.push({ k: "Released", v: new Date(`${rel}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) });
  }

  const studio = r?.provider ?? cat?.provider ?? null;
  return {
    name: r?.name ?? cat?.name ?? slug,
    studio,
    studioSlug: cat?.providerSlug ?? null,
    stats,
    art: slotArtBySlug(slug),
    demoUrl: cat?.demoUrl ?? null,
    demoHost: cat?.demoHost ?? null,
    sourceUrl: r?.sourceUrl ?? (page ? rtpSource(page)?.sourceUrl ?? null : null),
    seLink: slotEssentialsLink(slug),
    seLabel: slotEssentialsLabel(studio),
  };
}

/**
 * What the catalogue says about one studio as a whole, for the profile page
 * of a studio we have not written up. Counts only — nothing here is a claim
 * about the studio beyond what its own titles in the catalogue carry.
 */
export function studioStats(studioName: string): {
  titles: number;
  withRtp: number;
  multiVersion: number;
  medianRtp: number | null;
  topRtp: { name: string; slug: string | null; rtp: number } | null;
  topMaxWin: { name: string; slug: string | null; x: number } | null;
  volatility: { label: string; n: number }[];
  demos: number;
  firstRelease: string | null;
  lastRelease: string | null;
} {
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const want = key(studioName);
  const mine = DB.games.filter((g) => g.kind === "slot" && key(g.provider ?? "") === want);
  const rtps: number[] = [];
  let multiVersion = 0;
  let topRtp: { name: string; slug: string | null; rtp: number } | null = null;
  let topMaxWin: { name: string; slug: string | null; x: number } | null = null;
  const vol = new Map<string, number>();
  const dates: string[] = [];
  let demos = 0;
  for (const g of mine) {
    const v = rtpVersionsFor(g);
    const best = v[0] ?? g.rtp ?? null;
    if (best != null) {
      rtps.push(best);
      if (!topRtp || best > topRtp.rtp) topRtp = { name: g.name, slug: g.slug, rtp: best };
    }
    if (v.length > 1) multiVersion++;
    if (g.maxWinMultiplier && (!topMaxWin || g.maxWinMultiplier > topMaxWin.x)) topMaxWin = { name: g.name, slug: g.slug, x: g.maxWinMultiplier };
    const vo = volatilityOf(g);
    if (vo) vol.set(vo, (vol.get(vo) ?? 0) + 1);
    const d = releaseDate(g);
    if (d) dates.push(d);
    if (g.demoUrl) demos++;
  }
  rtps.sort((a, b) => a - b);
  dates.sort();
  const median = rtps.length ? (rtps.length % 2 ? rtps[(rtps.length - 1) / 2] : (rtps[rtps.length / 2 - 1] + rtps[rtps.length / 2]) / 2) : null;
  return {
    titles: mine.length,
    withRtp: rtps.length,
    multiVersion,
    medianRtp: median != null ? Math.round(median * 100) / 100 : null,
    topRtp,
    topMaxWin,
    volatility: [...vol.entries()].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 4),
    demos,
    firstRelease: dates[0] ?? null,
    lastRelease: dates[dates.length - 1] ?? null,
  };
}
