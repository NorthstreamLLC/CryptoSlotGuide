import catalogue from "@/data/gameCatalogue.json";
import sheetMeta from "@/data/studio-sheet-meta.json";

/**
 * Query layer over the imported slot catalogue.
 *
 * Filtering and paging happen on the SERVER, driven by URL search params. The
 * catalogue is 5.5MB across 8,845 games; shipping it to the browser to filter
 * client-side would be a worse page than the one it replaces, and a table that
 * only exists after JavaScript runs is invisible to a crawler. Every filter is
 * a link, so the state is shareable and the page works without JS.
 */

export interface CatalogueGame {
  name: string;
  slug: string | null;
  kind: "slot" | "table" | "house";
  provider: string | null;
  providerSlug: string | null;
  rtp: number | null;
  /**
   * Every published RTP configuration we hold for this title, highest first,
   * present only where a studio licences more than one. This is the figure the
   * lobby does not show you, and the reason the database is worth having.
   */
  rtpVariants?: number[];
  volatility: string | null;
  reels: number | null;
  paylines: number | null;
  maxWinMultiplier: number | null;
  released: string | null;
  image: string | null;
  /**
   * A demo hosted by the studio itself. Not a citation for the RTP — that
   * figure comes from the catalogue import — but it is the studio's own domain,
   * so it proves the title is theirs and gives the reader somewhere real to go.
   */
  demoUrl?: string | null;
  demoHost?: string | null;
  upcoming: boolean;
  studioStatus: string | null;
  studioConfirmed: boolean;
}

interface Catalogue {
  asOf: string;
  source: string;
  games: CatalogueGame[];
}

const DB = catalogue as unknown as Catalogue;
const SHEET_META = (sheetMeta as { games: Record<string, { released?: string; volatility?: string; studio?: string }> }).games;

/** Slots only. Table and house games live in their own sections of the site. */
const SLOTS: CatalogueGame[] = DB.games.filter((g) => g.kind === "slot");

/**
 * Dates the feed stamps on a whole batch rather than on a game.
 *
 * The source column is called `releasedAt`, but its values do not behave like
 * release dates: 2,589 titles share 2025-01-01, another 513 share 2026-04-02,
 * and twelve dates between them account for about 4,100 of the 8,783 slots.
 * Studios do not ship five hundred games in a day — those are import or
 * record-created stamps that arrived under a release-date heading.
 *
 * The rest looks real: 1,744 dates cover 3,432 games at five or fewer each,
 * which is what a genuine release calendar looks like across many studios. So
 * the batch stamps are suppressed and the plausible dates kept, instead of
 * throwing away half the catalogue's dates or publishing all of them.
 *
 * The threshold is deliberately tight. Ten titles industry-wide on one day is
 * already generous; anything above it is a batch.
 */
const BATCH_DATE_THRESHOLD = 10;
const BATCH_DATES: Set<string> = (() => {
  const n = new Map<string, number>();
  for (const g of SLOTS) if (g.released) n.set(g.released, (n.get(g.released) ?? 0) + 1);
  return new Set([...n.entries()].filter(([, c]) => c > BATCH_DATE_THRESHOLD).map(([d]) => d));
})();

/**
 * The release date, or null where the feed gave us a batch stamp. Everything
 * that shows or sorts on a date goes through this — a date we cannot stand
 * behind is worse than no date.
 */
export function releaseDate(g: CatalogueGame): string | null {
  // A studio's own sheet beats the feed outright. Pragmatic and Play'n GO
  // supply real calendars — 978 titles — where the feed had stamped an
  // import batch, so this is the difference between a date and a guess.
  const sheet = g.slug ? SHEET_META[g.slug]?.released : undefined;
  if (sheet) return sheet;
  return g.released && !BATCH_DATES.has(g.released) ? g.released : null;
}

/**
 * The volatility rating, preferring the studio's own.
 *
 * The catalogue feed only ever says low, medium or high, and says "medium" for
 * 5,644 of 8,721 slots — including 270 Hacksaw titles whose own data sheet
 * calls them very high. Where a studio publishes its own rating we use that,
 * which is the same rule release dates already follow.
 *
 * The studio's label is lower-cased so it sits beside the feed's values, but
 * not otherwise mapped: "very high" stays "very high" rather than being
 * flattened into the feed's three buckets.
 */
export function volatilityOf(g: CatalogueGame): string | null {
  const sheet = g.slug ? SHEET_META[g.slug] : undefined;
  // The sheet is keyed by slug, so only trust it when it is the same studio's
  // row — ten catalogue slugs are shared between two studios.
  const sameStudio =
    !!sheet?.studio &&
    sheet.studio.toLowerCase().replace(/[^a-z0-9]/g, "") === (g.provider ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const own = sameStudio ? sheet?.volatility : undefined;
  if (own && own.toLowerCase() !== "n/a") return own.toLowerCase();
  return g.volatility;
}

export const catalogueAsOf = DB.asOf;

export interface SlotQuery {
  q?: string;
  studio?: string;
  vol?: string;
  /** "high" = 96%+, "mid" = 94–96, "low" = under 94. */
  rtp?: string;
  /** Only titles with more than one published RTP configuration. */
  versions?: string;
  /** Only titles with a demo hosted on the studio's own domain. */
  demo?: string;
  sort?: string;
  page?: number;
}

export const PER_PAGE = 60;

/** Studios present in the catalogue, commonest first — the filter list. */
export function studioFacets(): { name: string; count: number }[] {
  const n = new Map<string, number>();
  for (const g of SLOTS) if (g.provider) n.set(g.provider, (n.get(g.provider) ?? 0) + 1);
  return [...n.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function volatilityFacets(): { name: string; count: number }[] {
  const n = new Map<string, number>();
  for (const g of SLOTS) if (g.volatility) n.set(g.volatility, (n.get(g.volatility) ?? 0) + 1);
  return [...n.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

const RTP_BANDS: Record<string, (v: number) => boolean> = {
  high: (v) => v >= 96,
  mid: (v) => v >= 94 && v < 96,
  low: (v) => v < 94,
};

export function querySlots(query: SlotQuery) {
  const q = (query.q ?? "").trim().toLowerCase();
  let rows = SLOTS;

  if (q) rows = rows.filter((g) => g.name.toLowerCase().includes(q) || (g.provider ?? "").toLowerCase().includes(q));
  if (query.studio) rows = rows.filter((g) => g.provider === query.studio);
  if (query.vol) rows = rows.filter((g) => g.volatility === query.vol);
  if (query.rtp && RTP_BANDS[query.rtp]) rows = rows.filter((g) => g.rtp !== null && RTP_BANDS[query.rtp!](g.rtp));
  if (query.versions === "1") rows = rows.filter((g) => (g.rtpVariants?.length ?? 0) > 1);
  if (query.demo === "1") rows = rows.filter((g) => !!g.demoUrl);

  // A null sorts last on every key, so an unknown figure never leads a column
  // that is supposed to be ranked by it.
  const last = (v: number | null) => (v === null ? -Infinity : v);
  const sorted = [...rows];
  switch (query.sort) {
    case "rtp-low":
      sorted.sort((a, b) => (a.rtp === null ? 1 : b.rtp === null ? -1 : a.rtp - b.rtp) || a.name.localeCompare(b.name));
      break;
    case "maxwin":
      sorted.sort((a, b) => last(b.maxWinMultiplier) - last(a.maxWinMultiplier) || a.name.localeCompare(b.name));
      break;
    case "new":
      sorted.sort((a, b) => (releaseDate(b) ?? "").localeCompare(releaseDate(a) ?? "") || a.name.localeCompare(b.name));
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default: // "rtp" — the figure most people came to compare.
      sorted.sort((a, b) => last(b.rtp) - last(a.rtp) || a.name.localeCompare(b.name));
  }

  const page = Math.max(1, query.page ?? 1);
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, pages);

  return {
    total: sorted.length,
    page: safePage,
    pages,
    rows: sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    /** Median of the matching set, so the number reflects the filter. */
    medianRtp: median(sorted.map((g) => g.rtp).filter((v): v is number => v !== null)),
  };
}

function median(v: number[]): number | null {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Totals for the standfirst, so no number on the page is hardcoded. */
export function catalogueTotals() {
  const withRtp = SLOTS.filter((g) => g.rtp !== null);
  return {
    slots: SLOTS.length,
    multiVersion: SLOTS.filter((g) => (g.rtpVariants?.length ?? 0) > 1).length,
    withDemo: SLOTS.filter((g) => !!g.demoUrl).length,
    withRtp: withRtp.length,
    studios: new Set(SLOTS.map((g) => g.provider).filter(Boolean)).size,
    median: median(withRtp.map((g) => g.rtp as number)),
  };
}
