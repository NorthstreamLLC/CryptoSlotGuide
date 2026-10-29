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
import { SourcedCard, SpecFactCard } from "@/components/promo/SourcedCard";

const SLUG = "shuffle";
const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const HELP = "https://help.shuffle.com/en/articles/";
const SIGNUP = HELP + "6918898-account-sign-up";
const FIX_CODE = HELP + "7066951-how-can-i-change-my-shuffle-account-referral-affiliate-code";
const RAKEBACK = HELP + "10020509-how-does-rakeback-work";
const EARN = HELP + "10020510-how-do-i-earn-rakeback";

const op = () => siteData.ops.find((o) => o.slug === SLUG);

export function generateMetadata() {
  const code = op()?.promoCode ?? "SLOTGUIDE";
  return pageMetadata(
    `Shuffle promo code ${code}: 5% rakeback and a $100K weekly race`,
    `Sign up at Shuffle with code ${code}: how to enter it, what Shuffle actually pays new players (5% rakeback from Bronze, a $100,000 weekly leaderboard, daily to monthly bonuses) and the deposit bonus terms, from Shuffle's own pages.`,
    "/promo-codes/shuffle"
  );
}

const Fact = (p: { label: string; group: string; sub?: string }) => <SpecFactCard slug={SLUG} {...p} />;

export default function Page() {
  const o = op();
  // The page only stands while our code and link both do.
  if (!o || !o.promoCode || !o.signupUrl) notFound();
  const code = o.promoCode;

  const perks = [
    { t: "5% rakeback on casino games", d: "Of the house edge, win or lose, from Bronze ($1,000 wagered)" },
    { t: "$100,000 weekly leaderboard", d: "Top 1,000 players paid every week" },
    { t: "Daily, weekly and monthly bonuses", d: "Daily from Bronze, weekly from Silver" },
  ];

  const faqs = [
    { q: "What is the Shuffle promo code?", a: `${code}. Our link fills it in for you, or you can type it in the referral field when you register.` },
    { q: `Does code ${code} come with its own bonus?`, a: "Shuffle's help centre lists no extra bonus tied to a referral code. What every new player gets is Shuffle's standard programme: 5% of the house edge back as rakeback once you reach Bronze at $1,000 wagered, a $100,000 weekly leaderboard, and daily, weekly and monthly bonuses as you climb the VIP levels." },
    { q: "I forgot to enter the code. Can I add it later?", a: "Shuffle's help centre says support can add a code to an account no older than 7 days with under $10,000 wagered. An account that already has a code can't be changed." },
    { q: "Does Shuffle have a deposit bonus?", a: "Its promotions page says a deposit bonus applies to the first deposit only, and the amount and wagering multiplier only show inside your account. You need to deposit at least $20 to claim one unless the offer says otherwise, and the max bet while wagering is $10." },
    { q: "Does rakeback count sports bets?", a: "No. Shuffle's help centre says rakeback applies to casino games only (slots, table games and live dealer), not sports bets." },
    { q: `Who gives code ${code}?`, a: "It is our affiliate code. We earn a commission when you sign up with it, which never changes what our Shuffle review reports." },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Promo codes", path: "/promo-codes" }, { name: "Shuffle", path: "/promo-codes/shuffle" }]), faqSchema(faqs)]} />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,197,49,.12), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(0,194,204,.08), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 44px", display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
              <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/promo-codes" style={{ color: "#83919A" }}>Promo codes</Link> / <span style={{ color: "#A8B6BE" }}>Shuffle</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden" }}>
                <BrandMark slug={SLUG} mono={o.mono} tint={GOLD} radius={14} fontSize={14} />
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GOLD }}>Shuffle promo code</span>
            </div>
            <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
              Use code <span style={{ color: GOLD }}>{code}</span> at Shuffle
            </h1>
            <p style={{ margin: "0 0 24px", maxWidth: "52ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
              Sign up with code {code} and play Shuffle&apos;s rewards from day one: 5% of the house edge back on casino games once you hit Bronze, a $100,000 race every week, and bonuses that grow with your VIP level.
            </p>
            <AuthorByline updated={getSpecFact(SLUG, "Bonus terms", "Leaderboards")?.asOf} />
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
              Sign up at Shuffle with {code} ↗
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
            { n: 1, t: "Open Shuffle through our link", d: `The sign-up button opens Shuffle with code ${code} attached.` },
            { n: 2, t: "Check the referral field", d: `If it's empty, type ${code} before you register. Shuffle can't change a code once it's applied.`, src: SIGNUP },
            { n: 3, t: "Wager $1,000 to reach Bronze", d: "From there rakeback comes back on every casino bet, claimable any time from the VIP page.", src: EARN },
          ].map((s) => (
            <div key={s.n} style={{ padding: 20, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: GOLD, color: "#141007", fontWeight: 800, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{s.t}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#A8B6BE" }}>
                {s.d}{" "}
                {s.src && <a href={s.src} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>help.shuffle.com ↗</a>}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>What Shuffle pays you back</h2>
        <p style={{ margin: "0 0 18px", fontSize: 15, color: "#8DA0AA" }}>Each from Shuffle&apos;s own pages.</p>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 12 }}>
          <SourcedCard title="Rakeback: 5% of the house edge" body="Rakeback applies to all casino games, giving you 5% of the house edge back as cash, win or lose. Wager 1,000 USDT on a game with a 2% edge and 1 USDT comes back. It doesn't apply to sports bets." href={RAKEBACK} />
          <Fact group="Bonus terms" label="Rakeback" sub="Instant, weekly and monthly rakeback" />
          <Fact group="Bonus terms" label="Leaderboards" sub="$100,000 weekly leaderboard" />
          <Fact group="Bonus terms" label="Reload bonuses" sub="Daily, weekly and monthly bonuses, and reloads" />
          <Fact group="Bonus terms" label="Missions" sub="Casino Challenges" />
          <Fact group="Bonus terms" label="VIP levels" />
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>If you take the deposit bonus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          <Fact group="Bonus terms" label="Deposit bonus" />
          <Fact group="Bonus terms" label="Wagering rules" sub="Wagering" />
          <Fact group="Bonus terms" label="Max bet" sub="Max bet while wagering" />
          <Fact group="Bonus terms" label="Game contribution" sub="What counts toward wagering" />
          <Fact group="Bonus terms" label="Expiry" />
          <SourcedCard title="Forgot the code?" body="Support can add a referral code to an account no older than 7 days with under $10,000 wagered. A code already on an account can't be changed." href={FIX_CODE} />
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
            { href: "/casinos/shuffle", label: "Full Shuffle review", hint: "Withdrawals, coins, licence and sportsbook, each linked to Shuffle's own pages." },
            { href: "/promo-codes/stake", label: "Stake code SLOTGUIDE", hint: "Unlocks Stake's 3.5% rakeback from your first bet." },
            { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and rewards with the wagering each carries." },
          ]}
        />
      </section>
    </main>
  );
}
