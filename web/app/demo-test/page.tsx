import { pageMetadata } from "@/lib/seo";
import { DemoPlay } from "@/components/slots/DemoPlay";

/**
 * A private check page, not linked and not indexed: Nolimit City and NetEnt
 * demos opened in our player, to confirm from a normal browser that they load
 * before they go on the slot pages. Their game servers refuse our build
 * machines, so this can't be checked automatically. Delete once decided.
 */
export const metadata = pageMetadata("Demo test", "Private check page.", "/demo-test", undefined, { noindex: true });

// Through our host page, which starts the game with Nolimit's own nolimit.js (app/demo).
const nolimit = (id: string) => `/demo/nolimit/${id}`;
const netent = (id: string) => `https://netent.com/demo/${id}`;

const GAMES = [
  { studio: "Nolimit City", name: "Mental", url: nolimit("Mental") },
  { studio: "Nolimit City", name: "Tombstone RIP", url: nolimit("TombstoneRip") },
  { studio: "Nolimit City", name: "Deadwood R.I.P", url: nolimit("DeadwoodRip") },
  { studio: "Nolimit City", name: "Fire in the Hole 2", url: nolimit("FireInTheHole2") },
  { studio: "NetEnt", name: "Starburst", url: netent("starburstr000000") },
  { studio: "NetEnt", name: "Gonzo's Quest", url: netent("eldorado00000000") },
  { studio: "NetEnt", name: "Dead or Alive 2", url: netent("deadoralive2fb00") },
  { studio: "NetEnt", name: "Divine Fortune Megaways", url: netent("divinemegaways00") },
];

export default function Page() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 20px 96px", color: "#E8EDF0" }}>
      <h1 style={{ margin: "0 0 10px", fontSize: 32, fontWeight: 700 }}>Demo test: Nolimit City and NetEnt</h1>
      <p style={{ margin: "0 0 28px", fontSize: 15, lineHeight: 1.6, color: "#A9B8C0" }}>
        Press play on each. Note which ones reach the game&apos;s reels (a spin button you can press), which stay black or show an error, and whether
        &ldquo;Open in a new tab&rdquo; works where the in-page player doesn&apos;t. NetEnt may show its own 18+ check first.
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
