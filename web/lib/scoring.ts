import type { Flag, FlagState } from "./types";

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
