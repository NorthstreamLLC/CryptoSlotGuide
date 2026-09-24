import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { EUROPE_SHAPES, countryBy, casinosByAccess } from "@/lib/legal";
import { countryHoverInfo } from "@/lib/legal-hover";
import { LegalMap } from "@/components/legal/LegalMap";
import { MapHover } from "@/components/legal/MapHover";
import { LegalHero, RegionGrid, Tabs, Disclaimer } from "@/components/legal/LegalUI";
import { HelpBox } from "@/components/legal/HelpBox";
import { NextSteps } from "@/components/layout/NextSteps";

export const metadata = pageMetadata(
  "Online gambling in Europe: laws and crypto casinos by country",
  "Click any European country to see whether online casinos are licensed there and which crypto casinos accept its players, from each regulator's and each casino's own pages.",
  "/legal/europe"
);

const LAYERS = [
  { key: "law", label: "Gambling law" },
  { key: "casinos", label: "Crypto casinos that accept players" },
] as const;

/** Shade by how many of our crypto casinos accept a country. */
const SHADES = [
  { min: 20, color: "#2FB67A", label: "20+ casinos" },
  { min: 12, color: "#57C98F", label: "12–19" },
  { min: 6, color: "#8FD9A8", label: "6–11" },
  { min: 1, color: "#C7A45C", label: "1–5" },
  { min: 0, color: "#C4653A", label: "None" },
];

export default async function Page({ searchParams }: { searchParams: Promise<{ layer?: string }> }) {
  const { layer: lk } = await searchParams;
  const layer = LAYERS.find((l) => l.key === lk) ?? LAYERS[0];
  const info = countryHoverInfo(EUROPE_SHAPES);
  const covered = EUROPE_SHAPES.map((s) => (s.code ? countryBy(s.code) : null)).filter(Boolean).sort((a, b) => a!.name.localeCompare(b!.name));
  const count = (code: string) => casinosByAccess(code).accepts.length;

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gambling laws", path: "/legal" }, { name: "Europe", path: "/legal/europe" }])} />
      <LegalHero crumbs={[{ label: "Home", href: "/" }, { label: "Gambling laws", href: "/legal" }, { label: "Europe" }]} eyebrow="Europe" title="Online gambling in Europe, country by country">
        <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
          Hover or tap a country to see whether online casinos are licensed there and which crypto casinos accept its players. Switch the layer to shade the map by how many casinos take players from each country.
        </p>
      </LegalHero>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 24px 80px" }}>
        <Tabs active="europe" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {LAYERS.map((l) => (
            <Link key={l.key} href={l.key === "law" ? "/legal/europe" : `/legal/europe?layer=${l.key}`} scroll={false} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${l.key === layer.key ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.1)"}`, background: l.key === layer.key ? "rgba(0,194,204,.12)" : "transparent", fontSize: 13, fontWeight: 700, color: l.key === layer.key ? "#5FE3E8" : "#A8B6BE" }}>
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ padding: 18, borderRadius: 20, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
          <MapHover info={info}>
            <LegalMap
              shapes={EUROPE_SHAPES}
              viewBox="0 0 960 680"
              statusOf={(c) => countryBy(c)?.onlineCasino}
              hrefOf={(c) => (countryBy(c) ? `/legal/${c.toLowerCase()}` : null)}
              fillOf={layer.key === "casinos" ? (c) => SHADES.find((s) => count(c) >= s.min)?.color : undefined}
              legend={layer.key === "casinos" ? SHADES.map((s) => ({ color: s.color, label: s.label })) : undefined}
            />
          </MapHover>
        </div>
        {covered.length > 0 && (
          <>
            <h2 style={{ margin: "36px 0 14px", fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>European countries</h2>
            <RegionGrid items={covered.map((c) => ({ href: `/legal/${c!.code.toLowerCase()}`, name: c!.name, status: c!.onlineCasino }))} />
          </>
        )}
        <HelpBox />
        <Disclaimer />
        <NextSteps
          steps={[
            { href: "/legal", label: "The world map", hint: "Every country we cover, coloured by what its regulator allows." },
            { href: "/legal/us", label: "US state by state", hint: "All 50 states and DC, including the sweepstakes position." },
            { href: "/crypto-casinos", label: "Crypto casinos", hint: "Which operators accept players where you live." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "Each status links to the regulator page behind it." },
          ]}
        />
      </section>
    </main>
  );
}
