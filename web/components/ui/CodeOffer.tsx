import { CodeChip } from "@/components/ui/CodeChip";

/**
 * "Sign up with code SLOTGUIDE and get <the casino's offer>": the code and
 * what signing up gets you, in one line, next to the button that does it.
 * The offer is the casino's own (Operator.bonusShort, from its terms) — the
 * line says what signing up with our code gets, never that the code is what
 * unlocks it. A code-only extra would be its own field, labelled as such.
 */
export function CodeOffer({ code, offer, casino, tint = "#57E39A", compact = false }: { code: string; offer: string; casino: string; tint?: string; compact?: boolean }) {
  return (
    <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: compact ? "6px 8px" : "8px 10px",
        padding: compact ? "8px 10px" : "12px 14px",
        borderRadius: compact ? 10 : 12,
        background: `linear-gradient(90deg, ${tint}1f, ${tint}08)`,
        border: `1px solid ${tint}40`,
        fontSize: compact ? 12.5 : 14,
        lineHeight: 1.4,
        color: "#DCE5E9",
      }}
    >
      <span style={{ fontWeight: 700 }}>Sign up with code</span>
      <CodeChip code={code} tint={tint} size="sm" bare />
      <span>
        and get <strong style={{ color: "#fff" }}>{offer}</strong>
      </span>
    </div>
    {/* Whose offer it is, and what the link is: the casino sets the bonus;
        we earn a commission on the sign-up. Both said plainly, every time. */}
    <div style={{ marginTop: 5, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: compact ? 9.5 : 10.5, lineHeight: 1.5, color: "#7F8D96" }}>
      {casino}&apos;s own offer, set by {casino}, not by us · Affiliate link: we may earn a commission, which never changes what we report · 18+
    </div>
    </div>
  );
}
