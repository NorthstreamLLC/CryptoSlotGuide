import { LandingShell, LinkCloud } from "@/components/landing/LandingShell";
import { BonusDecoder, type DecoderPreset } from "@/components/tools/BonusDecoder";
import { INDEX_ROWS } from "@/lib/bonus-index";
import { getSpecFact } from "@/lib/spec-sheet";
import { siteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Bonus Terms Decoder: what a crypto casino bonus costs to clear",
  "Pick a casino or enter your own offer: see the wagering in dollars, what finishing it costs on average, the break-even RTP, max bet, cashout cap and expiry, from the casino's own terms.",
  "/bonus-terms-decoder"
);

/** First clause of a stored fact, for one line in the form. */
const clause = (v?: string) => v?.split(/;\s|\.\s/)[0].replace(/\.$/, "") ?? null;

function presets(): DecoderPreset[] {
  return INDEX_ROWS.flatMap((r) => {
    const w = getSpecFact(r.slug, "Bonus terms", "Wagering");
    if (!w) return [];
    const fact = (label: string) => clause(getSpecFact(r.slug, "Bonus terms", label)?.value);
    return [{
      slug: r.slug,
      name: siteData.ops.find((o) => o.slug === r.slug)?.name ?? r.slug,
      match: r.match,
      mult: r.mult,
      basis: (r.base === "deposit+bonus" ? "deposit-bonus" : r.base) as DecoderPreset["basis"],
      edgeBase: r.edgeBase ?? null,
      maxBet: fact("Max bet"),
      maxCashout: fact("Max cashout"),
      expiry: fact("Expiry"),
      note: r.note ?? null,
      source: w.sourceUrl ?? null,
    }];
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export default function Page() {
  return (
    <LandingShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Bonus Terms Decoder" }]}
      eyebrow="Understand the terms"
      title="Bonus Terms Decoder"
      intro="Pick a casino to load its welcome bonus terms, or type in your own offer, and see what the wagering means in dollars and what finishing it costs on average. No casino connection, deposit or personal information required; inputs stay in this page’s memory."
    >
      <BonusDecoder presets={presets()} />
      <LinkCloud
        title="Check the offer in context"
        items={[
          { label: "Bonus true-cost index", href: "/bonuses/true-cost-index" },
          { label: "Bonus comparisons", href: "/bonuses" },
          { label: "Casino reviews", href: "/crypto-casinos" },
          { label: "Casino ChangeWatch", href: "/casino-changewatch" },
        ]}
      />
    </LandingShell>
  );
}
