import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import vip from "@/data/vip.json";
import { VipClaim } from "@/components/ui/VipClaim";

const SLUG = "roobet";
const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const REFERRALS = "https://help.roobet.com/en/articles/5017835-referrals-explained";

const op = () => siteData.ops.find((o) => o.slug === SLUG);

export function generateMetadata() {
  const o = op();
  const code = o?.promoCode ?? "ELITE";
  return pageMetadata(
    `Roobet promo code ${code}: welcome package and rewards`,
    `Sign up at Roobet with code ${code} for a 20% deposit match up to $500, then 100 free spins at $10,000 wagered and 500 more at $50,000. How to claim it, and Roobet's standing rewards, from its own pages.`,
    "/promo-codes/roobet"
  );
}

function Fact({ label, group, sub }: { label: string; group: string; sub?: string }) {
  const f = getSpecFact(SLUG, group, label);
  if (!f || typeof f.value !== "string" || !f.sourceUrl) return null;
  return (
    <div style={{ padding: "16px 18px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{sub ?? label}</div>
      <p style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.55, color: "#A8B6BE" }}>{f.value}</p>
      <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
        {new URL(f.sourceUrl).hostname.replace(/^www\./, "")} ↗
      </a>
    </div>
  );
}

export default function Page() {
  const o = op();
  if (!o || !o.promoCode || !o.codePerk || !o.signupUrl) notFound();
  const code = o.promoCode;
  const visit = o.signupUrl;

  const pkg = [
    { t: "20% deposit match", d: "Up to $500 on your deposit" },
    { t: "100 free spins", d: "Once you reach $10,000 wagered" },
    { t: "500 free spins", d: "Once you reach $50,000 wagered" },
  ];
  // Roobet's own rewards article: an affiliate code adds a 72-hour Rakeboost.
  const boost = getSpecFact(SLUG, "Bonus terms", "Rakeback");
  const hasBoost = typeof boost?.value === "string" && /\+20% for 72 hours from an affiliate code/.test(boost.value);

  const faqs = [
    { q: `What is the Roobet promo code?`, a: `${code}. Sign up at Roobet with code ${code}, then message ${vip.name}, the exclusive casino VIP team, on Telegram to claim the welcome package: a 20% deposit match up to $500, 100 free spins once you reach $10,000 wagered, and 500 more once you reach $50,000.` },
    { q: "How do I claim the welcome package?", a: `Only through CasinoPerks, the exclusive casino VIP team. After signing up with code ${code}, message ${vip.name} on Telegram (${vip.telegram}) and they set the package up on your account. Signing up with the code alone does not pay it.` },
    { q: `Where do I enter code ${code}?`, a: `Our link opens Roobet with the code attached. If you need to enter it yourself, Roobet's help centre says a code can be entered through the promo tab or in your account's general settings under "Referrer".` },
    { q: "Can I withdraw straight after depositing?", a: "Roobet's help centre says deposits must be wagered 100% before you withdraw, an anti-money-laundering rule, so wager what you deposit at least once first." },
    { q: "What do I get at Roobet without a code?", a: "Roobet's standing rewards: Instant Rakeback you can claim every 30 minutes, which never expires, daily and weekly bonuses, and a $100,000 weekly raffle where every wager earns tickets. Its VIP Club is invite-only." },
    { q: `Who gives the code ${code} package?`, a: `It comes through our affiliate deal with Roobet. We earn a commission when you sign up with it, which never changes what our Roobet review reports.` },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Roobet", path: "/casinos/roobet" }, { name: "Promo code", path: "/promo-codes/roobet" }]), faqSchema(faqs)]} />

      {/* Hero */}
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,197,49,.14), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(0,194,204,.07), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px", display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
              <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/casinos/roobet" style={{ color: "#83919A" }}>Roobet</Link> / <span style={{ color: "#A8B6BE" }}>Promo code</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden" }}>
                <BrandMark slug={SLUG} mono={o.mono} tint={GOLD} radius={14} fontSize={14} />
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GOLD }}>Roobet promo code</span>
            </div>
            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
              Use code <span style={{ color: GOLD }}>{code}</span> at Roobet
            </h1>
            <p style={{ margin: "0 0 24px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
              Sign up with code {code} and claim the welcome package: a 20% deposit match up to $500, then up to 600 free spins as you play.
            </p>
            <AuthorByline updated={o.codePerk.since} />
          </div>

          {/* The code card */}
          <div style={{ padding: 26, borderRadius: 20, background: "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.16), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.4)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize: 13, color: "#A8B6BE", marginBottom: 10 }}>Your code, tap to copy</div>
            <div style={{ marginBottom: 20 }}>
              <CodeChip code={code} tint={GOLD} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {pkg.map((p) => (
                <div key={p.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "rgba(87,227,154,.14)", color: "#57E39A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</span>
                  <span>
                    <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{p.t}</span>
                    <span style={{ display: "block", fontSize: 13, color: "#A8B6BE" }}>{p.d}</span>
                  </span>
                </div>
              ))}
              {hasBoost && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,197,49,.07)", border: "1px solid rgba(255,197,49,.25)" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "rgba(255,197,49,.16)", color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>+</span>
                  <span>
                    <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>+20% Rakeboost for 72 hours</span>
                    <span style={{ display: "block", fontSize: 13, color: "#A8B6BE" }}>
                      Roobet&apos;s boost for signing up with an affiliate code ·{" "}
                      <a href={boost!.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>help.roobet.com ↗</a>
                    </span>
                  </span>
                </div>
              )}
            </div>
            <a href={visit} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code} className="transition-transform hover:-translate-y-px" style={{ display: "block", textAlign: "center", padding: "16px 18px", borderRadius: 13, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 16, fontWeight: 800, boxShadow: "0 12px 30px rgba(255,197,49,.25)" }}>
              1. Sign up at Roobet ↗
            </a>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
              <VipClaim label={`2. Claim the package with ${vip.name}`} />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#B7C4CB" }}>The package is claimed through CasinoPerks on Telegram: signing up with the code alone does not pay it.</p>
            <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#7F8D96" }}>
              Through our affiliate deal with Roobet; we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>How to claim it</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 12 }}>
          {[
            { n: 1, t: "Open Roobet through our link", d: `The "Sign up at Roobet" button opens Roobet with code ${code} attached.` },
            { n: 2, t: `Sign up with code ${code}`, d: `If the code isn't filled in, Roobet's help centre says you can enter it in the promo tab or under "Referrer" in your general settings.`, src: REFERRALS },
            { n: 3, t: `Message ${vip.name} on Telegram`, d: "Our VIP team sets up the package on your account. This is the only way to claim it.", tg: true },
            { n: 4, t: "Deposit and play", d: "The 20% match is paid on your deposit; the free spins unlock at $10,000 and $50,000 wagered." },
          ].map((s) => (
            <div key={s.n} style={{ padding: 20, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: GOLD, color: "#141007", fontWeight: 800, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{s.t}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>
                {s.d}{" "}
                {s.src && <a href={s.src} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>help.roobet.com ↗</a>}
              </p>
              {"tg" in s && s.tg && (
                <div style={{ marginTop: 12 }}>
                  <VipClaim compact label="Message on Telegram" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Roobet&apos;s standing rewards</h2>
        <p style={{ margin: "0 0 18px", fontSize: 15, color: "#8DA0AA" }}>On top of the code&apos;s package, these run for every player, each from Roobet&apos;s own pages.</p>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          <Fact group="Bonus terms" label="Rakeback" />
          <Fact group="Bonus terms" label="Weekly raffle" sub="$100,000 weekly raffle" />
          <Fact group="Bonus terms" label="Reload bonuses" sub="Daily and weekly bonuses" />
          <Fact group="Bonus terms" label="VIP levels" sub="VIP Club" />
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Terms worth knowing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          <Fact group="Bonus terms" label="Wagering" />
          <Fact group="Payouts & fees" label="Withdrawal fees" />
          <Fact group="Bonus terms" label="Restricted countries" />
        </div>
      </section>

      {vip.telegram && (
        <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "20px 24px", borderRadius: 16, background: "radial-gradient(90% 140% at 0% 50%, rgba(34,158,217,.2), transparent 60%), #0C1114", border: "1px solid rgba(34,158,217,.32)" }}>
            <div style={{ flex: "1 1 320px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#7CC8EE", marginBottom: 4 }}>{vip.name} · VIP</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Exclusive casino VIP team</div>
              <div style={{ fontSize: 14, color: "#B7C4CB", marginTop: 4 }}>Already VIP at another casino? CasinoPerks will move your status over to Roobet, and they&apos;re the ones who set up your code {code} package. One message on Telegram and you&apos;re sorted.</div>
            </div>
            <a href={vip.telegram} target="_blank" rel="noopener noreferrer" style={{ padding: "13px 20px", borderRadius: 12, background: "#229ED9", color: "#fff", fontSize: 14.5, fontWeight: 800 }}>Message on Telegram</a>
          </div>
        </section>
      )}

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Questions</h2>
        {faqs.map((f) => (
          <details key={f.q} style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <summary style={{ cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.q}</summary>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "#A8B6BE" }}>{f.a}</p>
          </details>
        ))}
        <div style={{ margin: "36px 0" }}>
          <AuthorBox />
        </div>
        <NextSteps
          steps={[
            { href: "/casinos/roobet", label: "Full Roobet review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Roobet's own pages." },
            { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and rewards with the wagering each carries." },
            { href: "/races", label: "Biggest races & raffles", hint: "Daily, weekly and monthly prize pools across every casino." },
          ]}
        />
      </section>
    </main>
  );
}
