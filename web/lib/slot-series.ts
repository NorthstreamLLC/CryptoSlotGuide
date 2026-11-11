import { siteData } from "./site-data";
import { studioAllTitles } from "./slot-page";
import type { TableRow } from "./entity-view";

/**
 * Slot series: one studio's titles that share a name and a formula, at
 * /slots/series/<slug>. The games come from the catalogue by studio and name,
 * with the same figures and links as the studio's own title list
 * (studioAllTitles), so a series page can't disagree with the provider page.
 *
 * Release dates are deliberately not shown: the catalogue's "released" field
 * holds the date a title entered the feed for many older games (Gates of
 * Olympus reads 2026), so it can't order a series or say which came first.
 *
 * A series needs at least three titles; fewer is a thin page.
 */
export interface SlotSeries {
  slug: string;
  name: string;
  studio: string;
  /** Matched against the title's name, case-insensitively. */
  match: RegExp;
  /** What the series has in common, in our words. */
  blurb: string;
  /** Page heading, where "<name> slots" reads badly. */
  title?: string;
  tint: string;
}

export const SLOT_SERIES: SlotSeries[] = [
  {
    slug: "gates-of-olympus",
    name: "Gates of Olympus",
    studio: "Pragmatic Play",
    match: /^gates of olympus\b/i,
    blurb: "Pragmatic Play's Greek-mythology series, with Zeus beside the grid. The editions share one formula: symbols pay anywhere on the screen, winning symbols tumble away so new ones drop in, and multiplier symbols add up before a win is paid. Later editions keep it and change the ceiling, the bet options or the format.",
    tint: "#B79CFF",
  },
  {
    slug: "sweet-bonanza",
    name: "Sweet Bonanza",
    studio: "Pragmatic Play",
    match: /^sweet bonanza\b/i,
    blurb: "Pragmatic Play's candy-themed series. Symbols pay anywhere on the grid and tumble away after each win, and multiplier bombs in the free spins add up before the win is paid. The newer editions keep the candy and raise the top prize.",
    tint: "#FF7EB6",
  },
  {
    slug: "le-series",
    name: "Le series",
    title: "Hacksaw's Le series slots",
    studio: "Hacksaw Gaming",
    match: /^le [a-z]/i,
    blurb: "Hacksaw Gaming's character series, each title named for its lead: Le Bandit, Le King, Le Pharaoh, Le Viking, Le Zeus and the rest. Different settings, one family resemblance, and Hacksaw's own volatility ratings on each.",
    tint: "#57E39A",
  },
  {
    slug: "starlight-princess",
    name: "Starlight Princess",
    studio: "Pragmatic Play",
    match: /^starlight princess\b/i,
    blurb: "Pragmatic Play's anime-styled series. It runs on the same pay-anywhere, tumbling, multiplier formula as Gates of Olympus, with a princess in place of Zeus.",
    tint: "#FFC531",
  },
  {
    slug: "big-bass",
    name: "Big Bass",
    studio: "Pragmatic Play",
    match: /^big bass\b/i,
    blurb: "Pragmatic Play's fishing series and one of its largest: in the free spins a fisherman collects the cash values of fish symbols that land with him. Seasonal, Megaways, Hold & Spinner and 1000 editions build on that.",
    tint: "#5FE3E8",
  },
];

export const seriesPath = (s: SlotSeries) => `/slots/series/${s.slug}`;
export const seriesTitle = (s: SlotSeries) => s.title ?? `${s.name} slots`;
export const seriesBySlug = (slug: string) => SLOT_SERIES.find((s) => s.slug === slug);

const REVIEWED = new Set(siteData.slots.map((s) => s.slug));
const num = (s: string) => [...s.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
const maxWinOf = (r: TableRow) => num(r.m3.replace(/,/g, ""))[0] ?? 0;

/** The series' titles: those with a page of ours first, then by top prize. */
export function seriesRows(s: SlotSeries): (TableRow & { slug: string | null })[] {
  return studioAllTitles(s.studio)
    .rows.filter((r) => s.match.test(r.name))
    .map((r) =>
      // A hand-written review owns its slug; studioAllTitles only knows the catalogue pages.
      r.slug && REVIEWED.has(r.slug) ? { ...r, href: `/slots/${r.slug}`, hrefLabel: "Our review" } : r
    )
    .sort((a, b) => Number(!!b.href?.startsWith("/")) - Number(!!a.href?.startsWith("/")) || maxWinOf(b) - maxWinOf(a) || a.name.localeCompare(b.name));
}

/** Figures for the page's summary, worked out from the rows. */
export function seriesStats(rows: TableRow[]) {
  const rtps = rows.flatMap((r) => num(r.m1)).filter((n) => n > 50 && n < 100);
  const top = [...rows].sort((a, b) => maxWinOf(b) - maxWinOf(a))[0];
  const vols = rows.map((r) => r.m2).filter((v) => !/not published/i.test(v));
  const counts = new Map<string, number>();
  for (const v of vols) counts.set(v, (counts.get(v) ?? 0) + 1);
  const [volMode, volModeCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  return {
    count: rows.length,
    rtpLow: rtps.length ? Math.min(...rtps) : null,
    rtpHigh: rtps.length ? Math.max(...rtps) : null,
    top: top && maxWinOf(top) ? { name: top.name, maxWin: top.m3 } : null,
    /** The studio's most common volatility rating in the series, and how many titles carry it. */
    volMode,
    volModeCount,
    ours: rows.filter((r) => r.href?.startsWith("/")).length,
  };
}

/** The series a slot belongs to, for a link from its own page. */
export function seriesForSlot(name: string, studio: string): SlotSeries | null {
  const key = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  return SLOT_SERIES.find((s) => key(s.studio) === key(studio) && s.match.test(name)) ?? null;
}

/** Only series with enough titles to stand as a page. */
export const publishedSeries = () => SLOT_SERIES.filter((s) => seriesRows(s).length >= 3);
