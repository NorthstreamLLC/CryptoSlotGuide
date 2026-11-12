import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { LandingShell } from "@/components/landing/LandingShell";
import { NextSteps } from "@/components/layout/NextSteps";
import { DemoGrid } from "@/components/slots/DemoGrid";
import { demoTiles } from "@/lib/slot-demos";

const PATH = "/slots/free-demos";

export function generateMetadata() {
  const n = demoTiles().length;
  return pageMetadata(
    `Free slot demos: play ${n} Hacksaw Gaming slots for free`,
    `Play ${n} Hacksaw Gaming slots free in the studio's own demo: play money, no account and no deposit. Each with its published RTP, volatility and max win.`,
    PATH
  );
}

export default function Page() {
  const tiles = demoTiles();
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Slots", path: "/slots" }, { name: "Free demos", path: PATH }])]} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Slots", href: "/slots" }, { label: "Free demos" }]}
        eyebrow="Play for free"
        title="Free slot demos"
        intro={`${tiles.length} Hacksaw Gaming slots you can play right here, in the studio's own demo player: play money only, no account, no deposit, open wherever you are. Try a game's bonus round and volatility before you ever stake real money.`}
      >
        <DemoGrid tiles={tiles} />
        <p style={{ margin: "26px 0 0", maxWidth: "70ch", fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA" }}>
          A demo runs the studio&apos;s published build. A casino can run the same game at a lower RTP, so check the figure in the game&apos;s info panel where you play for real. Demo wins are not paid out.
        </p>
        <NextSteps
          steps={[
            { href: "/slots/best-crypto-slot-sites", label: "Ready to play for real?", hint: "The crypto casinos for slots, with withdrawal times and the wagering on each bonus." },
            { href: "/providers/hacksaw-gaming", label: "Hacksaw Gaming", hint: "Every Hacksaw title with its RTP versions, volatility and max win." },
            { href: "/guides/how-casino-rtp-versions-work", label: "How RTP versions work", hint: "Why the same game can pay back less at one casino than another." },
          ]}
        />
      </LandingShell>
    </>
  );
}
