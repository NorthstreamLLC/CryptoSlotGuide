import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/schema";
import { brandFor } from "@/lib/casino-facts";
import { RAKEBACK, type RakebackRow } from "@/lib/rakeback";
import { hasPromoPage } from "@/lib/promo-pages";
import { analysedRivals } from "@/lib/versus";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CodeChip } from "@/components/ui/CodeChip";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { EmailSignup } from "@/components/ui/EmailSignup";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";
const GREEN = "#57E39A";

/** Rows whose casino and rakeback fact are on record, with their source links. */
function rows() {
  return RAKEBACK.flatMap((r) => {
    const o = siteData.ops.find((x) => x.slug === r.slug);
    const facts = r.cite.map(([g, l]) => getSpecFact(r.slug, g, l)).filter((f) => f?.sourceUrl);
    if (!o || !getSpecFact(r.slug, "Bonus terms", "Rakeback")?.sourceUrl) return [];
    const sources = [...new Set([...(r.href ? [r.href] : []), ...facts.map((f) => f!.sourceUrl!)])];
    const updated = facts.map((f) => f!.asOf).filter((d): d is string => !!d).sort().pop();
    return [{ r, o, sources, updated }];
  });
}

export function generateMetadata() {
  return pageMetadata(
    "Best rakeback crypto casinos: rates, claim times and code boosts compared",
    "Rakeback at 14 crypto casinos side by side: the published rate as a share of the house edge, how often you can claim it, when it starts, and what a promo code adds. Each from the casino's own pages.",
    "/rakeback-casinos"
  );
}

const faqs = [
  { q: "What is rakeback?", a: "A share of the casino's house edge paid back to you on every bet, win or lose. It's worked out on the edge, not your stake: $1,000 wagered on a slot with a 4% edge gives the casino $40 of expected profit, so 10% rakeback returns $4." },
  { q: "Which crypto casino pays the most rakeback?", a: "Of the casinos that publish a rate, Duel returns the most: 50% of the house edge on third-party slots, instantly. Duelbits pays 25% on everything including sports, rising to 37.5% with level-ups, and BetFury pays 10% to every player." },
  { q: "Why don't some casinos publish a rate?", a: "Winna, Rainbet, Roobet, Gamdom, Goated, Thrill and Razed describe how their rakeback works but not the percentage, which usually scales with your VIP level. We list what they do publish: how often you can claim it and when it starts." },
  { q: "Does a promo code change rakeback?", a: "At some casinos, yes. Stake's code switches on its 3.5% from your first bet instead of at $10,000 wagered, Gamdom boosts new accounts to 15% for 7 days, and Roobet adds 20% for 72 hours to accounts that join with an affiliate code." },
];

function Row({ r, o, sources, rank }: { r: RakebackRow; o: (typeof siteData.ops)[number]; sources: string[]; rank?: number }) {
  const tint = brandFor(o.slug);
  const code = o.affiliate && o.signupUrl ? o.promoCode : null;
  const vs = analysedRivals(o.slug)[0];
  return (
    <div id={o.slug} style={{ scrollMarginTop: 90, padding: "18px 20px", borderRadius: 16, background: `radial-gradient(90% 130% at 0% 0%, ${tint}14, transparent 55%), #0C1013`, border: "1px solid rgba(255,255,255,.08)", borderLeft: `3px solid ${tint}` }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
        {rank != null && <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 800, color: tint, width: 34 }}>{String(rank).padStart(2, "0")}</span>}
        <span style={{ width: 42, height: 42, flex: "none", borderRadius: 11, overflow: "hidden" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={11} fontSize={12} />
        </span>
        <span style={{ flex: "1 1 200px", minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 17, fontWeight: 800, color: "#fff" }}>{o.name}</span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: r.rate != null ? GREEN : "#C6D1D7" }}>{r.rateText}</span>
        </span>
        {code && (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CodeChip code={code} tint={GOLD} size="sm" />
            <a href={o.signupUrl!} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code} style={{ padding: "9px 14px", borderRadius: 10, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap" }}>Claim ↗</a>
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8, marginTop: 14 }}>
        <span style={{ fontSize: 13.5, color: "#A8B6BE" }}><span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", color: "#7F8D96", marginRight: 8 }}>CLAIM</span>{r.claim}</span>
        <span style={{ fontSize: 13.5, color: "#A8B6BE" }}><span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", color: "#7F8D96", marginRight: 8 }}>STARTS</span>{r.starts}</span>
      </div>
      {r.code && (
        <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(255,197,49,.08)", border: "1px solid rgba(255,197,49,.3)", fontSize: 13.5, color: "#F3E3B5" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", color: GOLD, marginRight: 8 }}>WITH OUR CODE</span>
          {r.code}
        </div>
      )}
      {r.note && <p style={{ margin: "10px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "#8DA0AA" }}>{r.note}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 10, fontSize: 13, fontWeight: 700 }}>
        {sources.map((h) => (
          <a key={h} href={h} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 400, color: "#5FE3E8" }}>{new URL(h).hostname.replace(/^www\./, "")} ↗</a>
        ))}
        {hasPromoPage(o.slug) && <Link href={`/promo-codes/${o.slug}`} style={{ color: "#FFD36B" }}>Code page →</Link>}
        {vs && <Link href={vs.href} style={{ color: "#E8EDF0" }}>{o.name} vs {vs.rival.name} →</Link>}
      </div>
      <GeoBlockNote slug={o.slug} name={o.name} compact />
    </div>
  );
}

export default function Page() {
  const all = rows();
  const ranked = all.filter((x) => x.r.rate != null).sort((a, b) => b.r.rate! - a.r.rate!);
  const unranked = all.filter((x) => x.r.rate == null);
  const updated = all.map((x) => x.updated).filter((d): d is string => !!d).sort().pop();
  const pick = (slug: string) => all.find((x) => x.o.slug === slug)?.o;
  const picks = [
    { slug: "duel", k: "Highest published rate", v: "50% of the slot house edge, paid instantly" },
    { slug: "duelbits", k: "Highest on everything", v: "25% of the edge, sports included" },
    { slug: "winna", k: "Fastest to claim", v: "Every 7 minutes" },
    { slug: "stake", k: "Best code boost", v: "3.5% from your first bet, not at $10,000" },
  ].filter((p) => pick(p.slug));

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Bonuses", path: "/bonuses" }, { name: "Rakeback casinos", path: "/rakeback-casinos" }]),
          itemListSchema("Best rakeback crypto casinos", ranked.map(({ o }) => ({ name: o.name, path: `/casinos/${o.slug}` }))),
          faqSchema(faqs),
        ]}
      />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(87,227,154,.12), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(255,197,49,.08), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/bonuses" style={{ color: "#83919A" }}>Bonuses</Link> / <span style={{ color: "#A8B6BE" }}>Rakeback casinos</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: GREEN, marginBottom: 12 }}>{all.length} casinos · {ranked.length} publish a rate · every one sourced</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.6vw, 54px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            The best <span style={{ color: GREEN }}>rakeback</span> crypto casinos
          </h1>
          <p style={{ margin: "0 0 22px", maxWidth: "64ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            Rakeback pays you a share of the house edge on every bet, win or lose, with nothing to wager off. Here&apos;s how much each casino returns, how often you can claim it, when it starts and what our code adds.
          </p>
          <AuthorByline updated={updated} />
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
          {picks.map((p) => {
            const o = pick(p.slug)!;
            const tint = brandFor(o.slug);
            return (
              <a key={p.slug} href={`#${o.slug}`} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 16px", borderRadius: 14, background: `radial-gradient(100% 90% at 0% 0%, ${tint}1f, transparent 60%), #0C1013`, border: `1px solid ${tint}44` }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: tint }}>{p.k}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, overflow: "hidden", flex: "none" }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={7} fontSize={9} />
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                </span>
                <span style={{ fontSize: 13.5, lineHeight: 1.45, color: "#A8B6BE" }}>{p.v}</span>
              </a>
            );
          })}
        </div>

        <div style={{ marginTop: 26, padding: "16px 18px", borderRadius: 14, background: "rgba(87,227,154,.06)", border: "1px solid rgba(87,227,154,.25)", fontSize: 14.5, lineHeight: 1.65, color: "#CFE9DB" }}>
          <strong style={{ color: "#fff" }}>How to read the rates:</strong> every casino here states rakeback as a share of the <em>house edge</em>, not of your bet. $1,000 on a slot with a 4% edge is $40 of expected profit for the casino, so 10% rakeback returns $4 and 50% returns $20. The lower a game&apos;s house edge, the less rakeback it pays.
        </div>

        <h2 style={{ margin: "36px 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Ranked by published rate</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15, color: "#8DA0AA" }}>Highest share of the house edge first.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ranked.map((x, i) => <Row key={x.o.slug} {...x} rank={i + 1} />)}
        </div>

        <h2 style={{ margin: "40px 0 6px", fontSize: 28, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>Rakeback without a published rate</h2>
        <p style={{ margin: "0 0 16px", fontSize: 15, color: "#8DA0AA" }}>These scale rakeback with your VIP level without stating the percentage, so we compare what they do publish.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {unranked.map((x) => <Row key={x.o.slug} {...x} />)}
        </div>
      </section>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 0" }}>
        <p style={{ margin: "0 0 30px", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#7F8D96" }}>
          Claim links are our affiliate links: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply · Play responsibly.
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
        <div style={{ margin: "28px 0 8px" }}>
          <EmailSignup
            compact
            source={"rakeback"}
            eyebrow="Monthly email"
            title={"Hear when rakeback rates change"}
            sub={"When a casino changes its rakeback, a code boost or how often you can claim, it's in our monthly email with the source. One email a month, unsubscribe any time."}
            button={"Get the monthly email"}
          />
        </div>
        <NextSteps
          steps={[
            { href: "/promo-codes", label: "Every promo code", hint: "What each casino's code gets you, rakeback boosts included." },
            { href: "/lowest-wagering", label: "Lowest wagering", hint: "Casinos where your deposit is free to withdraw soonest." },
            { href: "/races", label: "Races and raffles", hint: "The other way casinos pay regular players back." },
          ]}
        />
      </section>
    </main>
  );
}
