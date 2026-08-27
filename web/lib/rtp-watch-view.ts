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

export function getWatchRows(): WatchRow[] {
  const { slots, watchOps, rtpWatch } = siteData;

  return slots.map((s) => {
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
      bestLabel: `${s.rtp.toFixed(2)}%`,
      cut: worst > 0,
      cleanCount: `${cuts.filter((c, i) => readings[i] && c === 0).length}/${checkedCount}`,
      worstColor: worst ? "#DA9877" : checkedCount ? "#5FE3E8" : "#4E5A62",
      cells: readings.map((r, i) => ({
        label: r ? (s.rtp - cuts[i]).toFixed(2) : "—",
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
