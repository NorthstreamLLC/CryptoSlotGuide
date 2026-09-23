import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SWEEPS, sweepsBySlug, sweepsFact, tileValue, type SweepsFact } from "@/lib/sweeps";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon, type IconName } from "@/components/ui/Icon";
import { NextSteps } from "@/components/layout/NextSteps";
import { StickyOffer } from "@/components/casino/StickyOffer";

const MONO = "var(--font-jetbrains-mono), monospace";
const GREEN = "#57E39A";

export function generateStaticParams() {
  return SWEEPS.filter((s) => s.facts.length).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = sweepsBySlug(slug);
  if (!s) return {};
  return pageMetadata(`${s.name}: ${s.offer}`, `${s.name} sweepstakes casino: welcome offer, daily bonus, minimum redemption, payout time, crypto purchases and excluded states, each from ${s.domain}'s own rules.`, `/sweepstakes-casinos/${slug}`);
}

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function Source({ f }: { f: SweepsFact }) {
  return (
    <a href={f.url} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8", whiteSpace: "nowrap" }}>
      {host(f.url)} ↗
    </a>
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = sweepsBySlug(slug);
  if (!s || !s.facts.length) notFound();
  const brand = brandFor(s.slug);
  const F = (l: string) => sweepsFact(s, l);

  const tiles: { icon: IconName; label: string; f: SweepsFact | null }[] = [
    { icon: "gift", label: "Daily bonus", f: F("Daily bonus") },
    { icon: "coins", label: "Min. redemption", f: F("Minimum redemption") },
    { icon: "bolt", label: "Redemption time", f: F("Redemption time") },
    { icon: "percent", label: "Playthrough", f: F("Playthrough") },
  ];
  const order = ["Welcome offer", "Promotions", "VIP program", "Purchase methods", "Crypto", "Games", "Restricted states", "Minimum age", "Free entry", "Company"];
  const rows = [...order.map((l) => F(l)).filter(Boolean), ...s.facts.filter((f) => ![...order, ...tiles.map((t) => t.label), "Daily bonus", "Minimum redemption", "Redemption time", "Playthrough"].includes(f.label))] as SweepsFact[];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Sweepstakes casinos", path: "/sweepstakes-casinos" }, { name: s.name, path: `/sweepstakes-casinos/${s.slug}` }])} />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(80% 120% at 85% 0%, ${brand}26, transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(87,227,154,.08), transparent 60%), #0A0D10` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 28 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/sweepstakes-casinos" style={{ color: "#83919A" }}>Sweepstakes casinos</Link> / <span style={{ color: "#A8B6BE" }}>{s.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div style={{ width: 44, height: 44, flex: "none" }}>
              <BrandMark slug={s.slug} mono={s.name.slice(0, 2).toUpperCase()} tint={brand} radius={10} fontSize={13} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{s.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "#8E9CA5" }}>US SWEEPSTAKES CASINO · {s.domain.toUpperCase()}</div>
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GREEN, marginBottom: 10 }}>Welcome offer</div>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(32px, 4.2vw, 50px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>{s.offer}</h1>
          {F("Welcome offer") && <p style={{ margin: "0 0 24px", maxWidth: "62ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE" }}>{F("Welcome offer")!.value}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, margin: "0 0 28px" }}>
            {tiles.filter((t) => tileValue(t.f)).map((t) => (
              <div key={t.label} style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.08)" }}>
                <span style={{ width: 38, height: 38, flex: "none", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${brand}1f`, color: brand }}>
                  <Icon name={t.icon} size={19} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: MONO, fontSize: 9.5, letterSpacing: ".07em", textTransform: "uppercase", color: "#8E9CA5" }}>{t.label}</span>
                  <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{tileValue(t.f)}</span>
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <a href={s.signupUrl ?? `https://${s.domain}`} target="_blank" rel={s.affiliate ? "nofollow sponsored noopener" : "nofollow noopener"} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 26px", borderRadius: 11, background: brand, color: "#0A0D0F", fontSize: 15, fontWeight: 800 }}>
              Claim offer at {s.name} <span aria-hidden>→</span>
            </a>
            {s.promoCode && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 16px", borderRadius: 11, border: `1px dashed ${brand}80`, background: `${brand}12`, fontSize: 13.5, color: "#DCE5E9" }}>
                Use code <strong style={{ fontFamily: MONO, fontSize: 14.5, letterSpacing: ".04em", color: brand }}>{s.promoCode.toUpperCase()}</strong>
              </span>
            )}
          </div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 10.5, color: "#83919A" }}>
            No purchase necessary · 18+ or 21+ by casino · Void where prohibited{s.affiliate ? " · Affiliate link" : ""} · Facts from {s.domain}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Everything you need to know</div>
        <h2 style={{ margin: "0 0 18px", fontSize: 30, lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>{s.name} at a glance</h2>
        <div style={{ padding: "8px 24px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
          {[...tiles.map((t) => t.f).filter(Boolean), ...rows].map((f, i) => (
            <div key={f!.label} style={{ display: "grid", gridTemplateColumns: "minmax(120px, 170px) 1fr", gap: 14, padding: "13px 0", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#8E9CA5", paddingTop: 2 }}>{f!.label}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#C6D1D7" }}>
                {f!.label === "Restricted states" ? (
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {f!.value.replace(/\.$/, "").split(/,\s*|\s+and\s+/).filter(Boolean).map((st) => (
                      <span key={st} style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(196,101,58,.12)", border: "1px solid rgba(196,101,58,.3)", fontSize: 12.5, fontWeight: 600, color: "#DA9877" }}>{st}</span>
                    ))}
                    <Source f={f!} />
                  </span>
                ) : (
                  <>
                    {f!.value} <Source f={f!} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "18px 0 0", fontSize: 13, lineHeight: 1.6, color: "#7B8A93" }}>
          Checked {s.asOf ?? "recently"} against {s.domain}&apos;s own pages. Sweepstakes rules and state lists change; the casino&apos;s current rules always apply.
        </p>

        <StickyOffer
          name={s.name}
          href={s.signupUrl ?? `https://${s.domain}`}
          offer={s.offer}
          note="No purchase necessary"
          brand={brand}
        />

        <NextSteps
          steps={[
            { href: "/sweepstakes-casinos", label: "Compare all sweepstakes casinos", hint: "Coin packages, redemption minimums and excluded states, side by side." },
            { href: "/legal/us", label: "Is it legal in your state?", hint: "All 50 states and DC, with each state's sweepstakes position." },
            { href: "/crypto-casinos", label: "Crypto casinos", hint: "The real-money side: coins, payout times and welcome offers." },
            { href: "/how-we-rate", label: "How we source every fact", hint: "Every line above links to the casino's own rules page." },
          ]}
        />
      </section>
    </main>
  );
}
