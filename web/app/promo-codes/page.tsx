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
import { GeoListNote } from "@/components/geo/GeoListNote";
import { LineIcon, type IconName } from "@/components/ui/LineIcon";
import { brandFor } from "@/lib/casino-facts";

const GOLD = "#FFC531";

/** Same visual system as the homepage and casinos hub: flat lists, hairlines, gold only on buttons. */
const CSS = `
.pc-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.pc-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 26px; }
.pc-crumb a { color: #8E9CA4; }
.pc-crumb a:hover { color: #fff; }
.pc-h1 { margin: 0 0 16px; font-size: clamp(36px, 4.6vw, 54px); line-height: 1.04; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; }
.pc-lead { margin: 0 0 24px; max-width: 60ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.pc-jumps { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
.pc-jump { display: inline-flex; align-items: center; gap: 9px; padding: 7px 14px 7px 8px; border-radius: 100px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03); font-size: 14px; font-weight: 500; color: #C9D3D8; transition: border-color .15s, color .15s; }
.pc-jump:hover { border-color: color-mix(in srgb, var(--tint) 60%, transparent); color: #fff; }
.pc-jump-ico { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: color-mix(in srgb, var(--tint) 16%, transparent); color: var(--tint); }
.pc-jump em { font-style: normal; font-weight: 700; color: var(--tint); }
.pc-sec { padding-top: 72px; scroll-margin-top: 90px; }
.pc-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.pc-ico { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; flex: none; border-radius: 11px; background: color-mix(in srgb, var(--tint) 14%, transparent); border: 1px solid color-mix(in srgb, var(--tint) 35%, transparent); color: var(--tint); }
.pc-h2 { margin: 0; font-size: 24px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.pc-sub { margin: 2px 0 0; font-size: 14.5px; color: #8A98A0; }
.pc-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.pc-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 18px; align-items: center; padding: 15px 20px; transition: background .15s; }
.pc-row + .pc-row { border-top: 1px solid rgba(255,255,255,.06); }
.pc-row:hover { background: rgba(255,255,255,.02); }
.pc-name { display: flex; align-items: center; gap: 13px; min-width: 0; }
.pc-name b { display: block; font-size: 16px; font-weight: 700; color: #F2F5F7; }
.pc-name small { display: block; margin-top: 2px; font-size: 14px; line-height: 1.4; color: #8E9CA4; }
.pc-act { display: flex; align-items: center; gap: 14px; }
.pc-btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; border-radius: 11px; background: #FFC531; color: #141007; font-size: 14px; font-weight: 700; white-space: nowrap; transition: background .15s, transform .15s; }
.pc-btn:hover { background: #FFD45E; transform: translateY(-1px); }
.pc-claim { font-size: 13.5px; color: #93A1A9; white-space: nowrap; }
.pc-claim:hover { color: #fff; }
.pc-faq details { padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
.pc-faq summary { cursor: pointer; font-size: 16px; font-weight: 600; color: #F2F5F7; }
.pc-faq p { margin: 10px 0 0; font-size: 14.5px; line-height: 1.65; color: #98A6AE; }
@media (max-width: 760px) {
  .pc-wrap { padding: 0 16px; }
  .pc-row { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "n n" "c a"; row-gap: 12px; padding: 15px 16px; }
  .pc-name { grid-area: n; }
  .pc-row > .csg-code-chip { grid-area: c; justify-self: start; }
  .pc-act { grid-area: a; }
  .pc-claim { display: none; }
}
`;

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

const SECTIONS: { kind: PromoKind; id: string; title: string; sub: string; tint: string; icon: IconName }[] = [
  { kind: "perk", id: "code-perks", title: "Codes with their own perk", sub: "Sign up with these and you get something players without a code don't.", tint: GOLD, icon: "sparkle" },
  { kind: "welcome", id: "welcome-bonuses", title: "Welcome bonuses", sub: "A deposit match or free spins for new players, with wagering to clear before you withdraw.", tint: "#57E39A", icon: "gift" },
  { kind: "rewards", id: "rakeback-and-races", title: "No bonus, rewards instead", sub: "No deposit bonus to wager off: these pay rakeback, races and VIP rewards from your first bets.", tint: "#5FE3E8", icon: "coin" },
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
    <main style={{ background: "#080B0D", paddingBottom: 80 }}>
      <style>{CSS}</style>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Promo codes", path: "/promo-codes" }]),
          itemListSchema("Crypto casino promo codes", all.map((c) => ({ name: `${c.o.name} promo code ${c.o.promoCode}`, path: `/promo-codes/${c.o.slug}` }))),
          faqSchema(faqs),
        ]}
      />

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(255,197,49,.06), transparent 70%), #0A0D10" }}>
        <div className="pc-wrap" style={{ padding: "30px 24px 44px" }}>
          <div className="pc-crumb">
            <Link href="/">Home</Link> / <Link href="/bonuses">Bonuses</Link> / <span style={{ color: "#AEBAC1" }}>Promo codes</span>
          </div>
          <h1 className="pc-h1">
            Crypto casino <span style={{ color: GOLD }}>promo codes</span>
          </h1>
          <p className="pc-lead">
            All {all.length} codes we hold and what each one actually gets you, checked against the casino&apos;s own terms. Some unlock a perk of their own, some come with a welcome bonus, and some casinos skip the bonus and pay you back as you play.
          </p>
          <div className="pc-jumps">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="pc-jump" style={{ ["--tint" as string]: s.tint }}>
                <span className="pc-jump-ico"><LineIcon name={s.icon} size={13} /></span>
                {s.title} <em>{all.filter((c) => c.kind === s.kind).length}</em>
              </a>
            ))}
          </div>
          <AuthorByline />
        </div>
      </div>

      <div className="pc-wrap">
        {SECTIONS.map((s) => {
          const rows = all.filter((c) => c.kind === s.kind);
          if (rows.length === 0) return null;
          return (
            <section key={s.id} id={s.id} className="pc-sec">
              <div className="pc-head" style={{ ["--tint" as string]: s.tint }}>
                <span className="pc-ico"><LineIcon name={s.icon} /></span>
                <div>
                  <h2 className="pc-h2">{s.title}</h2>
                  <p className="pc-sub">{s.sub}</p>
                </div>
              </div>
              <div className="pc-box">
                <GeoListNote casinos={rows.map(({ o }) => ({ slug: o.slug, name: o.name }))} />
                {rows.map(({ o, line }) => (
                  <div key={o.slug} className="pc-row">
                    <Link href={`/promo-codes/${o.slug}`} className="pc-name">
                      <span style={{ width: 42, height: 42, flex: "none", borderRadius: 11, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={11} fontSize={12} />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <b>{o.name}</b>
                        <small>{line}</small>
                      </span>
                    </Link>
                    <CodeChip code={o.promoCode!} tint={GOLD} size="sm" />
                    <span className="pc-act">
                      <Link href={`/promo-codes/${o.slug}`} className="pc-btn">How it works</Link>
                      <a href={o.signupUrl!} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode!} className="pc-claim">Claim ↗</a>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <section style={{ maxWidth: 820, padding: "56px 0 0" }}>
          <p style={{ margin: "0 0 36px", fontSize: 12, lineHeight: 1.6, color: "#67747C" }}>
            These are our affiliate codes: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
          </p>
          <h2 className="pc-h2" style={{ marginBottom: 12 }}>Questions</h2>
          <div className="pc-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <div style={{ margin: "36px 0" }}>
            <AuthorBox />
          </div>
        <NextSteps
          steps={[
            { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and rewards with the wagering each carries." },
            { href: "/rakeback-casinos", label: "Best rakeback casinos", hint: "Rates, claim times and what each code adds, side by side." },
            { href: "/casinos/facts", label: "10 facts about each casino", hint: "Who runs it, its licence and the rules that catch players out." },
            { href: "/races", label: "Races and raffles", hint: "Daily, weekly and monthly races, side by side." },
          ]}
        />
        </section>
      </div>
    </main>
  );
}
