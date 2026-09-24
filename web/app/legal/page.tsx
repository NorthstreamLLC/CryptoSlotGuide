import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { COUNTRIES, WORLD_SHAPES, countryBy } from "@/lib/legal";
import { countryHoverInfo } from "@/lib/legal-hover";
import { MapHover } from "@/components/legal/MapHover";
import { LegalMap } from "@/components/legal/LegalMap";
import { LegalHero, RegionGrid, Tabs, Disclaimer } from "@/components/legal/LegalUI";
import { HelpBox } from "@/components/legal/HelpBox";
import { NextSteps } from "@/components/layout/NextSteps";

export const metadata = pageMetadata(
  "Is online gambling legal in your country? World map",
  "Click any country to see whether online casinos and sports betting are legal there, who regulates them, the minimum age and which casinos restrict players from it. Every status comes from the regulator's own pages.",
  "/legal"
);

export default function Page() {
  const covered = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
  const info = countryHoverInfo(WORLD_SHAPES);
  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gambling laws", path: "/legal" }])} />
      <LegalHero crumbs={[{ label: "Home", href: "/" }, { label: "Gambling laws" }]} eyebrow="Gambling laws" title="Is online gambling legal where you live?">
        <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
          Click a country to see whether online casinos and sports betting are legal there, who licenses them and the minimum age. For the United States, switch to the state map. Every status is taken from the regulator&apos;s or government&apos;s own pages.
        </p>
      </LegalHero>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 80px" }}>
        <Tabs active="world" />
        <div style={{ padding: 18, borderRadius: 20, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
          <MapHover info={info}>
          <LegalMap shapes={WORLD_SHAPES} viewBox="0 0 960 470" statusOf={(c) => (c === "US" ? "varies by state" : countryBy(c)?.onlineCasino)} hrefOf={(c) => (c === "US" ? "/legal/us" : countryBy(c) ? `/legal/${c.toLowerCase()}` : null)} />
          </MapHover>
        </div>
        {covered.length > 0 && (
          <>
            <h2 style={{ margin: "36px 0 14px", fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>All countries covered</h2>
            <RegionGrid items={covered.map((c) => ({ href: `/legal/${c.code.toLowerCase()}`, name: c.name, status: c.onlineCasino }))} />
          </>
        )}
        <HelpBox />
        <Disclaimer />
        <NextSteps
          steps={[
            { href: "/legal/us", label: "US state by state", hint: "All 50 states and DC, including where sweepstakes are banned." },
            { href: "/legal/europe", label: "Europe in detail", hint: "The European map at a scale where the smaller markets are clickable." },
            { href: "/crypto-casinos", label: "Casinos by country", hint: "Which operators accept players where you live, from their own terms." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "Each status links to the regulator or government page behind it." },
          ]}
        />
      </section>
    </main>
  );
}
