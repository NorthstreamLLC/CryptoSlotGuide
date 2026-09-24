import { BrandMark } from "@/components/ui/BrandMark";
import { tintFor } from "@/lib/logo";

/**
 * The drifting brand columns from the hero of the original design
 * (CryptoSlotGuide.dc.html — its markup animates them with `csg-up` and
 * `csg-down` at 43s). The keyframes were ported into globals.css and then sat
 * unused because the markup never came with them; this is that markup.
 *
 * Decorative, so it is aria-hidden and carries no text. Each column repeats its
 * own tiles twice and animates to -50%, which is what makes the loop seamless:
 * at the halfway point the second copy sits exactly where the first began.
 *
 * The site-wide prefers-reduced-motion rule in globals.css stops all of this for
 * anyone who asks for less movement, which is why there is no separate handling
 * here.
 */

type Tile = { slug: string; mono: string };

/** A spread of what the site actually covers: casinos, exchanges, studios, wallets. */
const COLUMNS: Tile[][] = [
  [
    { slug: "roobet", mono: "RB" },
    { slug: "kraken", mono: "KR" },
    { slug: "hacksaw-gaming", mono: "HG" },
    { slug: "metamask", mono: "MM" },
    { slug: "gamdom", mono: "GD" },
    { slug: "pragmatic-play", mono: "PP" },
  ],
  [
    { slug: "stake", mono: "ST" },
    { slug: "nolimit-city", mono: "NC" },
    { slug: "coinbase", mono: "CB" },
    { slug: "duelbits", mono: "DB" },
    { slug: "ledger", mono: "LG" },
    { slug: "push-gaming", mono: "PG" },
  ],
  [
    { slug: "bc-game", mono: "BC" },
    { slug: "okx", mono: "OK" },
    { slug: "relax-gaming", mono: "RG" },
    { slug: "shuffle", mono: "SH" },
    { slug: "phantom", mono: "PH" },
    { slug: "rollbit", mono: "RL" },
  ],
];

/** Different speeds and directions, so the columns never lock into one visible rhythm. */
const MOTION = [
  { animation: "csg-up 43s linear infinite" },
  { animation: "csg-down 52s linear infinite" },
  { animation: "csg-up 61s linear infinite" },
];

export function LogoColumns() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        // Sits behind the hero copy and the featured offer, and fades out toward
        // the headline so it never competes with anything being read.
        opacity: 0.55,
        maskImage: "linear-gradient(90deg, transparent 0%, transparent 38%, #000 68%), linear-gradient(180deg, transparent 0%, #000 18%, #000 78%, transparent 100%)",
        maskComposite: "intersect",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 38%, #000 68%), linear-gradient(180deg, transparent 0%, #000 18%, #000 78%, transparent 100%)",
        WebkitMaskComposite: "source-in",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: 18, height: "100%", padding: "0 40px" }}>
        {COLUMNS.map((tiles, col) => (
          <div key={col} style={{ width: 104, overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, ...MOTION[col] }}>
              {/* Twice through: the second pass is what the loop lands on. */}
              {[...tiles, ...tiles].map((t, i) => (
                <span key={t.slug + i} style={{ width: 104, height: 104, flex: "none", borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.02)" }}>
                  <BrandMark slug={t.slug} mono={t.mono} tint={tintFor(t.slug)} radius={22} fontSize={26} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
