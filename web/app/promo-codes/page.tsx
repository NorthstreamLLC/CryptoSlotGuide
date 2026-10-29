import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { inHouseOrder } from "@/lib/house-order";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/schema";
import { PROMO_HUB, PROMO_PAGES, type PromoKind } from "@/lib/promo-pages";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

/** Every casino with a promo code page, our code and link, in house order. */
function codes() {
  const ops = siteData.ops.filter((o) => PROMO_PAGES.includes(o.slug) && PROMO_HUB[o.slug] && o.promoCode && o.signupUrl);
  return inHouseOrder(ops).map((o) => ({
    o,
    ...PROMO_HUB[o.slug],
    // Roobet's package lives in ops.json with the rest of its code terms.
    line: o.codePerk?.short ? `${o.codePerk.short}, claimed through CasinoPerks` : PROMO_HUB[o.slug].line,
  }));
}

export function generateMetadata() {
  return pageMetadata(
    `Crypto casino promo codes: ${codes().length} codes and what each one gets you`,
    "Every crypto casino promo code we hold, with what it actually unlocks: codes with their own perk (Roobet, Stake, Gamdom), welcome bonuses with their wagering, and casinos that pay rakeback and races instead.",
    "/promo-codes"
  );
}

const SECTIONS: { kind: PromoKind; id: string; title: string; sub: string; tint: string }[] = [
  { kind: "perk", id: "code-perks", title: "Codes with their own perk", sub: "Sign up with these and you get something players without a code don't.", tint: GOLD },
  { kind: "welcome", id: "welcome-bonuses", title: "Welcome bonuses", sub: "A deposit match or free spins for new players, with wagering to clear before you withdraw.", tint: "#57E39A" },
  { kind: "rewards", id: "rakeback-and-races", title: "No bonus, rewards instead", sub: "No deposit bonus to wager off: these pay rakeback, races and VIP rewards from your first bets.", tint: "#5FE3E8" },
];

export default function Page() {
  const all = codes();
  const faqs = [
    { q: "How do crypto casino promo codes work?", a: "You enter the code when you open your account, or sign up through a link that carries it. The code tells the casino who referred you, and at some casinos it also unlocks a perk, such as Stake's rakeback from your first bet or Gamdom's 15% rakeback boost." },
    { q: "Can I add a code after signing up?", a: "Usually only for a short time. Gamdom allows 6 hours after registering, Stake, Duelbits and Thrill 24 hours (Thrill also before your first deposit or bet), and Shuffle's support can add one within 7 days if you've wagered under $10,000. A code can't be changed once it's on your account." },
    { q: "Which code gives the most?", a: "It depends on how you play. A welcome bonus adds money up front but locks your deposit until it's wagered, 30x to 40x at these casinos. Rakeback and races pay back as you play with nothing to clear, which suits players who want to withdraw freely." },
    { q: "Do you earn from these codes?", a: "Yes. They are our affiliate codes and we earn a commission when you sign up with one. That never changes what our reviews report, and every claim on each code's page links to the casino's own terms." },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Promo codes", path: "/promo-codes" }]),
          itemListSchema("Crypto casino promo codes", all.map((c) => ({ name: `${c.o.name} promo code ${c.o.promoCode}`, path: `/promo-codes/${c.o.slug}` }))),
          faqSchema(faqs),
        ]}
      />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,197,49,.12), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(0,194,204,.08), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/bonuses" style={{ color: "#83919A" }}>Bonuses</Link> / <span style={{ color: "#A8B6BE" }}>Promo codes</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>{all.length} codes, checked against each casino&apos;s own terms</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            Crypto casino <span style={{ color: GOLD }}>promo codes</span>
          </h1>
          <p style={{ margin: "0 0 22px", maxWidth: "62ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            Every code we hold and what it actually gets you. Some unlock a perk of their own, some come with a welcome bonus, and some casinos skip the bonus and pay you back as you play.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="csg-lift" style={{ padding: "10px 16px", borderRadius: 100, background: "rgba(255,255,255,.05)", border: `1px solid ${s.tint}55`, color: "#E8EDF0", fontSize: 14, fontWeight: 700 }}>
                {s.title} <span style={{ color: s.tint }}>{all.filter((c) => c.kind === s.kind).length}</span>
              </a>
            ))}
          </div>
          <AuthorByline />
        </div>
      </section>

      {SECTIONS.map((s) => {
        const rows = all.filter((c) => c.kind === s.kind);
        if (rows.length === 0) return null;
        return (
          <section key={s.id} id={s.id} style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px 0", scrollMarginTop: 90 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>{s.title}</h2>
            <p style={{ margin: "0 0 18px", fontSize: 15, color: "#8DA0AA" }}>{s.sub}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map(({ o, line }) => (
                <div key={o.slug} style={{ padding: "16px 18px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", borderLeft: `3px solid ${s.tint}` }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                    <Link href={`/promo-codes/${o.slug}`} style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 300px", minWidth: 0 }}>
                      <span style={{ width: 46, height: 46, flex: "none", borderRadius: 12, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} radius={12} fontSize={13} />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                        <span style={{ display: "block", fontSize: 14, lineHeight: 1.45, color: "#A8B6BE" }}>{line}</span>
                      </span>
                    </Link>
                    <CodeChip code={o.promoCode!} tint={GOLD} size="sm" />
                    <span style={{ display: "flex", gap: 8 }}>
                      <a href={o.signupUrl!} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode!} style={{ padding: "10px 16px", borderRadius: 10, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>Claim ↗</a>
                      <Link href={`/promo-codes/${o.slug}`} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", color: "#E8EDF0", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>How it works</Link>
                    </span>
                  </div>
                  <GeoBlockNote slug={o.slug} name={o.name} compact />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 0" }}>
        <p style={{ margin: "0 0 30px", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#7F8D96" }}>
          These are our affiliate codes: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
        </p>
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
            { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and rewards with the wagering each carries." },
            { href: "/casinos/facts", label: "10 facts about each casino", hint: "Who runs it, its licence and the rules that catch players out." },
            { href: "/races", label: "Races and raffles", hint: "Daily, weekly and monthly races, side by side." },
          ]}
        />
      </section>
    </main>
  );
}
