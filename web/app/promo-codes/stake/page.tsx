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
import { VersusStrip } from "@/components/compare/VersusStrip";
import { EmailSignup } from "@/components/ui/EmailSignup";
import { wheelWarsLive, WHEEL_DROPS, SATURDAY_TOURNAMENT, WHEEL_WARS_SOURCE } from "@/lib/stake-wheel-wars";

const SLUG = "stake";
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
    { q: `Where do I enter code ${code}?`, a: "Our link opens Stake with the code attached. If you need to add it yourself, Stake's help centre says the code is entered on the offers page under your account, and only within 24 hours of creating the account." },
    { q: "Does Stake have a deposit bonus?", a: "No fixed deposit match. Stake's offer is rakeback plus recurring bonuses: a weekly boost, a monthly bonus, level-up bonuses and reloads from Platinum, each described on its own help pages." },
    { q: "When can I claim the rakeback?", a: "Stake's help centre says earned rakeback can be claimed at any time, from the rakeback tab on the VIP page." },
    { q: `Who gives code ${code}?`, a: "It is our affiliate code. We earn a commission when you sign up with it, which never changes what our Stake review reports." },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Promo codes", path: "/promo-codes" }, { name: "Stake", path: "/promo-codes/stake" }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px", display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#83919A", marginBottom: 22 }}>
              <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/promo-codes" style={{ color: "#83919A" }}>Promo codes</Link> / <span style={{ color: "#A8B6BE" }}>Stake</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden" }}>
                <BrandMark slug={SLUG} mono={o.mono} tint={GOLD} radius={14} fontSize={14} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: GOLD }}>Stake promo code</span>
            </div>
            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 700, color: "#fff" }}>
              Use code <span style={{ color: GOLD }}>{code}</span> at Stake
            </h1>
            <p style={{ margin: "0 0 24px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
              Sign up with code {code} and Stake&apos;s welcome offer unlocks its 3.5% rakeback from your very first bet. Without a code it only starts once you have wagered $10,000.
            </p>
            <AuthorByline updated={getSpecFact(SLUG, "Bonus terms", "Welcome offer")?.asOf} />
          </div>

          <div style={{ padding: 26, borderRadius: 20, background: "#0F1418", border: "1px solid rgba(255,197,49,.4)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize: 13, color: "#A8B6BE", marginBottom: 10 }}>Your code, tap to copy</div>
            <div style={{ marginBottom: 20 }}>
              <CodeChip code={code} tint={GOLD} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {perks.map((p) => (
                <div key={p.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", background: "rgba(87,227,154,.14)", color: "#57E39A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</span>
                  <span>
                    <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: "#fff" }}>{p.t}</span>
                    <span style={{ display: "block", fontSize: 13, color: "#A8B6BE" }}>{p.d}</span>
                  </span>
                </div>
              ))}
            </div>
            <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code} className="transition-transform hover:-translate-y-px" style={{ display: "block", textAlign: "center", padding: "16px 18px", borderRadius: 13, background: "#FFC531", color: "#141007", fontSize: 16, fontWeight: 700, boxShadow: "0 12px 30px rgba(255,197,49,.25)" }}>
              Sign up at Stake with {code} ↗
            </a>
            <GeoBlockNote slug={SLUG} name={o.name} />
            <p style={{ margin: "12px 0 0", fontSize: 12, lineHeight: 1.6, color: "#7F8D96" }}>
              Our affiliate code: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
            </p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 700, color: "#fff" }}>How to claim it</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
          {[
            { n: 1, t: "Open Stake through our link", d: `The sign-up button opens Stake with code ${code} attached.` },
            { n: 2, t: "Check the code within 24 hours", d: "If it isn't filled in, Stake's help centre says to add it on the offers page under your account. After 24 hours it can no longer be added.", src: WELCOME },
            { n: 3, t: "Play: rakeback starts now", d: "3.5% of the house edge comes back on every casino bet, claimable any time from the rakeback tab on the VIP page." },
          ].map((s) => (
            <div key={s.n} style={{ padding: 20, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: GOLD, color: "#141007", fontWeight: 700, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.t}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>
                {s.d}{" "}
                {s.src && <a href={s.src} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 12, color: "#5FE3E8" }}>help.stake.com ↗</a>}
              </p>
            </div>
          ))}
        </div>
      </section>

      {wheelWarsLive() && (
        <section id="wheel-wars" style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0", scrollMarginTop: 120 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 700, color: "#fff" }}>Stake Wheel Wars, until 2 January 2027</h2>
          <p style={{ margin: "0 0 18px", maxWidth: "70ch", fontSize: 15.5, lineHeight: 1.6, color: "#A8B6BE" }}>
            A Pragmatic Play promotion at Stake with what Stake describes as $150,000 in monthly prizes. It runs from 19 July 2026 at 00:01 UTC to 2 January 2027 at 23:59 UTC, and it is open to everyone at Stake, code or not.{" "}
            <a href={WHEEL_WARS_SOURCE} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 13, color: "#5FE3E8" }}>stake.com ↗</a>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12, marginBottom: 12 }}>
            <div style={{ padding: 20, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#fff", marginBottom: 6 }}>1. Play a participating game</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>Bet on any participating Pragmatic Play game; there is no minimum bet. The full list and terms are in Pragmatic Play&apos;s promotion lobby inside the games.</p>
            </div>
            <div style={{ padding: 20, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#fff", marginBottom: 6 }}>2. Win a wheel drop, qualify for Saturday</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>Winning a Weekly Wheel Drop pays a multiple of your bet and makes you eligible for that week&apos;s Saturday Tournament.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
            {[
              { title: "Weekly Wheel Drops", head: ["Prizes", "Prize"], rows: WHEEL_DROPS.map(([n, p]) => [n.toLocaleString("en-US"), `${p} your bet`]) },
              { title: "Saturday Tournament", head: ["Position", "Prize"], rows: SATURDAY_TOURNAMENT.map(([pos, p]) => [pos, p]) },
            ].map((t) => (
              <div key={t.title} style={{ padding: "18px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{t.title}</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: "#DCE3E7", fontVariantNumeric: "tabular-nums" }}>
                  <thead>
                    <tr>{t.head.map((h) => <th key={h} style={{ textAlign: "left", padding: "6px 0", fontSize: 12, fontWeight: 600, color: "#75828A", borderBottom: "1px solid rgba(255,255,255,.08)" }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {t.rows.map(([a, b]) => (
                      <tr key={a}>
                        <td style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>{a}</td>
                        <td style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.6, color: "#7F8D96" }}>
            Stake and Pragmatic Play say they can amend, suspend or cancel the promotion at any time. Prize tables as Stake states them on its promotions page.
          </p>
        </section>
      )}

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 700, color: "#fff" }}>What the code unlocks, and what runs for everyone</h2>
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
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 700, color: "#fff" }}>Terms worth knowing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          <Fact group="Bonus terms" label="Wagering" sub="Wagering on the weekly bonus" />
          <Fact group="Payouts & fees" label="Withdrawal limits" />
          <Fact group="Compliance" label="Licence" />
        </div>
      </section>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 700, color: "#fff" }}>Questions</h2>
        {faqs.map((f) => (
          <details key={f.q} style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <summary style={{ cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.q}</summary>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "#A8B6BE" }}>{f.a}</p>
          </details>
        ))}
        <div style={{ margin: "36px 0" }}>
          <AuthorBox />
        </div>
        <VersusStrip slug={SLUG} />
        <div style={{ height: 8 }} />
        <div style={{ margin: "28px 0 8px" }}>
          <EmailSignup
            compact
            source={"code:stake"}
            eyebrow="Monthly email"
            title={"Hear if Stake's code or bonus changes"}
            sub={`If what code ${code} gets you changes, or Stake adds or drops a bonus, it's in our monthly email with the source. One email a month, unsubscribe any time.`}
            button={"Get the monthly email"}
          />
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
