import type { Flag, FlagState, ScoreBar } from "./types";

const SCORE_MIN = 5.5;
const SCORE_MAX = 9.9;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Score bars — ported exactly from `crit(base, offsets, names)` in
 * CryptoSlotGuide.dc.html (search for `crit(base, offsets, names) {`).
 * Note `pct` is `v * 10` (so bars run 55–99%, never empty/full — by
 * design, since every score is clamped to 5.5–9.9), not a min-max
 * normalization, and `color` dims below the base score rather than
 * staying a flat accent.
 */
export function crit(base: number, offsets: number[], names: string[]): ScoreBar[] {
  if (offsets.length !== names.length) {
    throw new Error("crit(): offsets and names must be the same length");
  }
  return names.map((name, i) => {
    const v = clamp(base + offsets[i], SCORE_MIN, SCORE_MAX);
    return {
      name,
      val: Math.round(v * 10) / 10,
      pct: Math.round(v * 10),
      color: v >= base ? "#00C2CC" : "#4E6469",
    };
  });
}

/**
 * Fairness flags — ported exactly from `flag(kind)` in the source
 * (search for `flag(kind) {`). Labels are "Fair" / "Watch" /
 * "Limits withdrawal", not a generic "OK"/"Flagged".
 */
export function flag(state: FlagState): Flag {
  switch (state) {
    case "ok":
      return { label: "Fair", color: "#5FE3E8", background: "rgba(0,194,204,.12)" };
    case "watch":
      return { label: "Watch", color: "#D6B65C", background: "rgba(214,182,92,.14)" };
    case "bad":
      return { label: "Limits withdrawal", color: "#DA9877", background: "rgba(196,101,58,.12)" };
  }
}
