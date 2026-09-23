import { getOnChainVolume } from "@/lib/onchain-volume";

/**
 * Casino-only panel citing third-party on-chain deposit-volume platforms
 * (Tanzanite, FairGambling — see lib/onchain-volume.ts). Deliberately
 * styled apart from the "What we measured" stats grid it sits below on
 * both EntityReviewPage.tsx and RoobetReviewPage.tsx: those are our own
 * claims at whatever sourcing tier applies, this is someone else's
 * number, cited and dated, not verified by us. Renders nothing for an
 * operator with no real citation on file yet.
 */
export function OnChainActivity({ slug }: { slug: string }) {
  const entry = getOnChainVolume(slug);
  if (!entry || entry.sources.length === 0) return null;

  return (
    <div style={{ marginBottom: 38 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-.028em", fontWeight: 800, fontStretch: "112%", color: "#E8EDF0" }}>
        On-chain activity
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: 15, color: "#8DA0AA", maxWidth: "80ch", textWrap: "pretty" }}>
        Deposit flow is public on a blockchain — these figures are third-party platforms&apos; own attribution of wallet
        activity to this operator, not something we measured or verified ourselves. Address clustering is a heuristic,
        not a certainty; treat it as a signal of real volume, not an audited number.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(entry.sources.length, 3)}, 1fr)`, gap: 1, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 13, overflow: "hidden" }}>
        {entry.sources.map((s, i) => (
          <div key={`${s.source}-${s.metric}-${i}`} style={{ padding: "20px 22px", background: "#0C1013" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#83919A", marginBottom: 8 }}>
              {s.metric}
            </div>
            <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 22, fontWeight: 500, color: "#E8EDF0", letterSpacing: "-.02em", marginBottom: 5 }}>
              {s.value}
              {s.note && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: "#5FE3E8" }}>{s.note}</span>}
            </div>
            <a
              href={s.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:!text-accent"
              style={{ fontSize: 12.5, lineHeight: 1.45, color: "#7B8A93" }}
            >
              {s.source} ↗ · as of {s.asOf}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
