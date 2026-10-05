import Link from "next/link";
import { NextSteps } from "@/components/layout/NextSteps";
import { ReportIssue } from "@/components/ui/ReportIssue";
import { FiatBrandGrid } from "@/components/fiat/FiatBrandGrid";
import { casinosForCountry } from "@/lib/landing";
import type { FiatMarket, FiatProduct } from "@/lib/fiat";

/**
 * One market's licensed sites: every web address its regulator lists, with
 * the site's own icon, the licence holder and a link out — the fiat
 * counterpart to /crypto-casinos/in/[country], and kept separate from it.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const FILTERS: { key: FiatProduct | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "casino", label: "Casinos" },
  { key: "sports", label: "Sportsbooks" },
];

export function FiatMarketPage({ m, type }: { m: FiatMarket; type: FiatProduct | "all" }) {
  const casinos = m.brands.filter((s) => s.products.includes("casino")).length;
  const sports = m.brands.filter((s) => s.products.includes("sports")).length;
  const split = casinos + sports > 0;
  const shown = type === "all" ? m.brands : m.brands.filter((s) => s.products.includes(type));
  const withLogo = m.brands.filter((s) => s.logo).length;
  const crypto = casinosForCountry(m.code.split("-")[0]);
  const lawCode = m.code === "CA-ON" ? "ca-on" : m.code.split("-")[0].toLowerCase();

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(95,227,232,.08), transparent 55%), #0A0D10" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 24px 34px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/licensed-casinos" style={{ color: "#83919A" }}>Licensed casinos</Link> /{" "}
            <span style={{ color: "#A8B6BE" }}>{m.name}</span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            {m.flag && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.flag} alt="" width={56} height={42} style={{ width: 56, height: 42, borderRadius: 7, objectFit: "cover", border: "1px solid rgba(255,255,255,.12)" }} />
            )}
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#5FE3E8", marginBottom: 4 }}>Licensed in {m.name} · fiat</div>
              <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
                Licensed online casinos and sportsbooks in {m.name}
              </h1>
            </div>
          </div>
          <p style={{ margin: "0 0 18px", maxWidth: "70ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
            Every brand {m.regulator} licenses — {m.brands.length} brands across the {m.sites.length} web addresses on its register — with the company holding
            each licence and a link to the site. Search for a name below. These are the locally licensed options; crypto casinos are listed separately.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              [String(m.brands.length), "licensed brands"],
              ...(split ? [[String(casinos), "licensed for casino"], [String(sports), "licensed for sports betting"]] : []),
            ].map(([v, l]) => (
              <span key={l} style={{ display: "inline-flex", alignItems: "baseline", gap: 8, padding: "8px 13px", borderRadius: 100, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", fontSize: 13.5, color: "#A8B6BE" }}>
                <strong style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{v}</strong>
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 24px 70px" }}>
        {split && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {FILTERS.map((f) => {
              const on = f.key === type;
              const n = f.key === "all" ? m.brands.length : f.key === "casino" ? casinos : sports;
              return (
                <Link
                  key={f.key}
                  href={f.key === "all" ? `/licensed-casinos/${m.slug}` : `/licensed-casinos/${m.slug}?type=${f.key}`}
                  style={{ padding: "8px 14px", borderRadius: 100, border: `1px solid ${on ? "rgba(0,194,204,.5)" : "rgba(255,255,255,.12)"}`, background: on ? "rgba(0,194,204,.12)" : "transparent", fontFamily: MONO, fontSize: 11.5, color: on ? "#5FE3E8" : "#A8B6BE" }}
                >
                  {f.label} <span style={{ opacity: 0.6 }}>{n}</span>
                </Link>
              );
            })}
          </div>
        )}

        <FiatBrandGrid brands={shown} marketName={m.name} />

        <p style={{ margin: "14px 0 0", maxWidth: "88ch", fontSize: 12.5, lineHeight: 1.6, color: "#77858E" }}>
          Read from {m.regulator}&rsquo;s register
          {m.sources.map((s, i) => (
            <span key={s.url}>
              {i ? " and " : " "}
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>
                ({new URL(s.url).hostname.replace(/^www\./, "")}, {s.asOf})
              </a>
            </span>
          ))}
          . Names and logos are each site&rsquo;s own, from its home page ({withLogo} of {m.brands.length} brands have a logo); a site whose pages would not give one shows its initials.
          {m.holdersWithoutSite.length > 0 && <> The register also lists {m.holdersWithoutSite.length} licence {m.holdersWithoutSite.length === 1 ? "holder" : "holders"} without a web address.</>}
        </p>

        <section style={{ marginTop: 34, padding: "20px 24px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>How it works in {m.name}</div>
          <p style={{ margin: 0, maxWidth: "82ch", fontSize: 14.5, lineHeight: 1.7, color: "#C6D1D7", textWrap: "pretty" }}>{m.why}</p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 14 }}>
          <Link href={`/crypto-casinos/in/${m.code.split("-")[0].toLowerCase()}`} style={{ display: "block", padding: "18px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(0,194,204,.25)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 6 }}>Crypto casinos instead</div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{crypto.accepts?.length ?? 0} crypto casinos accept players from {m.code === "CA-ON" ? "Canada" : m.name}</div>
            <div style={{ fontSize: 13, color: "#8DA0AA" }}>Not licensed here; each states its own restricted list. →</div>
          </Link>
          <Link href={`/legal/${lawCode}`} style={{ display: "block", padding: "18px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 6 }}>The law</div>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Is online gambling legal in {m.name}?</div>
            <div style={{ fontSize: 13, color: "#8DA0AA" }}>The regulator, the minimum age and what the law allows. →</div>
          </Link>
        </div>

        <ReportIssue subject={`Licensed sites in ${m.name}`} />
        <NextSteps
          steps={[
            { href: "/licensed-casinos", label: "Every licensed market", hint: "Licensed casinos and sportsbooks, country by country." },
            { href: "/us-casinos", label: "US-regulated casinos", hint: "The brands each US state licenses." },
            { href: "/crypto-casinos", label: "Crypto casinos", hint: "The crypto side, with each casino's restricted countries." },
          ]}
        />
      </div>
    </main>
  );
}
