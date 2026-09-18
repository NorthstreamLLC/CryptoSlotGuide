import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { COUNTRIES, countryBy, casinosRestricting, COUNTRY_ALIASES } from "@/lib/legal";
import { LegalHero, StatusTile, Sources, Disclaimer, MONO } from "@/components/legal/LegalUI";
import { BrandMark } from "@/components/ui/BrandMark";
import { brandFor } from "@/lib/casino-facts";
import { siteData } from "@/lib/site-data";

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
  const restricting = casinosRestricting(c.name, COUNTRY_ALIASES[c.code] ?? []);

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

        {restricting.length > 0 && (
          <>
            <h2 style={{ margin: "34px 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Casinos that restrict players from {c.name}</h2>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "#8DA0AA" }}>These casinos name {c.name} in their own restricted-countries list.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {restricting.map((r) => {
                const o = siteData.ops.find((x) => x.slug === r.slug)!;
                return (
                  <Link key={r.slug} href={`/casinos/${r.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#0C1013", border: "1px solid rgba(196,101,58,.3)", fontSize: 14, fontWeight: 700, color: "#E8EDF0" }}>
                    <span style={{ width: 26, height: 26, flex: "none", borderRadius: 7, overflow: "hidden" }}>
                      <BrandMark slug={r.slug} mono={o.mono} tint={brandFor(r.slug)} radius={7} fontSize={9} />
                    </span>
                    {r.name}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <Sources sources={c.sources} />
        <Disclaimer />
        <p style={{ margin: "18px 0 0" }}>
          <Link href="/legal" style={{ fontSize: 14, fontWeight: 700, color: "#00C2CC" }}>← Back to the world map</Link>
        </p>
      </section>
    </main>
  );
}
