import Link from "next/link";
import { COUNTRIES, US_STATES, WORLD_SHAPES, countryBy, toneOf } from "@/lib/legal";
import { countryHoverInfo } from "@/lib/legal-hover";
import { countryPages } from "@/lib/landing";
import { MapHover } from "@/components/legal/MapHover";
import { LegalMap } from "@/components/legal/LegalMap";
import { RegionGrid, Disclaimer } from "@/components/legal/LegalUI";
import { FoldedList } from "@/components/casino-index/FoldedList";
import { YourPlace, type PlaceInfo } from "@/components/legal/YourPlace";
import { flagSrc } from "@/lib/flags";
import { HelpBox } from "@/components/legal/HelpBox";

/**
 * The legal hub in the four-path pattern: the visitor's own country or state
 * first, the world map, the big regions, every country folded (whole in the
 * HTML), help, then one next step.
 */

const MONO = "var(--font-jetbrains-mono), monospace";
const GREEN = "#57E39A";

export function LegalHub() {
  const covered = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
  const info = countryHoverInfo(WORLD_SHAPES);
  const href = (code: string) => (code === "US" ? "/legal/us" : code === "CA" ? "/legal/canada" : `/legal/${code.toLowerCase()}`);
  const countries: Record<string, PlaceInfo> = Object.fromEntries(
    covered.map((c) => [c.code, { name: c.name, casino: c.onlineCasino, sports: c.sportsBetting, minAge: c.minAge, regulator: c.regulator?.name, href: href(c.code), tone: toneOf(c.onlineCasino), flag: flagSrc(c.code) }])
  );
  const states: Record<string, PlaceInfo> = Object.fromEntries(
    US_STATES.map((s) => [s.code, { name: s.name, casino: s.onlineCasino, sports: s.sportsBetting, minAge: s.minAge, regulator: s.regulator?.name, href: `/legal/us/${s.code.toLowerCase()}`, tone: toneOf(s.onlineCasino), flag: flagSrc("US") }])
  );
  const picker = [...covered.map((c) => ({ code: c.code, name: c.name }))];
  const inPages = countryPages().map((x) => x.c.code);

  const regions = [
    { icon: "🇺🇸", label: "United States", sub: "All 50 states and DC, sweepstakes included", href: "/legal/us" },
    { icon: "🇨🇦", label: "Canada", sub: "Province by province", href: "/legal/canada" },
    { icon: "🇪🇺", label: "Europe", sub: "Every European market on one map", href: "/legal/europe" },
    { icon: "🇬🇧", label: "UK-licensed sites", sub: "The Gambling Commission register", href: "/licensed-casinos/gb" },
  ];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      {/* 1. Your country first */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 90% at 85% 0%, rgba(87,227,154,.10), transparent 60%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.08), transparent 60%), #090C0F" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 18 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Gambling laws</span>
          </div>
          <div style={{ display: "grid", gap: 36, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 52px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
                Can you play <span style={{ color: GREEN }}>where you live?</span>
              </h1>
              <p style={{ margin: "0 0 22px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#9AAAB3" }}>
                Whether online casinos and sports betting are legal in your country or state, who regulates them, the minimum age, and which crypto casinos accept you. Every status comes from the regulator&apos;s or government&apos;s own pages.
              </p>
              <a href="#map" style={{ padding: "13px 20px", borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", color: "#fff", fontSize: 15, fontWeight: 700 }}>Explore the world map ↓</a>
            </div>
            <YourPlace countries={countries} states={states} picker={picker} inPages={inPages} />
          </div>
        </div>
      </section>

      {/* 2. The map */}
      <section id="map" style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0", scrollMarginTop: 100 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>The world map</h2>
        <p style={{ margin: "0 0 14px", fontSize: 14.5, color: "#8DA0AA" }}>Hover a country for the summary, click it for the full guide.</p>
        <div style={{ padding: 18, borderRadius: 20, background: "#0B0F12", border: "1px solid rgba(255,255,255,.07)" }}>
          <MapHover info={info}>
            <LegalMap shapes={WORLD_SHAPES} viewBox="0 0 960 470" statusOf={(c) => (c === "US" ? "varies by state" : countryBy(c)?.onlineCasino)} hrefOf={(c) => (c === "US" ? "/legal/us" : c === "CA" ? "/legal/canada" : countryBy(c) ? `/legal/${c.toLowerCase()}` : null)} />
          </MapHover>
        </div>
      </section>

      {/* 3. Big regions, then every country folded */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px 0" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 26, letterSpacing: "-.02em", fontWeight: 800, color: "#fff" }}>Where the rules change by region</h2>
        <div className="csg-regions" data-keep-grid style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          {regions.map((r) => (
            <Link key={r.label} href={r.href} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 16px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.09)" }}>
              <span style={{ fontSize: 26 }} aria-hidden>{r.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{r.label}</span>
              <span style={{ fontSize: 12.5, color: "#A8B6BE" }}>{r.sub}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: GREEN }}>Open →</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <FoldedList hashes={["all-countries"]} summary={<>Show all {covered.length} countries we cover <span aria-hidden>↓</span></>}>
            <RegionGrid items={covered.map((c) => ({ href: href(c.code), name: c.name, status: c.onlineCasino, flag: flagSrc(c.code) }))} />
          </FoldedList>
        </div>
        <HelpBox />
        <div style={{ marginTop: 24 }}>
          <Disclaimer />
        </div>
      </section>

      {/* 4. One next step */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link href="/crypto-casinos" className="csg-lift" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "24px 28px", borderRadius: 18, background: "radial-gradient(80% 140% at 0% 50%, rgba(0,194,204,.14), transparent 60%), #0F1418", border: "1px solid rgba(0,194,204,.3)" }}>
          <span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: "#00C2CC", marginBottom: 6 }}>NEXT STEP</span>
            <span style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#fff" }}>Know where you stand? Find a casino that accepts you.</span>
            <span style={{ display: "block", fontSize: 14.5, color: "#A8B6BE", marginTop: 4 }}>Every casino on our list marks the countries its own terms refuse, before you click.</span>
          </span>
          <span style={{ padding: "13px 20px", borderRadius: 12, background: "#00C2CC", color: "#04201F", fontSize: 15, fontWeight: 800 }}>Compare crypto casinos →</span>
        </Link>
      </section>

      <style>{`@media (max-width: 760px){ .csg-regions{grid-template-columns:1fr 1fr !important} }`}</style>
    </main>
  );
}
