import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { US_STATES, US_SHAPES, stateBy, toneOf, TONE, sweepsAvailableIn } from "@/lib/legal";
import { MapHover, type HoverInfo } from "@/components/legal/MapHover";
import { logoFor } from "@/lib/logo";
import { LegalMap } from "@/components/legal/LegalMap";
import { LegalHero, RegionGrid, Tabs, Disclaimer } from "@/components/legal/LegalUI";
import { HelpBox } from "@/components/legal/HelpBox";
import { NextSteps } from "@/components/layout/NextSteps";

export const metadata = pageMetadata(
  "Online casino & sports betting laws by US state: map",
  "Click any state to see whether real-money online casinos, sports betting, online poker and sweepstakes casinos are legal there, who regulates them and which casinos are licensed. Sourced from each state regulator.",
  "/legal/us"
);

const LAYERS = [
  { key: "casino", label: "Online casinos", field: "onlineCasino" },
  { key: "sports", label: "Sports betting", field: "sportsBetting" },
  { key: "sweeps", label: "Sweepstakes casinos", field: "sweepstakes" },
] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ layer?: string }> }) {
  const { layer: lk } = await searchParams;
  const layer = LAYERS.find((l) => l.key === lk) ?? LAYERS[0];
  const states = [...US_STATES].sort((a, b) => a.name.localeCompare(b.name));
  const legalCasino = states.filter((s) => toneOf(s.onlineCasino) === "legal").length;
  const onlineSports = states.filter((s) => /online/i.test(s.sportsBetting)).length;
  const row = (label: string, v?: string) => ({ label, value: v ?? "Not covered", color: TONE[toneOf(v)].fill });
  const info: Record<string, HoverInfo> = Object.fromEntries(
    states.map((s) => {
      const banned = toneOf(s.sweepstakes) === "banned";
      const open = banned ? [] : sweepsAvailableIn(s.name, s.code).filter((x) => x.known && !x.excluded);
      return [
        s.code,
        {
          name: s.name,
          rows: [row("Online casinos", s.onlineCasino), row("Sports betting", s.sportsBetting), row("Online poker", s.pokerOnline), row("Sweepstakes", s.sweepstakes)],
          casinosTitle: `Sweepstakes casinos available (${open.length})`,
          casinos: open.map((x) => ({ name: x.s.name, logo: logoFor(x.s.slug) })),
          casinosNote: banned ? `Sweepstakes casinos are banned in ${s.name}` : "None of our listed casinos accept this state",
        },
      ];
    })
  );
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {LAYERS.map((l) => (
            <Link key={l.key} href={l.key === "casino" ? "/legal/us" : `/legal/us?layer=${l.key}`} scroll={false} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${l.key === layer.key ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.1)"}`, background: l.key === layer.key ? "rgba(0,194,204,.12)" : "transparent", fontSize: 13, fontWeight: 700, color: l.key === layer.key ? "#5FE3E8" : "#A8B6BE" }}>
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ padding: 18, borderRadius: 20, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
          <MapHover info={info}>
          <LegalMap shapes={US_SHAPES} viewBox="0 0 975 610" labels statusOf={(c) => stateBy(c)?.[layer.field]} hrefOf={(c) => (stateBy(c) ? `/legal/us/${c.toLowerCase()}` : null)} />
          </MapHover>
          <div style={{ marginTop: 8, fontSize: 12.5, color: "#6E7F88" }}>Colours show {layer.label.toLowerCase()} status. Open a state for the full picture: online casinos, sports betting, poker and sweepstakes.</div>
        </div>
        {states.length > 0 && (
          <>
            <h2 style={{ margin: "36px 0 14px", fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>All states</h2>
            <RegionGrid items={states.map((s) => ({ href: `/legal/us/${s.code.toLowerCase()}`, name: s.name, status: s.onlineCasino }))} />
          </>
        )}
        <HelpBox />
        <Disclaimer />
        <NextSteps
          steps={[
            { href: "/sweepstakes-casinos", label: "US sweepstakes casinos", hint: "The legal route in most states, with each casino's exclusions." },
            { href: "/legal", label: "Gambling laws worldwide", hint: "The same breakdown for 45 countries outside the US." },
            { href: "/crypto-casinos", label: "Crypto casinos", hint: "Most restrict US players — each list is cited on its report." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "Each status links to the regulator or statute behind it." },
          ]}
        />
      </section>
    </main>
  );
}
