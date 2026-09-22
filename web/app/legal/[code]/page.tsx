import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { COUNTRIES, countryBy } from "@/lib/legal";
import { CasinoAccess } from "@/components/legal/CasinoAccess";
import { countryPages } from "@/lib/landing";
import { LegalHero, StatusTile, Sources, Disclaimer, JumpList, MONO } from "@/components/legal/LegalUI";
import { HelpBox } from "@/components/legal/HelpBox";
import { NextSteps } from "@/components/layout/NextSteps";

export function generateStaticParams() {
  return COUNTRIES.filter((c) => c.code !== "US").map((c) => ({ code: c.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = countryBy(code);
  if (!c) return {};
  return pageMetadata(`Is online gambling legal in ${c.name}?`, `${c.name}: online casino and sports betting law, the regulator, minimum age and which crypto casinos restrict players, from ${c.name}'s own regulator and government pages.`, `/legal/${code}`);
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = countryBy(code);
  if (!c) notFound();
  const hasCountryPage = countryPages().some((x) => x.c.code === c.code);

  const rows: [string, string | undefined | null][] = [
    ["Regulator", c.regulator?.name],
    ["Licensing", c.licensing],
    ["Minimum age", c.minAge],
    ["Crypto payments", c.crypto],
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gambling laws", path: "/legal" }, { name: c.name, path: `/legal/${code}` }])} />
      <LegalHero crumbs={[{ label: "Home", href: "/" }, { label: "Gambling laws", href: "/legal" }, { label: c.name }]} eyebrow="Gambling law" title={`Is online gambling legal in ${c.name}?`}>
        {c.note && <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>{c.note}</p>}
      </LegalHero>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 22 }}>
          <StatusTile label="Online casinos" status={c.onlineCasino} />
          <StatusTile label="Sports betting" status={c.sportsBetting} />
        </div>
        <div style={{ padding: "8px 24px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          {rows.filter(([, v]) => v).map(([k, v], i) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "minmax(120px, 170px) 1fr", gap: 14, padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#6E7F88", paddingTop: 2 }}>{k}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#C6D1D7" }}>
                {k === "Regulator" && c.regulator?.url ? <a href={c.regulator.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>{v} ↗</a> : v}
              </div>
            </div>
          ))}
        </div>

        <CasinoAccess code={c.code.split("-")[0]} name={c.name} />
        {hasCountryPage && (
          <Link
            href={`/crypto-casinos/in/${code}`}
            style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 20, padding: "22px 26px", borderRadius: 18, background: "radial-gradient(120% 130% at 100% 0%, rgba(0,194,204,.14), transparent 60%), #0C1013", border: "1px solid rgba(0,194,204,.28)" }}
          >
            <span style={{ maxWidth: "58ch" }}>
              <span style={{ display: "block", fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 5 }}>Compare the best crypto casinos in {c.name}</span>
              <span style={{ display: "block", fontSize: 14.5, lineHeight: 1.6, color: "#A8B6BE" }}>The casinos that accept {c.name} players, with the coins, payout times and welcome offers each one publishes.</span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 20px", borderRadius: 11, background: "#00C2CC", color: "#0A0D0F", fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap" }}>
              See the list <span aria-hidden>→</span>
            </span>
          </Link>
        )}

        <Sources sources={c.sources} />
        <HelpBox />
        <Disclaimer />

        <JumpList
          title="Gambling law in another country"
          items={COUNTRIES.filter((x) => x.code !== "US" && x.code !== c.code).map((x) => ({ label: x.name, href: `/legal/${x.code.toLowerCase()}` }))}
        />

        <NextSteps
          steps={[
            { href: "/legal", label: "The world map", hint: "Every country we cover, coloured by what its own regulator allows." },
            { href: "/legal/us", label: "US state by state", hint: "All 50 states and DC, with each state's sweepstakes position." },
            ...(hasCountryPage ? [{ href: `/crypto-casinos/in/${code}`, label: `Casinos for ${c.name}`, hint: "Filtered to the operators that accept players there." }] : [{ href: "/crypto-casinos", label: "All crypto casinos", hint: "Every casino we track, with its own restricted-country list cited." }]),
            { href: "/how-we-rate", label: "How we source every fact", hint: "Each line above links to the regulator or government page it came from." },
          ]}
        />
      </section>
    </main>
  );
}
