import type { Flag, FlagState, ScoreBar } from "./types";

const SCORE_MIN = 5.5;
const SCORE_MAX = 9.9;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Score bars — see design/README.md "Every published figure is derived":
 * `crit(base, offsets[], names[])` clamps `base + offset` to 5.5–9.9 and
 * returns one bar per name/offset pair.
 */
export function crit(base: number, offsets: number[], names: string[]): ScoreBar[] {
  if (offsets.length !== names.length) {
    throw new Error("crit(): offsets and names must be the same length");
  }
  return names.map((name, i) => {
    const val = clamp(base + offsets[i], SCORE_MIN, SCORE_MAX);
    const pct = ((val - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
    return { name, val: Math.round(val * 10) / 10, pct, color: "var(--color-accent)" };
  });
}

/**
 * Fairness flags — colors per the "Color" token table:
 * accent-bright = positive flags, caution = "Watch" flags, warning = negative flags.
 */
export function flag(state: FlagState): Flag {
  switch (state) {
    case "ok":
      return {
        label: "OK",
        color: "var(--color-accent-bright)",
        background: "var(--color-accent-wash)",
      };
    case "watch":
      return {
        label: "Watch",
        color: "var(--color-caution)",
        background: "rgba(214, 182, 92, 0.12)",
      };
    case "bad":
      return {
        label: "Flagged",
        color: "var(--color-warning)",
        background: "rgba(218, 152, 119, 0.12)",
      };
  }
}
