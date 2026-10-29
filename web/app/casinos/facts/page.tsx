import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { inHouseOrder } from "@/lib/house-order";
import { getSpecFact } from "@/lib/spec-sheet";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { brandFor } from "@/lib/casino-facts";
import { FACT_ARTICLES } from "@/lib/fact-articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

/** Every casino with a facts article, in house order, with the facts the hub previews. */
function articles() {
  const ops = siteData.ops.filter((o) => FACT_ARTICLES[o.slug]);
  return inHouseOrder(ops).map((o) => {
    const a = FACT_ARTICLES[o.slug];
    const facts = a.facts.filter((f) => getSpecFact(o.slug, f.group, f.label)?.sourceUrl);
    const updated = facts.map((f) => getSpecFact(o.slug, f.group, f.label)?.asOf).filter((d): d is string => !!d).sort().pop() ?? a.published;
    return { o, a, facts, updated };
  });
}

export function generateMetadata() {
  const n = articles().length;
  return pageMetadata(
    `Crypto casino facts: 10 things to know about ${n} casinos`,
    `Who runs each crypto casino, its licence, rakeback, races and withdrawal rules: ten facts about each of ${n} casinos, every one checked against the casino's own pages or its regulator's register.`,
    "/casinos/facts"
  );
}

export default function Page() {
  const all = articles();
  const total = all.reduce((n, x) => n + x.facts.length, 0);
  const updated = all.map((x) => x.updated).sort().pop();

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Casinos", path: "/crypto-casinos" }, { name: "Facts", path: "/casinos/facts" }]),
          itemListSchema("Crypto casino facts", all.map(({ o }) => ({ name: `10 facts about ${o.name}`, path: `/casinos/${o.slug}/facts` }))),
        ]}
      />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(95,227,232,.12), transparent 60%), radial-gradient(60% 90% at 0% 100%, rgba(255,197,49,.08), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/crypto-casinos" style={{ color: "#83919A" }}>Casinos</Link> / <span style={{ color: "#A8B6BE" }}>Facts</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#5FE3E8", marginBottom: 12 }}>
            {total} facts · {all.length} casinos · every one sourced
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 56px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, color: "#fff" }}>
            Know the casino <span style={{ color: "#5FE3E8" }}>before you sign up</span>
          </h1>
          <p style={{ margin: "0 0 22px", maxWidth: "64ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            Who really runs each crypto casino, what its licence says, how its rakeback and races work, and the rules that catch players out. Ten facts per casino, each linked to the casino&apos;s own pages or its regulator&apos;s register.
          </p>
          <AuthorByline updated={updated} />
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {all.map(({ o, facts }) => {
            const tint = brandFor(o.slug);
            return (
              <Link key={o.slug} href={`/casinos/${o.slug}/facts`} className="csg-more-tile" style={{ ["--tint" as string]: tint, display: "flex", flexDirection: "column", gap: 14, padding: "20px 20px 18px", borderRadius: 16, background: `radial-gradient(110% 70% at 0% 0%, ${tint}1f, transparent 60%), #0C1013`, border: `1px solid ${tint}40`, borderTop: `2px solid ${tint}`, transition: "transform .2s, border-color .2s, box-shadow .2s" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 46, height: 46, flex: "none", borderRadius: 12, overflow: "hidden", boxShadow: `0 8px 22px ${tint}2e` }}>
                    <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={12} fontSize={13} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: tint }}>{facts.length} facts</span>
                    <span style={{ display: "block", fontSize: 19, fontWeight: 800, color: "#fff" }}>{o.name}</span>
                  </span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {facts.slice(0, 3).map((f) => (
                    <span key={f.title} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.4, color: "#C9D4DA" }}>
                      <span aria-hidden style={{ width: 26, height: 26, flex: "none", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: `${tint}18`, border: `1px solid ${tint}33` }}>{f.icon}</span>
                      <span style={{ paddingTop: 3 }}>{f.title}</span>
                    </span>
                  ))}
                </span>
                <span style={{ marginTop: "auto", alignSelf: "flex-start", padding: "7px 13px", borderRadius: 100, background: `${tint}1f`, border: `1px solid ${tint}55`, fontSize: 13, fontWeight: 700, color: tint }}>
                  Read all {facts.length} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ padding: "20px 22px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,197,49,.25)" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: GOLD, marginBottom: 6 }}>HOW WE CHECK THEM</div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: "#B7C4CB" }}>
            Each fact is written from a single entry in our casino records, which holds the page it came from and the date we last read it. Licence facts come from the regulator&apos;s own register where one is published. When a casino changes its terms, the fact and the article change with it.{" "}
            <Link href="/editorial-standards" style={{ color: "#5FE3E8", fontWeight: 700 }}>Our editorial standards →</Link>
          </p>
        </div>
        <div style={{ margin: "36px 0" }}>
          <AuthorBox />
        </div>
        <NextSteps
          steps={[
            { href: "/promo-codes", label: "Every promo code", hint: "What each casino's code gets you and how to claim it." },
            { href: "/crypto-casinos", label: "Compare crypto casinos", hint: "Payout speed, bonus and coins side by side." },
            { href: "/legal", label: "Is it legal where you live?", hint: "Check which casinos accept players in your country." },
          ]}
        />
      </section>
    </main>
  );
}
