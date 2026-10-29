import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { NextSteps } from "@/components/layout/NextSteps";
import { versusPairs, pairSlug, parsePair, versusRows } from "@/lib/versus";
import { brandFor } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";
import type { Operator } from "@/lib/types";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { VERSUS_ANALYSIS } from "@/lib/versus-analysis";
import { hasPromoPage } from "@/lib/promo-pages";
import { hasFactArticle } from "@/lib/fact-articles";
import { CodeChip } from "@/components/ui/CodeChip";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { articleSchema } from "@/lib/schema";

const MONO = "var(--font-jetbrains-mono), monospace";

export function generateStaticParams() {
  return versusPairs().map(([a, b]) => ({ pair: pairSlug(a, b) }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) return {};
  const [a, b] = p;
  // Indexed once the pair has its own written analysis; the bare table stays noindex.
  const analysed = !!VERSUS_ANALYSIS[pair];
  return pageMetadata(
    analysed ? `${a.name} vs ${b.name}: codes, rakeback, races and licence compared` : `${a.name} vs ${b.name}: bonuses, withdrawals and rewards compared`,
    analysed ? `${a.name} or ${b.name}? ${VERSUS_ANALYSIS[pair].verdict} What each code gets you, licences, rakeback, races, VIP and withdrawals, from each casino's own pages.` : `${a.name} or ${b.name}? Welcome offers, wagering, withdrawal speed, races, rakeback, coins, sportsbook and licence side by side, from each casino's own terms.`,
    `/compare/${pair}`,
    undefined,
    analysed ? undefined : { noindex: true }
  );
}

export default async function Page({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = parsePair(pair);
  if (!p) {
    // "stake-vs-roobet" and "roobet-vs-stake" are the same page: send the reversed order to the canonical one.
    const [x, y] = pair.split("-vs-");
    if (x && y && parsePair(pairSlug(y, x))) permanentRedirect(`/compare/${pairSlug(y, x)}`);
    notFound();
  }
  const [a, b] = p;
  const rows = versusRows(a, b);
  const an = VERSUS_ANALYSIS[pair];
  const wins = { a: rows.filter((r) => r.edge === "a").map((r) => r.label), b: rows.filter((r) => r.edge === "b").map((r) => r.label) };
  const others = versusPairs().filter(([x, y]) => (x === a.slug || y === a.slug || x === b.slug || y === b.slug) && pairSlug(x, y) !== pair).slice(0, 12);

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }, { name: `${a.name} vs ${b.name}`, path: `/compare/${pair}` }]),
          ...(an ? [articleSchema(`${a.name} vs ${b.name}`, an.verdict, `/compare/${pair}`, an.published, an.published)] : []),
        ]}
      />
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(60% 120% at 0% 0%, ${brandFor(a.slug)}22, transparent 60%), radial-gradient(60% 120% at 100% 0%, ${brandFor(b.slug)}22, transparent 60%), #0A0D10` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 24px 36px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/compare" style={{ color: "#83919A" }}>Compare</Link> / <span style={{ color: "#A8B6BE" }}>{a.name} vs {b.name}</span>
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            {a.name} vs {b.name}
          </h1>
          {an ? (
            <p style={{ margin: 0, maxWidth: "64ch", fontSize: 18, lineHeight: 1.55, color: "#DCE5E9" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: "#FFC531", marginRight: 8 }}>VERDICT</span>
              {an.verdict}
            </p>
          ) : (
            <p style={{ margin: 0, maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
              Bonuses, wagering, withdrawal speed, races, coins, sportsbook and licence side by side. Every figure comes from each casino&apos;s own terms; where the numbers settle it, the stronger side is marked.
            </p>
          )}
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          {([["a", a], ["b", b]] as const).map(([k, o]) => (
            <Side key={k} o={o} wins={wins[k]} pickIf={an?.pickIf[o.slug]} />
          ))}
        </div>

        <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,.08)", background: "#0C1013", overflow: "hidden" }}>
          <div className="grid grid-cols-[minmax(110px,.8fr)_1fr_1fr]" style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5", gap: 14 }}>
            <span />
            <span>{a.name}</span>
            <span>{b.name}</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.label} className="grid grid-cols-[minmax(110px,.8fr)_1fr_1fr]" style={{ gap: 14, padding: "13px 18px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined, alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".05em", textTransform: "uppercase", color: "#8DA0AA" }}>{r.label}</span>
              {(["a", "b"] as const).map((k) => (
                <span key={k} style={{ fontSize: 14, lineHeight: 1.4, fontWeight: r.edge === k ? 800 : 600, color: r[k] ? (r.edge === k ? "#7BE0B8" : "#E8EDF0") : "#77858E" }}>
                  {r[k] ?? "—"}
                  {r.edge === k && <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 9.5, color: "#2FB67A" }}>BETTER</span>}
                </span>
              ))}
            </div>
          ))}
        </div>

        {an && (
          <>
            {an.sections.map((sec) => (
              <section key={sec.title} style={{ marginTop: 30 }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{sec.title}</h2>
                <p style={{ margin: "0 0 10px", maxWidth: "75ch", fontSize: 15.5, lineHeight: 1.7, color: "#B7C4CB" }}>{sec.body}</p>
                <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {sec.cite.flatMap((c) => {
                    const f = getSpecFact(c.slug, c.group, c.label);
                    return f?.sourceUrl ? [{ c, href: f.sourceUrl }] : [];
                  }).map(({ c, href }) => (
                    <a key={c.slug + c.label} href={href} target="_blank" rel="noopener noreferrer nofollow" style={{ padding: "4px 10px", borderRadius: 100, border: `1px solid ${brandFor(c.slug)}44`, fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>
                      {nameOf(c.slug)} · {c.label.toLowerCase()} ↗
                    </a>
                  ))}
                </span>
              </section>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginTop: 34 }}>
              {[a, b].map((o) => <Claim key={o.slug} o={o} />)}
            </div>
          </>
        )}

        {others.length > 0 && (
          <>
            <h2 style={{ margin: "34px 0 12px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>More comparisons</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {others.map(([x, y]) => (
                <Link key={pairSlug(x, y)} href={`/compare/${pairSlug(x, y)}`} style={{ padding: "8px 13px", borderRadius: 100, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", fontSize: 13, fontWeight: 600, color: "#C6D1D7" }}>
                  {nameOf(x)} vs {nameOf(y)}
                </Link>
              ))}
            </div>
          </>
        )}

        <NextSteps
          steps={[
            { href: `/casinos/${a.slug}`, label: `The full ${a.name} report`, hint: "Bonus terms, payout limits and licence, each linked to its source." },
            { href: `/casinos/${b.slug}`, label: `The full ${b.name} report`, hint: "Bonus terms, payout limits and licence, each linked to its source." },
            ...[a, b].filter((o) => hasFactArticle(o.slug)).map((o) => ({ href: `/casinos/${o.slug}/facts`, label: `10 facts about ${o.name}`, hint: "Who runs it, its licence and the rules that catch players out." })),
            { href: "/crypto-casinos", label: "All crypto casinos", hint: "Filter by payout speed, KYC, wagering and sportsbook." },
            { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and rewards with the wagering each one carries." },
          ]}
        />
      </section>
    </main>
  );
}

const nameOf = (slug: string) => siteData.ops.find((o) => o.slug === slug)?.name ?? slug;

function Side({ o, wins, pickIf }: { o: Operator; wins: string[]; pickIf?: string[] }) {
  const brand = brandFor(o.slug);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderRadius: 16, background: `radial-gradient(120% 90% at 100% 0%, ${brand}1a, transparent 60%), #0C1013`, border: `1px solid ${brand}40` }}>
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 40, height: 40, flex: "none", borderRadius: 10, overflow: "hidden" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={10} fontSize={12} />
        </span>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{o.name}</span>
      </span>
      <span style={{ fontSize: 15.5, lineHeight: 1.3, fontWeight: 800, color: "#fff" }}>{o.bonusShort ?? o.bonus}</span>
      {pickIf ? (
        <span style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: brand }}>PICK {o.name.toUpperCase()} IF</span>
          {pickIf.map((t) => (
            <span key={t} style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: 1.45, color: "#DCE5E9" }}>
              <span aria-hidden style={{ color: brand, fontWeight: 800 }}>✓</span>
              {t}
            </span>
          ))}
        </span>
      ) : (
        <span style={{ fontSize: 13, color: "#8DA0AA" }}>{wins.length ? `Better on: ${wins.join(", ").toLowerCase()}` : "Level on the measurable rows"}</span>
      )}
      <Link href={`/casinos/${o.slug}`} style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 14px", borderRadius: 10, background: o.featured ? brand : "#00C2CC", color: "#0A0D0F", fontSize: 13.5, fontWeight: 800 }}>
        View {o.name} offer <Icon name="arrow" size={14} />
      </Link>
    </div>
  );
}

/** The sign-up box for one side of an analysed pair: its code, the claim link and its code page. */
function Claim({ o }: { o: Operator }) {
  const brand = brandFor(o.slug);
  const code = o.affiliate && o.signupUrl ? o.promoCode : null;
  if (!code) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 22px", borderRadius: 16, background: `radial-gradient(90% 120% at 0% 0%, ${brand}1c, transparent 60%), #0F1418`, border: "1px solid rgba(255,197,49,.3)" }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Sign up at {o.name} with {code}</span>
      <span style={{ fontSize: 14, lineHeight: 1.5, color: "#A8B6BE" }}>{o.codePerk?.short ?? o.bonusShort ?? o.bonus}</span>
      <CodeChip code={code} tint="#FFC531" />
      <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
        <a href={o.signupUrl!} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code} style={{ padding: "12px 18px", borderRadius: 11, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 14.5, fontWeight: 800 }}>Claim at {o.name} ↗</a>
        {hasPromoPage(o.slug) && <Link href={`/promo-codes/${o.slug}`} style={{ fontSize: 13.5, fontWeight: 700, color: "#FFD36B" }}>How the code works →</Link>}
      </span>
      <GeoBlockNote slug={o.slug} name={o.name} compact />
    </div>
  );
}
