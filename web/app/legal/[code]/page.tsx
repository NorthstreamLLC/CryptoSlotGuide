import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { COUNTRIES, countryBy } from "@/lib/legal";
import { CasinoAccess } from "@/components/legal/CasinoAccess";
import { LegalHero, StatusTile, Sources, Disclaimer, MONO } from "@/components/legal/LegalUI";

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

        <Sources sources={c.sources} />
        <Disclaimer />
        <p style={{ margin: "18px 0 0" }}>
          <Link href="/legal" style={{ fontSize: 14, fontWeight: 700, color: "#00C2CC" }}>← Back to the world map</Link>
        </p>
      </section>
    </main>
  );
}
