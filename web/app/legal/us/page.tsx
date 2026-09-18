import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { US_STATES, US_SHAPES, stateBy, toneOf } from "@/lib/legal";
import { LegalMap } from "@/components/legal/LegalMap";
import { LegalHero, RegionGrid, Tabs, Disclaimer } from "@/components/legal/LegalUI";

export const metadata = pageMetadata(
  "Online casino & sports betting laws by US state: map",
  "Click any state to see whether real-money online casinos, sports betting, online poker and sweepstakes casinos are legal there, who regulates them and which casinos are licensed. Sourced from each state regulator.",
  "/legal/us"
);

export default function Page() {
  const states = [...US_STATES].sort((a, b) => a.name.localeCompare(b.name));
  const legalCasino = states.filter((s) => toneOf(s.onlineCasino) === "legal").length;
  const onlineSports = states.filter((s) => /online/i.test(s.sportsBetting)).length;
  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gambling laws", path: "/legal" }, { name: "United States", path: "/legal/us" }])} />
      <LegalHero crumbs={[{ label: "Home", href: "/" }, { label: "Gambling laws", href: "/legal" }, { label: "United States" }]} eyebrow="United States" title="Online gambling laws by state">
        <p style={{ margin: "0 0 20px", maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
          Click a state to see whether real-money online casinos, sports betting, online poker and sweepstakes casinos are legal there, who regulates them and which casinos hold a licence. Every status comes from the state regulator&apos;s own pages.
        </p>
        {states.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              [String(legalCasino), "states with legal online casinos"],
              [String(onlineSports), "states with online sports betting"],
            ].map(([v, l]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "baseline", gap: 8, padding: "9px 14px", borderRadius: 100, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", fontSize: 13.5, color: "#A8B6BE" }}>
                <strong style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{v}</strong>
                {l}
              </span>
            ))}
          </div>
        )}
      </LegalHero>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 80px" }}>
        <Tabs active="us" />
        <div style={{ padding: 18, borderRadius: 20, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
          <LegalMap shapes={US_SHAPES} viewBox="0 0 975 610" labels statusOf={(c) => stateBy(c)?.onlineCasino} hrefOf={(c) => (stateBy(c) ? `/legal/us/${c.toLowerCase()}` : null)} />
          <div style={{ marginTop: 8, fontSize: 12.5, color: "#6E7F88" }}>Colours show real-money online casino status. Open a state for sports betting, poker and sweepstakes.</div>
        </div>
        {states.length > 0 && (
          <>
            <h2 style={{ margin: "36px 0 14px", fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>All states</h2>
            <RegionGrid items={states.map((s) => ({ href: `/legal/us/${s.code.toLowerCase()}`, name: s.name, status: s.onlineCasino }))} />
          </>
        )}
        <Disclaimer />
      </section>
    </main>
  );
}
