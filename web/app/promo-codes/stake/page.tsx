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
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { SpecFactCard } from "@/components/promo/SourcedCard";

const SLUG = "stake";
const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const WELCOME = "https://help.stake.com/en/articles/5091363-how-to-get-my-welcome-offer";

const op = () => siteData.ops.find((o) => o.slug === SLUG);

export function generateMetadata() {
  const code = op()?.promoCode ?? "SLOTGUIDE";
  return pageMetadata(
    `Stake promo code ${code}: 3.5% rakeback from your first bet`,
    `Sign up at Stake with code ${code} and Stake's welcome offer unlocks its 3.5% rakeback straight away, instead of after $10,000 wagered. How to enter the code, and Stake's races, raffle and VIP rewards, from its own pages.`,
    "/promo-codes/stake"
  );
}

const Fact = (p: { label: string; group: string; sub?: string }) => <SpecFactCard slug={SLUG} {...p} />;

export default function Page() {
  const o = op();
  // The page only stands while the welcome-offer fact and our link both do.
  if (!o || !o.promoCode || !o.signupUrl || !getSpecFact(SLUG, "Bonus terms", "Welcome offer")) notFound();
  const code = o.promoCode;

  const perks = [
    { t: "3.5% rakeback from day one", d: "Instead of only after $10,000 wagered (Bronze)" },
    { t: "$100,000 daily race", d: "Top 5,000 players paid every 24 hours" },
    { t: "$75,000 weekly raffle", d: "A ticket for every $1,000 wagered" },
  ];

  const faqs = [
    { q: "What is the Stake promo code?", a: `${code}. Enter it within 24 hours of opening your Stake account and Stake's welcome offer unlocks its 3.5% rakeback straight away, rather than only once you reach Bronze at $10,000 wagered.` },
    { q: `Where do I enter code ${code}?`, a: "Our link opens Stake with the code attached. If you need to add it yourself, Stake's help centre says the code is entered from your account settings page, and only within 24 hours of creating the account." },
    { q: "Does Stake have a deposit bonus?", a: "No fixed deposit match. Stake's offer is rakeback plus recurring bonuses: a weekly boost, a monthly bonus, level-up bonuses and reloads from Platinum, each described on its own help pages." },
    { q: "When can I claim the rakeback?", a: "Stake's help centre says earned rakeback can be claimed at any time, from the rakeback tab on the VIP page." },
    { q: `Who gives code ${code}?`, a: "It is our affiliate code. We earn a commission when you sign up with it, which never changes what our Stake review reports." },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Stake", path: "/casinos/stake" }, { name: "Promo code", path: "/promo-codes/stake" }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,197,49,.12), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(0,194,204,.08), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px", display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
              <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/casinos/stake" style={{ color: "#83919A" }}>Stake</Link> / <span style={{ color: "#A8B6BE" }}>Promo code</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden" }}>
                <BrandMark slug={SLUG} mono={o.mono} tint={GOLD} radius={14} fontSize={14} />
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GOLD }}>Stake promo code</span>
            </div>
            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
              Use code <span style={{ color: GOLD }}>{code}</span> at Stake
            </h1>
            <p style={{ margin: "0 0 24px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
              Sign up with code {code} and Stake&apos;s welcome offer unlocks its 3.5% rakeback from your very first bet. Without a code it only starts once you have wagered $10,000.
            </p>
            <AuthorByline updated={getSpecFact(SLUG, "Bonus terms", "Welcome offer")?.asOf} />
          </div>

          <div style={{ padding: 26, borderRadius: 20, background: "radial-gradient(120% 90% at 50% 0%, rgba(255,197,49,.16), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.4)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize: 13, color: "#A8B6BE", marginBottom: 10 }}>Your code, tap to copy</div>
            <div style={{ marginBottom: 20 }}>
              <CodeChip code={code} tint={GOLD} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {perks.map((p) => (
                <div key={p.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "rgba(87,227,154,.14)", color: "#57E39A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</span>
                  <span>
                    <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{p.t}</span>
                    <span style={{ display: "block", fontSize: 13, color: "#A8B6BE" }}>{p.d}</span>
                  </span>
                </div>
              ))}
            </div>
            <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code} className="transition-transform hover:-translate-y-px" style={{ display: "block", textAlign: "center", padding: "16px 18px", borderRadius: 13, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 16, fontWeight: 800, boxShadow: "0 12px 30px rgba(255,197,49,.25)" }}>
              Sign up at Stake with {code} ↗
            </a>
            <GeoBlockNote slug={SLUG} name={o.name} />
            <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#7F8D96" }}>
              Our affiliate code: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>How to claim it</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
          {[
            { n: 1, t: "Open Stake through our link", d: `The sign-up button opens Stake with code ${code} attached.` },
            { n: 2, t: "Check the code within 24 hours", d: "If it isn't filled in, Stake's help centre says to add it from your account settings page. After 24 hours it can no longer be added.", src: WELCOME },
            { n: 3, t: "Play: rakeback starts now", d: "3.5% of the house edge comes back on every casino bet, claimable any time from the rakeback tab on the VIP page." },
          ].map((s) => (
            <div key={s.n} style={{ padding: 20, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: GOLD, color: "#141007", fontWeight: 800, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{s.t}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>
                {s.d}{" "}
                {s.src && <a href={s.src} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>help.stake.com ↗</a>}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>What the code unlocks, and what runs for everyone</h2>
        <p style={{ margin: "0 0 18px", fontSize: 15, color: "#8DA0AA" }}>Each from Stake&apos;s own pages.</p>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          <Fact group="Bonus terms" label="Welcome offer" sub="The welcome offer (your code)" />
          <Fact group="Bonus terms" label="Rakeback" />
          <Fact group="Bonus terms" label="Leaderboards" sub="Daily race, Wheel Wars and challenges" />
          <Fact group="Bonus terms" label="Weekly raffle" sub="$75,000 weekly raffle" />
          <Fact group="Bonus terms" label="Perks by level" sub="Weekly and monthly bonuses" />
          <Fact group="Bonus terms" label="VIP levels" sub="VIP levels" />
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Terms worth knowing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          <Fact group="Bonus terms" label="Wagering" sub="Wagering on the weekly bonus" />
          <Fact group="Payouts & fees" label="Withdrawal limits" />
          <Fact group="Compliance" label="Licence" />
        </div>
      </section>

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
            { href: "/casinos/stake", label: "Full Stake review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Stake's own pages." },
            { href: "/promo-codes/roobet", label: "Roobet code ELITE", hint: "Our pick: a welcome package claimed through CasinoPerks." },
            { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and rewards with the wagering each carries." },
          ]}
        />
      </section>
    </main>
  );
}
