import { pageMetadata } from "@/lib/seo";
import { DemoPlay } from "@/components/slots/DemoPlay";

/**
 * A private check page, not linked and not indexed: Relax Gaming and Push
 * Gaming demos opened in our player, to confirm from a normal browser that they
 * load before they go on the slot pages. Their game servers refuse our build
 * machines, so this can't be checked automatically. Delete once decided.
 */
export const metadata = pageMetadata("Demo test", "Private check page.", "/demo-test", undefined, { noindex: true });

const GAMES = [
  { studio: "Relax Gaming", name: "Money Train 4", url: "/demo/relax/moneytrain4" },
  { studio: "Relax Gaming", name: "Atlantis Crush", url: "/demo/relax/atlantiscrush" },
  { studio: "Relax Gaming", name: "Banana Town", url: "/demo/relax/bananatown" },
  { studio: "Push Gaming", name: "Big Bamboo", url: "/demo/push/big-bamboo" },
  { studio: "Push Gaming", name: "Retro Sweets", url: "/demo/push/retro-sweets" },
  { studio: "Push Gaming", name: "Boss Bear", url: "/demo/push/boss-bear" },
];

export default function Page() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 20px 96px", color: "#E8EDF0" }}>
      <h1 style={{ margin: "0 0 10px", fontSize: 32, fontWeight: 700 }}>Demo test: Relax Gaming and Push Gaming</h1>
      <p style={{ margin: "0 0 28px", fontSize: 15, lineHeight: 1.6, color: "#A9B8C0" }}>
        Press play on each. Note which reach the game&apos;s reels (a spin button you can press), which stay black or show an error, and whether &ldquo;Open in a new tab&rdquo; works where the in-page player doesn&apos;t.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {GAMES.map((g) => (
          <div key={g.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "#0D1114" }}>
            <span>
              <b style={{ display: "block", fontSize: 16 }}>{g.name}</b>
              <small style={{ fontSize: 13, color: "#8E9CA4" }}>{g.studio}</small>
            </span>
            <DemoPlay url={g.url} name={g.name} studio={g.studio} slug={`test-${g.name}`} variant="button" />
          </div>
        ))}
      </div>
    </main>
  );
}
