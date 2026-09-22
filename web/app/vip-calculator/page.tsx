import ladders from "@/data/vip-ladders.json";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteData } from "@/lib/site-data";
import { logoFor } from "@/lib/logo";
import { LandingShell } from "@/components/landing/LandingShell";
import { VipCalculator, type CalcCasino } from "@/components/vip/VipCalculator";
import { NextSteps } from "@/components/layout/NextSteps";

export const metadata = pageMetadata(
  "Crypto casino VIP calculator: what rank does your wager reach?",
  "Enter how much you have wagered and see your VIP rank, level-up rewards and distance to the next rank at every crypto casino that publishes its ladder, from each casino's own VIP pages.",
  "/vip-calculator"
);

type Ladder = { url: string; ranks: { rank: string; wager: number | null; rewards?: string }[] };

export default function Page() {
  const casinos: CalcCasino[] = Object.entries(ladders as Record<string, Ladder>)
    .map(([slug, l]) => {
      const o = siteData.ops.find((x) => x.slug === slug);
      const ranks = l.ranks.filter((r) => typeof r.wager === "number").map((r) => ({ rank: r.rank, wager: r.wager as number, rewards: r.rewards ?? "" })).sort((a, b) => a.wager - b.wager);
      return o && ranks.length >= 3 ? { slug, name: o.name, logo: logoFor(slug), featured: !!o.featured, url: l.url, ranks } : null;
    })
    .filter(Boolean) as CalcCasino[];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "VIP calculator", path: "/vip-calculator" }])} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "VIP calculator" }]}
        eyebrow="VIP calculator"
        title="What VIP rank does your wager reach?"
        intro={`Enter how much you have wagered and see your rank, what it unlocks and how far the next rank is at ${casinos.length} crypto casinos that publish their VIP ladder in dollars wagered. Every rank and reward comes from the casino's own VIP pages.`}
      >
        <VipCalculator casinos={casinos} />
        <p style={{ margin: "18px 0 0", maxWidth: "86ch", fontSize: 12.5, lineHeight: 1.6, color: "#6E7F88" }}>
          Only casinos that publish thresholds in dollars wagered are included; ladders counted in XP or points, or kept private, are listed on each casino&apos;s report instead. Some casinos weight wagers by game, so your real progress can differ.
        </p>
        <NextSteps
          steps={[
            { href: "/bonuses", label: "Every bonus and reward", hint: "Welcome offers, rakeback and cashback with the wagering each carries." },
            { href: "/races", label: "Races & raffles", hint: "The recurring prize pools your wagering also feeds." },
            { href: "/crypto-casinos", label: "All crypto casinos", hint: "Filter by payout speed, KYC, wagering and sportsbook." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "Every rank above comes from the casino's own VIP page." },
          ]}
        />
      </LandingShell>
    </>
  );
}
