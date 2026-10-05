import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { NextSteps } from "@/components/layout/NextSteps";
import { flagSrc } from "@/lib/flags";
import { countryBy } from "@/lib/legal";
import { countryPages } from "@/lib/landing";
import { availabilityOf, statusIn, venueCta, venueHref, venuesInOrder, type PredictionTab } from "@/lib/prediction-markets";
import { statusLabel, VenueStatusPill } from "@/components/prediction-markets/VenueStatusPill";

/**
 * Prediction markets for one country: each venue's own answer for it, crypto
 * and regulated in separate lists, each status from the venue's own
 * restricted list or eligibility page.
 */
const MONO = "var(--font-jetbrains-mono), monospace";

function host(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

function VenueRows({ tab, code }: { tab: PredictionTab; code: string }) {
  const rows = venuesInOrder(tab).map((v) => ({ v, s: statusIn(v.slug, code), a: availabilityOf(v.slug) }));
  const rank = (k: string) => ["open", "regions", "check", "unclear", "close-only", "blocked", "not-offered"].indexOf(k);
  rows.sort((x, y) => rank(x.s.kind) - rank(y.s.kind));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map(({ v, s, a }) => {
        const usable = s.kind === "open" || s.kind === "regions";
        const cta = venueCta(v);
        const { detail } = statusLabel(s);
        return (
          <div key={v.slug} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "14px 16px", borderRadius: 13, background: "#0C1013", border: `1px solid ${usable ? "rgba(123,224,184,.22)" : "rgba(255,255,255,.07)"}`, opacity: usable ? 1 : 0.86 }}>
            <Link href={venueHref(v.slug)} style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "1 1 240px" }}>
              <span style={{ width: 38, height: 38, flex: "none", borderRadius: 10, overflow: "hidden" }}>
                <BrandMark slug={v.slug} mono={v.name.slice(0, 2).toUpperCase()} tint={v.tint} radius={10} fontSize={11} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: "#fff" }}>{v.name}</span>
                <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, color: "#83919A" }}>{v.settle}</span>
              </span>
            </Link>
            <span style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start", flex: "1 1 220px", minWidth: 0 }}>
              <VenueStatusPill s={s} />
              {(detail || s.kind === "check") && (
                <span style={{ fontSize: 12, lineHeight: 1.45, color: "#8DA0AA" }}>
                  {detail ?? (a?.mode === "broker" ? "Depends on the broker you trade through." : "Set by the venue's member agreement.")}
                </span>
              )}
              {a && (
                <a href={a.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                  {host(a.url)} ↗
                </a>
              )}
            </span>
            {usable || s.kind === "check" ? (
              <a href={cta.href} target="_blank" rel={cta.sponsored ? "noopener sponsored nofollow" : "noopener noreferrer nofollow"} style={{ padding: "8px 14px", borderRadius: 9, background: cta.sponsored ? "#FFC531" : "rgba(0,194,204,.12)", border: cta.sponsored ? "none" : "1px solid rgba(0,194,204,.35)", fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: cta.sponsored ? "#0E1316" : "#5FE3E8", whiteSpace: "nowrap" }}>
                Visit ↗
              </a>
            ) : (
              <Link href={venueHref(v.slug)} style={{ fontFamily: MONO, fontSize: 11.5, color: "#83919A", whiteSpace: "nowrap" }}>
                Details →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PredCountryPage({ code, name }: { code: string; name: string }) {
  const flag = flagSrc(code);
  const crypto = venuesInOrder("crypto");
  const open = crypto.filter((v) => ["open", "regions"].includes(statusIn(v.slug, code).kind)).length;
  const fiatOpen = venuesInOrder("fiat").filter((v) => statusIn(v.slug, code).kind === "open").length;
  const law = countryBy(code);
  const hasCryptoCasinoPage = countryPages().some((p) => p.c.code === code);

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(0,194,204,.08), transparent 55%), #0A0D10" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 34px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/prediction-markets" style={{ color: "#83919A" }}>Prediction markets</Link> / <span style={{ color: "#A8B6BE" }}>{name}</span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            {flag && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={flag} alt="" width={56} height={42} style={{ width: 56, height: 42, borderRadius: 7, objectFit: "cover", border: "1px solid rgba(255,255,255,.12)" }} />
            )}
            <h1 style={{ margin: 0, fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
              Prediction markets in {name}
            </h1>
          </div>
          <p style={{ margin: 0, maxWidth: "72ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
            {open} of {crypto.length} crypto-settled venues leave {name} off their restricted lists
            {fiatOpen > 0 ? `, and ${fiatOpen} regulated US-dollar ${fiatOpen === 1 ? "venue serves" : "venues serve"} it` : ""}. Each answer below is the venue&rsquo;s own, linked
            to the page it comes from.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 24px 70px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 24, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Crypto-settled</h2>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: "#8DA0AA" }}>Stablecoin balances, wallet or email login.</p>
        <VenueRows tab="crypto" code={code} />

        <h2 style={{ margin: "34px 0 4px", fontSize: 24, letterSpacing: "-.025em", fontWeight: 800, color: "#fff" }}>Regulated, in US dollars</h2>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: "#8DA0AA" }}>CFTC-overseen exchanges with full identity checks.</p>
        <VenueRows tab="fiat" code={code} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 30 }}>
          {law && (
            <Link href={`/legal/${code.toLowerCase()}`} style={{ display: "block", padding: "18px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 6 }}>The law</div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Gambling law in {name}</div>
              <div style={{ fontSize: 13, color: "#8DA0AA" }}>A venue leaving {name} off its list is not the same as the law allowing it. →</div>
            </Link>
          )}
          {hasCryptoCasinoPage && (
            <Link href={`/crypto-casinos/in/${code.toLowerCase()}`} style={{ display: "block", padding: "18px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(0,194,204,.25)" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 6 }}>Crypto casinos</div>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Crypto casinos that accept {name}</div>
              <div style={{ fontSize: 13, color: "#8DA0AA" }}>Several run their own prediction markets too. →</div>
            </Link>
          )}
        </div>

        <NextSteps
          steps={[
            { href: "/prediction-markets", label: "Crypto prediction markets", hint: "The crypto-settled venues side by side." },
            { href: "/prediction-markets/regulated", label: "Regulated prediction markets", hint: "US-dollar venues the CFTC oversees." },
            { href: "/sportsbooks", label: "Crypto sportsbooks", hint: "Fixed odds instead of traded contracts." },
          ]}
        />
      </div>
    </main>
  );
}
