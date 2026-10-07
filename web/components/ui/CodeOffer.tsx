import { CodeChip } from "@/components/ui/CodeChip";

/**
 * "Sign up with code SLOTGUIDE and get <the casino's offer>": the code and
 * what signing up gets you, in one line, next to the button that does it.
 * The offer is the casino's own (Operator.bonusShort, from its terms) — the
 * line says what signing up with our code gets, never that the code is what
 * unlocks it. A code-only extra would be its own field, labelled as such.
 */
export function CodeOffer({ code, offer, casino, perk, tint = "#57E39A", compact = false, quiet = false }: { code: string; offer: string; casino: string; perk?: string; tint?: string; compact?: boolean; /** Leave the disclosure line to the surrounding block (a grid of these carries one). */ quiet?: boolean }) {
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
      {/* Ours, not the casino's: said as such. */}
      {perk && (
        <span style={{ flexBasis: "100%", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ padding: "2px 8px", borderRadius: 100, background: "#FFC531", color: "#141007", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 9.5, fontWeight: 800, letterSpacing: ".05em" }}>ONLY WITH CODE {code}</span>
          <strong style={{ color: "#FFE08A" }}>+ {perk}</strong>
        </span>
      )}
    </div>
    {/* Whose offer it is, and what the link is: the casino sets the bonus;
        we earn a commission on the sign-up. Both said plainly, every time. */}
    {!quiet && <div style={{ marginTop: 5, fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: compact ? 9.5 : 10.5, lineHeight: 1.5, color: "#7F8D96" }}>
      {casino}&apos;s own offer, set by {casino}, not by us{perk ? "; the extra is ours, paid by us" : ""} · Affiliate link: we may earn a commission, which never changes what we report · 18+
    </div>}
    </div>
  );
}
