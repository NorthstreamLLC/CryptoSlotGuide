import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { US_STATES, stateBy, sweepsAvailableIn, toneOf } from "@/lib/legal";
import { LegalHero, StatusTile, Sources, Disclaimer, MONO } from "@/components/legal/LegalUI";
import { HelpBox } from "@/components/legal/HelpBox";
import { BrandMark } from "@/components/ui/BrandMark";
import { brandFor } from "@/lib/casino-facts";

export function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const s = stateBy(state);
  if (!s) return {};
  return pageMetadata(`Online casinos in ${s.name}: is it legal?`, `${s.name} online casino, sports betting, poker and sweepstakes law, the regulator, licensed casinos and which sweepstakes casinos you can play, from ${s.name}'s own regulator.`, `/legal/us/${state}`);
}

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const s = stateBy(state);
  if (!s) notFound();
  const sweeps = sweepsAvailableIn(s.name, s.code);
  const open = sweeps.filter((x) => x.known && !x.excluded);
  const closed = sweeps.filter((x) => x.excluded);
  const sweepsBanned = toneOf(s.sweepstakes) === "banned";

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gambling laws", path: "/legal" }, { name: "United States", path: "/legal/us" }, { name: s.name, path: `/legal/us/${state}` }])} />
      <LegalHero crumbs={[{ label: "Home", href: "/" }, { label: "Gambling laws", href: "/legal" }, { label: "United States", href: "/legal/us" }, { label: s.name }]} eyebrow={`${s.name} gambling law`} title={`Online casinos in ${s.name}: is it legal?`}>
        {s.note && <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>{s.note}</p>}
      </LegalHero>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 22 }}>
          <StatusTile label="Online casinos" status={s.onlineCasino} />
          <StatusTile label="Sports betting" status={s.sportsBetting} />
          <StatusTile label="Online poker" status={s.pokerOnline} />
          <StatusTile label="Sweepstakes casinos" status={s.sweepstakes} />
        </div>

        <div style={{ padding: "8px 24px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          {([
            ["Regulator", s.regulator?.name, s.regulator?.url],
            ["Minimum age", s.minAge],
            ["Sweepstakes law", s.sweepstakesDetail],
            ["Licensed online casinos", s.licensedOnlineCasinos?.join(", "), s.licensedListUrl],
          ] as [string, string | undefined, string | undefined][])
            .filter(([, v]) => v)
            .map(([k, v, url], i) => (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "minmax(120px, 190px) 1fr", gap: 14, padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#6E7F88", paddingTop: 2 }}>{k}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "#C6D1D7" }}>
                  {v} {url && <a href={url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>source ↗</a>}
                </div>
              </div>
            ))}
        </div>

        {sweepsBanned && (
          <div style={{ marginTop: 28, padding: "18px 22px", borderRadius: 16, background: "rgba(196,101,58,.08)", border: "1px solid rgba(196,101,58,.35)", fontSize: 15, lineHeight: 1.6, color: "#E8EDF0" }}>
            <strong>Sweepstakes casinos are banned in {s.name}.</strong> {s.sweepstakesDetail ?? "See the sources below."}
          </div>
        )}
        {!sweepsBanned && (open.length > 0 || closed.length > 0) && (
          <>
            <h2 style={{ margin: "34px 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Sweepstakes casinos in {s.name}</h2>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "#8DA0AA" }}>Based on each casino&apos;s own restricted-states list.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {[...open.map((x) => ({ ...x, ok: true })), ...closed.map((x) => ({ ...x, ok: false }))].map(({ s: c, ok }) => (
                <Link key={c.slug} href={`/sweepstakes-casinos/${c.slug}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#0C1013", border: `1px solid ${ok ? "rgba(47,182,122,.35)" : "rgba(196,101,58,.3)"}`, fontSize: 14, fontWeight: 700, color: ok ? "#E8EDF0" : "#7B8A93" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: 7, overflow: "hidden", opacity: ok ? 1 : 0.5 }}>
                    <BrandMark slug={c.slug} mono={c.name.slice(0, 2).toUpperCase()} tint={brandFor(c.slug)} radius={7} fontSize={9} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    {c.name}
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, fontWeight: 600, color: ok ? "#7BE0B8" : "#DA9877" }}>{ok ? "Available" : "Not available"}</span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        <Sources sources={s.sources} />
        <HelpBox />
        <Disclaimer />
        <p style={{ margin: "18px 0 0" }}>
          <Link href="/legal/us" style={{ fontSize: 14, fontWeight: 700, color: "#00C2CC" }}>← Back to the US map</Link>
        </p>
      </section>
    </main>
  );
}
