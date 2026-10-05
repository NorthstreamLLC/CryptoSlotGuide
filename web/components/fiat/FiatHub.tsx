import Link from "next/link";
import { NextSteps } from "@/components/layout/NextSteps";
import { BrandMark } from "@/components/ui/BrandMark";
import { tintFor } from "@/lib/logo";
import { fiatMarkets, fiatHref, EUROPE_FIAT, type FiatMarket } from "@/lib/fiat";
import { rankedBrands } from "@/lib/us-brands";
import { sweepsSorted } from "@/lib/sweeps";
import { flagSrc } from "@/lib/flags";
import world from "@/data/world-market.json";

/**
 * /licensed-casinos: the fiat side of the site, region by region. Kept apart
 * from the crypto pages on purpose — a reader looking for a locally licensed
 * casino and one looking for a crypto casino want different lists, and the
 * menu used to mix them without saying which was which.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

function LogoStrip({ m }: { m: FiatMarket }) {
  const logos = m.brands.filter((s) => s.logo).slice(0, 6);
  if (!logos.length) return null;
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
      {logos.map((s) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s.id} src={s.logo as string} alt="" width={30} height={30} loading="lazy" style={{ width: 30, height: 30, borderRadius: 8, background: "#EEF1F3", objectFit: "contain", padding: 3 }} />
      ))}
    </div>
  );
}

function MarketCard({ m }: { m: FiatMarket }) {
  return (
    <Link href={fiatHref(m.code)} data-reveal className="csg-lift" style={{ display: "block", padding: "16px 18px", borderRadius: 15, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        {m.flag && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.flag} alt="" width={34} height={25} style={{ width: 34, height: 25, borderRadius: 4, objectFit: "cover", border: "1px solid rgba(255,255,255,.12)" }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{m.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#83919A" }}>{m.brands.length} licensed brands</div>
        </div>
      </div>
      <LogoStrip m={m} />
    </Link>
  );
}

function RegionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ margin: "34px 0 14px" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, letterSpacing: "-.022em", color: "#fff" }}>{title}</h2>
      <p style={{ margin: 0, maxWidth: "76ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>{sub}</p>
    </div>
  );
}

export function FiatHub() {
  const markets = fiatMarkets();
  const byCode = new Map(markets.map((m) => [m.code, m]));
  const europe = EUROPE_FIAT.map((c) => byCode.get(c)).filter((m): m is FiatMarket => !!m);
  const ontario = byCode.get("CA-ON");
  const argentina = byCode.get("AR");
  const us = rankedBrands();
  const sweeps = sweepsSorted();
  const gb = byCode.get("GB");
  const unreadable = Object.entries((world as unknown as { unreadable: Record<string, { regulator: string; sourceUrl: string; note: string }> }).unreadable);
  const total = markets.reduce((n, m) => n + m.brands.length, 0);

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(95,227,232,.08), transparent 55%), #0A0D10" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <span style={{ color: "#A8B6BE" }}>Licensed casinos</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#5FE3E8", marginBottom: 10 }}>Licensed · fiat</div>
          <h1 style={{ margin: "0 0 12px", maxWidth: "22ch", fontSize: "clamp(34px, 4.6vw, 54px)", lineHeight: 1.03, letterSpacing: "-.036em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
            Licensed casinos and sportsbooks, country by country
          </h1>
          <p style={{ margin: 0, maxWidth: "66ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
            The brands each country&rsquo;s own regulator licenses — {total.toLocaleString("en-GB")} across {markets.length} registers, plus the US states —
            each with its logo and a link to the site. For crypto casinos, see{" "}
            <Link href="/crypto-casinos" style={{ color: "#5FE3E8" }}>crypto casinos by country</Link>.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "8px 24px 70px" }}>
        <RegionHeading title="North America" sub="US states license their own casinos and sportsbooks; sweepstakes casinos run under a different model; Ontario is Canada's one open market." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          <Link href="/us-casinos" className="csg-lift" style={{ display: "block", padding: "16px 18px", borderRadius: 15, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagSrc("US") ?? ""} alt="" width={34} height={25} style={{ width: 34, height: 25, borderRadius: 4, objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>US-regulated</div>
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#83919A" }}>{us.length} brands across the legal states</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              {us.slice(0, 6).map(({ brand }) => (
                <span key={brand.slug} style={{ width: 30, height: 30 }}>
                  <BrandMark slug={brand.slug} mono={brand.name.slice(0, 2)} tint={tintFor(brand.slug)} radius={8} fontSize={9} />
                </span>
              ))}
            </div>
          </Link>
          <Link href="/sweepstakes-casinos" className="csg-lift" style={{ display: "block", padding: "16px 18px", borderRadius: 15, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagSrc("US") ?? ""} alt="" width={34} height={25} style={{ width: 34, height: 25, borderRadius: 4, objectFit: "cover" }} />
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>US sweepstakes</div>
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#83919A" }}>{sweeps.length} sweepstakes casinos</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              {sweeps.slice(0, 6).map((s) => (
                <span key={s.slug} style={{ width: 30, height: 30 }}>
                  <BrandMark slug={s.slug} mono={s.name.slice(0, 2)} tint={tintFor(s.slug)} radius={8} fontSize={9} />
                </span>
              ))}
            </div>
          </Link>
          {ontario && <MarketCard m={ontario} />}
        </div>

        {gb && (
          <>
            <RegionHeading title="United Kingdom" sub="Every site on the Gambling Commission's register held by an operator with a remote casino or betting licence." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              <MarketCard m={gb} />
            </div>
          </>
        )}

        <RegionHeading title="Europe" sub="Each country's licensed sites, read from its regulator's own register." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {europe.map((m) => (
            <MarketCard key={m.code} m={m} />
          ))}
        </div>

        {argentina && (
          <>
            <RegionHeading title="Latin America" sub="Argentina licenses province by province; Buenos Aires province publishes its list." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              <MarketCard m={argentina} />
            </div>
          </>
        )}

        {unreadable.length > 0 && (
          <>
            <RegionHeading title="Registers we can't list" sub="These regulators publish no list a reader can be given — a search tool, a monopoly, or no licences issued yet. Each links to where to check." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {unreadable.map(([code, u]) => (
                <div key={code} style={{ padding: "14px 16px", borderRadius: 13, background: "#0C1013", border: "1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                    {flagSrc(code) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={flagSrc(code) as string} alt="" width={24} height={18} style={{ width: 24, height: 18, borderRadius: 3, objectFit: "cover" }} />
                    )}
                    <Link href={`/legal/${code.toLowerCase()}`} style={{ fontSize: 14, fontWeight: 700, color: "#E8EDF0" }}>{u.regulator}</Link>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "#8DA0AA" }}>{u.note}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <NextSteps
          steps={[
            { href: "/crypto-casinos", label: "Crypto casinos", hint: "The crypto side: who accepts you, with each casino's restricted list." },
            { href: "/legal", label: "Gambling law, every country", hint: "What each country's own regulator allows." },
            { href: "/us-casinos", label: "US state by state", hint: "Which brands each US state licenses." },
          ]}
        />
      </div>
    </main>
  );
}
