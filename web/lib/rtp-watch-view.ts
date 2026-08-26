/**
 * Ported from the `isWatch` block in CryptoSlotGuide.dc.html plus the
 * `watchAll`/`watchRows`/`cutCount`/`cutCells` logic in renderVals()
 * (search for "RTP Watch" comment block). The source models `rtpWatch` as one
 * row per title with a `cuts[]` array aligned to `watchOps`; our real
 * schema is per-cell (`rtp_reading`, one row per slot×operator — see
 * design/README.md's RTP Watch section, which explicitly says not to
 * carry the per-title shape into production). This module is the
 * adapter: reshape our real schema into the same per-title view the
 * page renders, without adopting the wrong-shape data model.
 */
import { siteData } from "./site-data";

export interface WatchCell {
  label: string;
  color: string;
  bg: string;
  weight: string;
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

  return slots
    .map((s) => {
      const readings = watchOps.map((op) => rtpWatch.find((r) => r.slotSlug === s.slug && r.operatorSlug === op.slug));
      const cuts = readings.map((r) => (r ? Math.max(0, Math.round((r.publishedRtp - r.rtp) * 100) / 100) : 0));
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
        cleanCount: `${cuts.filter((c) => c === 0).length}/${cuts.length}`,
        worstColor: worst ? "#DA9877" : "#5FE3E8",
        cells: cuts.map((c) => ({
          label: (s.rtp - c).toFixed(2),
          color: c ? "#DA9877" : "#E8EDF0",
          bg: c ? "rgba(196,101,58,.12)" : "transparent",
          weight: c ? "700" : "400",
        })),
      };
    })
    .filter((r) => r.cells.some(() => true)); // keep all — readings may be sparse but every slot is "tracked"
}

export function watchStats(rows: WatchRow[]) {
  const cutCount = rows.filter((r) => r.cut).length;
  const cutCells = rows.reduce((n, r) => n + r.cells.filter((c) => c.weight === "700").length, 0);
  return [
    { value: String(rows.length), label: "Titles on watch" },
    { value: String(cutCount), label: "Shipping somewhere cut" },
    { value: String(cutCells), label: "Reduced builds found" },
    { value: "24 Aug", label: "Last full pass" },
  ];
}
