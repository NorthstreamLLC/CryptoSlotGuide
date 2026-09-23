/**
 * Ported from the `isWatch` block in CryptoSlotGuide.dc.html plus the
 * `watchAll`/`watchRows`/`cutCount`/`cutCells` logic in renderVals()
 * (search for "RTP Watch" comment block). The source models `rtpWatch` as one
 * row per title with a `cuts[]` array aligned to `watchOps`; our real
 * schema is per-cell (`rtp_reading`, one row per slot×operator — see
 * root README.md's RTP Watch section, which explicitly says not to carry
 * the per-title shape into production). This module is the adapter:
 * reshape our real schema into the same per-title view the page renders,
 * without adopting the wrong-shape data model.
 *
 * data/rtpWatch.json holds ONLY real readings — populated by
 * scripts/import-rtp-readings.mjs, empty until the first real import.
 * The earlier design had this module additionally gate cells by whether
 * the operator was in lib/field-tested.ts's list; that was a real bug:
 * marking an operator "field-tested" (because we'd checked *some*
 * titles there) would make *every* title's cell for that operator
 * render as verified, including ones nobody had actually re-read. Gate
 * per cell, off the data that's actually there, not off a broader
 * per-operator flag — lib/field-tested.ts stays scoped to the separate
 * "did we open a funded account here at all" claim casino/wallet/
 * exchange reviews make.
 *
 * Staleness (root README's RTP Watch section, "Derive everything
 * else"): a reading older than 30 days is treated as unchecked rather
 * than shown as a stale confirmation — "prefer hiding a stale cell to
 * showing an unverified one."
 */
import { siteData } from "./site-data";
import { rtpLabel } from "./slot-facts";
import { isStaleReading } from "./derived";

export interface WatchCell {
  label: string;
  color: string;
  bg: string;
  weight: string;
  checked: boolean;
}

export interface WatchRow {
  slug: string;
  name: string;
  provider: string;
  seen: string;
  bestLabel: string;
  cut: boolean;
  cleanCount: string;
  worstColor: string;
  cells: WatchCell[];
}

/** The titles on the board: most-played slots whose studios sell several RTP builds. */
export const WATCH_SLOTS = ["sweet-bonanza-1000", "gates-of-olympus-1000", "sugar-rush-1000", "le-bandit", "wanted-dead-or-a-wild", "stormforged", "outsourced", "duck-hunters-2"];

export function getWatchRows(): WatchRow[] {
  const { slots, watchOps, rtpWatch } = siteData;

  return WATCH_SLOTS.map((slug) => slots.find((x) => x.slug === slug)!).filter(Boolean).map((s) => {
    const readings = watchOps.map((op) => {
      const r = rtpWatch.find((x) => x.slotSlug === s.slug && x.operatorSlug === op.slug);
      return r && !isStaleReading(r.checkedAt) ? r : undefined;
    });
    const cuts = readings.map((r) => (r ? Math.max(0, Math.round((r.publishedRtp - r.rtp) * 100) / 100) : 0));
    const checkedCount = readings.filter(Boolean).length;
    const worst = Math.max(0, ...cuts);
    const seenDates = readings.filter(Boolean).map((r) => r!.checkedAt);
    const seen = seenDates.length ? seenDates.sort().slice(-1)[0] : "not yet checked";

    return {
      slug: s.slug,
      name: s.name,
      provider: s.provider,
      seen,
      bestLabel: rtpLabel(s),
      cut: worst > 0,
      cleanCount: `${cuts.filter((c, i) => readings[i] && c === 0).length}/${checkedCount}`,
      worstColor: worst ? "#DA9877" : checkedCount ? "#5FE3E8" : "#77858E",
      cells: readings.map((r, i) => ({
        label: r ? r.rtp.toFixed(2) : "—",
        color: r ? (cuts[i] ? "#DA9877" : "#E8EDF0") : "#39454C",
        bg: r && cuts[i] ? "rgba(196,101,58,.12)" : "transparent",
        weight: r && cuts[i] ? "700" : "400",
        checked: !!r,
      })),
    };
  });
}

export function watchStats(rows: WatchRow[]) {
  const checkedTitles = rows.filter((r) => r.cells.some((c) => c.checked));
  const cutCount = rows.filter((r) => r.cut).length;
  const cutCells = rows.reduce((n, r) => n + r.cells.filter((c) => c.weight === "700").length, 0);
  const totalCells = rows.length * (rows[0]?.cells.length ?? 0);
  const checkedCells = rows.reduce((n, r) => n + r.cells.filter((c) => c.checked).length, 0);
  return [
    { value: String(rows.length), label: "Titles on watch" },
    { value: `${checkedCells}/${totalCells}`, label: "Operator builds field-tested" },
    { value: checkedTitles.length ? String(cutCount) : "—", label: "Shipping somewhere cut" },
    { value: checkedTitles.length ? String(cutCells) : "—", label: "Reduced builds found" },
  ];
}

/** One casino's RTP Watch result, for its report: how many titles were read and whether any ran below the full build. */
export function rtpSummary(operatorSlug: string) {
  const { rtpWatch, slots } = siteData;
  const readings = rtpWatch.filter((r) => r.operatorSlug === operatorSlug && !isStaleReading(r.checkedAt));
  if (!readings.length) return null;
  const cut = readings.filter((r) => r.rtp < r.publishedRtp);
  const name = (slug: string) => slots.find((s) => s.slug === slug)?.name ?? slug;
  return {
    count: readings.length,
    cut: cut.length,
    checkedAt: readings.map((r) => r.checkedAt).sort().slice(-1)[0],
    titles: readings.map((r) => `${name(r.slotSlug)} ${r.rtp.toFixed(2)}%`),
    cutTitles: cut.map((r) => `${name(r.slotSlug)} ${r.rtp.toFixed(2)}% (full build ${r.publishedRtp.toFixed(2)}%)`),
  };
}

/** Edge from one cited house-game figure: an explicit "x% edge", else 100 minus the stated RTP. */
function edgeOf(value: string): number | null {
  const e = value.match(/(\d+(?:\.\d+)?)%\s*(?:\([^)]*\)\s*)?edge/i);
  if (e) return Number(e[1]);
  const r = value.match(/(\d+(?:\.\d+)?)%/);
  return r ? Math.round((100 - Number(r[1])) * 100) / 100 : null;
}

/** Casinos shown on the house-games table beyond the slot board. */
export const HOUSE_EXTRA = ["bc-game", "rollbit", "duelbits", "duel"];

/** House games board: each original's house edge at each watched casino, from the cited figures in houseGames.json. */
export function getHouseEdgeRows() {
  const { houseGames, watchOps, ops } = siteData;
  const extra = HOUSE_EXTRA.map((slug) => ({ slug, name: ops.find((o) => o.slug === slug)?.name ?? slug }));
  const cols = [...watchOps, ...extra.filter((e) => !watchOps.some((w) => w.slug === e.slug))];
  const fmt = (n: number) => `${n % 1 ? n.toFixed(1) : n}%`;
  const all = houseGames.map((g) => ({
    slug: g.slug,
    name: g.name,
    range: g.edgeRange,
    cells: cols.map((op) => {
      const found = g.edges
        .filter((e) => e.casino === op.slug)
        .map((e) => ({ edge: edgeOf(e.value), dynamic: /higher|dynamic/i.test(e.value) }))
        .filter((x) => x.edge !== null);
      if (!found.length) return { label: "—", edge: null as number | null };
      const lo = Math.min(...found.map((x) => x.edge!));
      const hi = Math.max(...found.map((x) => x.edge!));
      const rtp = (e: number) => fmt(Math.round((100 - e) * 100) / 100);
      return { label: (lo === hi ? rtp(lo) : `${rtp(hi).replace("%", "")}–${rtp(lo)}`) + (found.some((x) => x.dynamic) ? " or less" : ""), edge: lo as number | null };
    }),
  }));
  // Keep casinos with at least two published figures, and derive each range from what is shown.
  const keep = cols.map((_, i) => all.filter((r) => r.cells[i].edge !== null).length >= 2);
  const rows = all.map((r) => {
    const cells = r.cells.filter((_, i) => keep[i]);
    const known = cells.filter((c) => c.edge !== null).map((c) => c.edge as number);
    const lo = Math.min(...known), hi = Math.max(...known);
    const rtp = (e: number) => fmt(Math.round((100 - e) * 100) / 100);
    return { ...r, cells, range: known.length ? (lo === hi ? rtp(lo) : `${rtp(hi).replace("%", "")}–${rtp(lo)}`) : r.range };
  });
  return { cols: cols.filter((_, i) => keep[i]), rows };
}
