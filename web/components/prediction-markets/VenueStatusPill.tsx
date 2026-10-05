import type { VenueStatus } from "@/lib/prediction-markets";

/** One venue's standing in one country, as a pill whose colour carries the answer. */
const MONO = "var(--font-jetbrains-mono), monospace";

export function statusLabel(s: VenueStatus): { label: string; color: string; detail: string | null } {
  switch (s.kind) {
    case "open":
      return { label: "Available", color: "#7BE0B8", detail: null };
    case "regions":
      return { label: "Available", color: "#7BE0B8", detail: `Except ${s.regions.join(", ")}` };
    case "blocked":
      return { label: "Restricted", color: "#E5848A", detail: null };
    case "close-only":
      return { label: "Close-only", color: "#E8C37A", detail: "Existing positions can be closed; no new ones opened" };
    case "unclear":
      return { label: "See terms", color: "#E8C37A", detail: `The terms restrict "${s.quote}"` };
    case "check":
      return { label: "Check eligibility", color: "#9FB4C2", detail: null };
    case "not-offered":
      return { label: "Not offered", color: "#8E9CA5", detail: null };
  }
}

export function VenueStatusPill({ s }: { s: VenueStatus }) {
  const { label, color } = statusLabel(s);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 100, border: `1px solid ${color}55`, background: `${color}14`, fontFamily: MONO, fontSize: 11, fontWeight: 700, color, whiteSpace: "nowrap" }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 6, background: color }} />
      {label}
    </span>
  );
}
