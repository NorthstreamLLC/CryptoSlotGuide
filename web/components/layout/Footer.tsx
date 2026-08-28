import Link from "next/link";

/**
 * Ported from `<footer>` in CryptoSlotGuide.dc.html (search for
 * `<footer style="background:#07090B`) and the `footerCols` data a few
 * hundred lines later in renderVals(). Structure, copy, and the four
 * column groups are the real ones.
 */
const footerCols = [
  {
    title: "Casinos",
    links: [
      { l: "Top crypto casinos", href: "/crypto-casinos" },
      { l: "No-KYC casinos", href: "/crypto-casinos/no-kyc" },
      { l: "Fastest payouts", href: "/fastest-payouts" },
      { l: "Live casinos", href: "/live-casino" },
      { l: "Bonuses tracked", href: "/bonuses" },
      { l: "Fiat casinos", href: "/fiat-casinos" },
    ],
  },
  {
    title: "Slots & games",
    links: [
      { l: "Highest RTP slots", href: "/slots" },
      { l: "Bonus buy slots", href: "/slots/bonus-buy" },
      { l: "Megaways slots", href: "/slots/megaways" },
      { l: "Jackpot slots", href: "/slots/jackpot" },
      { l: "Provably fair originals", href: "/house-games" },
      { l: "Slot RTP tracker", href: "/rtp-watch" },
    ],
  },
  {
    title: "Betting",
    links: [
      { l: "Crypto sportsbooks", href: "/sportsbooks" },
      { l: "Sports markets", href: "/sportsbooks?tab=1" },
      { l: "Esports betting", href: "/sportsbooks?tab=2" },
      { l: "Prediction markets", href: "/prediction-markets" },
      { l: "Game providers", href: "/providers" },
      { l: "Guides", href: "/guides" },
    ],
  },
  {
    title: "About",
    links: [
      { l: "How we rate", href: "/how-we-rate" },
      { l: "Wallets", href: "/wallets" },
      { l: "Exchanges", href: "/exchanges" },
      { l: "Coins we track", href: "/coins" },
      { l: "Search the index", href: "/search" },
      { l: "Responsible gambling", href: "/guides/kyc-thresholds-explained" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#07090B", borderTop: "1px solid rgba(255,255,255,.07)" }}>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "52px 40px 28px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 1,
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "-.02em",
              fontStretch: "112%",
              marginBottom: 14,
            }}
          >
            <span>CryptoSlot</span>
            <span style={{ color: "#00C2CC" }}>Guide</span>
          </div>
          <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.6, color: "#6E7F88", maxWidth: "34ch" }}>
            Independent crypto gambling and Web3 product reviews. We field-test what we can fund by hand and disclose
            exactly which reviews that covers — see{" "}
            <Link href="/how-we-rate" style={{ color: "#8DA0AA" }}>how we rate</Link>.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["18+ ONLY", "BEGAMBLEAWARE", "GAMSTOP"].map((badge) => (
              <span
                key={badge}
                style={{
                  padding: "5px 9px",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 5,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 10,
                  color: "#8DA0AA",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {footerCols.map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10.5,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "#4E5A62",
                marginBottom: 14,
              }}
            >
              {col.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:!text-white"
                  style={{ fontSize: 13, color: "#8DA0AA" }}
                >
                  {link.l}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "22px 40px 44px",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.7, color: "#5C6A72", maxWidth: "96ch", textWrap: "pretty" }}>
          Gambling involves risk and is not a way to make money. Never stake funds you cannot afford to lose. If
          gambling stops feeling like entertainment, use the deposit limits, cool-off and self-exclusion tools every
          operator on this site is required to offer, or contact BeGambleAware on 0808 8020 133. Availability of the
          operators listed here depends on your jurisdiction — check local law before registering.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            color: "#4E5A62",
          }}
        >
          <span>© 2026 CryptoSlotGuide.com · Some links are affiliate links.</span>
          <div style={{ display: "flex", gap: 18 }}>
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Editorial standards", href: "/editorial-standards" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="hover:!text-white" style={{ color: "#4E5A62" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
