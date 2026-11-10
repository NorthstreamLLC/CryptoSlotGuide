import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { brandFor } from "@/lib/casino-facts";
import { reviewPath } from "@/lib/outbound";
import { INDEX_ROWS, UNLOCK_ROWS, UNCLEAR_SLUGS, NO_WAGER_SLUGS, DEPOSIT, RTP, BASE_LABEL, cost, type IndexRow } from "@/lib/bonus-index";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";

/**
 * The Bonus True-Cost Index: every first-deposit match bonus whose terms state
 * the match, the multiplier and what it applies to, worked out per $100
 * deposited. A link asset like the Curaçao tracker: one page, only the data,
 * each row sourced to the casino's own terms. Rows live in lib/bonus-index.ts.
 */
const PATH = "/bonuses/true-cost-index";
const TITLE = "Crypto casino bonus true-cost index: what each welcome bonus really costs";
const PUBLISHED = "2026-11-10";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const signed = (n: number) => (Math.round(n) < 0 ? `−${usd(-n)}` : `+${usd(n)}`);
const pct = (n: number) => `${(n * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
const fmtDate = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const opName = (slug: string) => siteData.ops.find((o) => o.slug === slug)?.name ?? slug;
const opMono = (slug: string) => siteData.ops.find((o) => o.slug === slug)?.mono ?? slug.slice(0, 2).toUpperCase();
const casinoHref = (slug: string) => (siteData.ops.some((o) => o.slug === slug) ? reviewPath(slug) : "/bonuses");
/** First clause of a stored fact, for a one-line detail. */
const clause = (v?: string) => v?.split(/;\s|\.\s/)[0].replace(/\.$/, "");

type Built = IndexRow & ReturnType<typeof cost> & { name: string; mono: string; source?: string; asOf?: string; maxBet?: string; maxCashout?: string };

function built(): Built[] {
  return INDEX_ROWS.flatMap((r) => {
    const w = getSpecFact(r.slug, "Bonus terms", "Wagering");
    if (!w) return [];
    const m = getSpecFact(r.slug, "Bonus terms", r.matchFrom);
    const asOf = [w.asOf, m?.asOf].filter(Boolean).sort().pop();
    return [{ ...r, ...cost(r), name: opName(r.slug), mono: opMono(r.slug), source: w.sourceUrl, asOf, maxBet: clause(getSpecFact(r.slug, "Bonus terms", "Max bet")?.value), maxCashout: clause(getSpecFact(r.slug, "Bonus terms", "Max cashout")?.value) }];
  }).sort((a, b) => b.net - a.net || a.name.localeCompare(b.name));
}

function summary(rows: Built[]) {
  const costs = rows.map((r) => r.expectedCost);
  const positive = rows.filter((r) => r.net > 0).length;
  const edge = rows.filter((r) => r.edgeBase).length;
  const top = rows[0].net;
  const bottom = rows[rows.length - 1].net;
  return { n: rows.length, minCost: Math.min(...costs), maxCost: Math.max(...costs), positive, edge, best: rows.filter((x) => x.net === top), worst: rows.filter((x) => x.net === bottom), top, bottom };
}

export function generateMetadata() {
  const r = built();
  const s = summary(r);
  return pageMetadata(
    TITLE,
    `For a $${DEPOSIT} deposit, ${s.n} crypto casino welcome bonuses ask for between ${usd(Math.min(...r.map((x) => x.bets)))} and ${usd(Math.max(...r.map((x) => x.bets)))} of bets. At a ${pct(RTP)} RTP slot that costs ${usd(s.minCost)}–${usd(s.maxCost)} on average: more than the bonus in ${s.positive ? `${s.n - s.positive} of ${s.n}` : `all ${s.n}`}. From each casino's own terms.`,
    PATH
  );
}

const CSS = `
.bi-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.bi-narrow { max-width: 760px; }
.bi-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 24px; }
.bi-crumb a { color: #8E9CA4; }
.bi-h1 { margin: 0 0 16px; font-size: clamp(34px, 4.4vw, 50px); line-height: 1.06; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.bi-lead { margin: 0 0 22px; max-width: 64ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.bi-answer { margin: 28px 0 0; padding: 20px 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; box-shadow: inset 0 2px 0 #FFC531; }
.bi-answer b { display: block; margin-bottom: 6px; font-size: 15px; color: #F2F5F7; }
.bi-answer p { margin: 0; font-size: 15px; line-height: 1.65; color: #B7C4CB; }
.bi-sec { padding-top: 64px; }
.bi-h2 { margin: 0 0 8px; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.bi-sub { margin: 0 0 20px; max-width: 72ch; font-size: 15px; line-height: 1.6; color: #8E9CA4; }
.bi-p { margin: 0 0 14px; font-size: 16px; line-height: 1.7; color: #C9D3D8; }
.bi-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.bi-item + .bi-item { border-top: 1px solid rgba(255,255,255,.06); }
.bi-row { display: grid; grid-template-columns: minmax(0, 1.1fr) 112px minmax(0, 1.1fr) 90px 90px 96px 96px 64px; gap: 12px; align-items: center; padding: 12px 18px 4px; font-size: 14px; color: #DCE3E7; font-variant-numeric: tabular-nums; }
.bi-head .bi-row { padding: 12px 18px; font-size: 12px; color: #75828A; }
.bi-name { display: flex; align-items: center; gap: 10px; min-width: 0; font-weight: 600; color: #F2F5F7; }
.bi-name:hover { text-decoration: underline; text-underline-offset: 3px; }
.bi-chip { display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 12.5px; font-weight: 600; line-height: 1.35; }
.bi-cell small { display: none; }
.bi-src { font-size: 12px; color: #5FE3E8; }
.bi-detail { padding: 0 18px 12px 56px; font-size: 12.5px; line-height: 1.55; color: #75828A; }
.bi-list { margin: 0; padding: 0; list-style: none; }
.bi-list li { padding: 14px 18px; font-size: 14.5px; line-height: 1.6; color: #C9D3D8; }
.bi-list li + li { border-top: 1px solid rgba(255,255,255,.06); }
.bi-list b { color: #F2F5F7; }
.bi-faq details { padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
.bi-faq summary { cursor: pointer; font-size: 16px; font-weight: 600; color: #F2F5F7; }
.bi-faq p { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: #98A6AE; }
@media (max-width: 900px) {
  .bi-wrap { padding: 0 16px; }
  .bi-head { display: none; }
  .bi-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px 14px; padding: 14px 16px 4px; }
  .bi-name { grid-column: 1 / -1; }
  .bi-cell small { display: block; font-size: 11.5px; color: #75828A; }
  .bi-detail { padding: 0 16px 14px; }
}
`;

const POS = { c: "#57E39A", bg: "rgba(87,227,154,.12)" };
const NEG = { c: "#FF7E7E", bg: "rgba(255,126,126,.12)" };
const MID = { c: "#FFC531", bg: "rgba(255,197,49,.12)" };

/** "A", "A and B", "A, B and C". */
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

export default function Page() {
  const r = built();
  const s = summary(r);
  const updated = [PUBLISHED, ...r.map((x) => x.asOf ?? "")].sort().pop()!;
  const checked = r.map((x) => x.asOf).filter((d): d is string => !!d).sort();
  const unlock = UNLOCK_ROWS.flatMap((u) => {
    const f = getSpecFact(u.slug, "Bonus terms", u.from);
    if (!f) return [];
    const bonus = DEPOSIT * u.match;
    return [{ ...u, name: opName(u.slug), bonus, bets: bonus * u.per, back: 1 / u.per, source: f.sourceUrl }];
  });
  const unclear = UNCLEAR_SLUGS.flatMap((slug) => {
    const f = getSpecFact(slug, "Bonus terms", "Wagering");
    return f ? [{ slug, name: opName(slug), text: f.value, source: f.sourceUrl }] : [];
  });
  const noWager = NO_WAGER_SLUGS.filter((slug) => getSpecFact(slug, "Bonus terms", "Wagering"));
  const ewNames = r.filter((x) => x.edgeBase).map((x) => x.name);
  const faqs = [
    {
      q: "What does \"40× wagering\" actually mean in dollars?",
      a: `It depends on what the 40× applies to. On a $${DEPOSIT} deposit with a 100% match, 40× the deposit plus the bonus means ${usd(40 * 2 * DEPOSIT)} of bets; 40× the bonus alone means ${usd(40 * DEPOSIT)}. The terms say which, and that line changes the cost more than the multiplier does.`,
    },
    {
      q: "Is any crypto casino welcome bonus worth taking?",
      a: s.positive
        ? `On these figures, ${s.positive} of ${s.n} pay more than finishing their wagering costs on average at a ${pct(RTP)} RTP slot.`
        : `On average, none of the ${s.n} here pays more than finishing its wagering costs at a ${pct(RTP)} RTP slot. The closest ${s.best.length > 1 ? "are" : "is"} ${list(s.best.map((x) => x.name))}, at ${signed(s.top)} on a $${DEPOSIT} deposit. A bonus can still suit you if you'd bet that much anyway: then the bonus is a rebate on play you'd do regardless.`,
    },
    {
      q: "What is the break-even RTP?",
      a: "The return to player a game would need for the bonus to pay for its own wagering on average: 1 minus the bonus divided by the bets required. If no game you're allowed to play has that RTP, the bonus costs more than it gives, on average.",
    },
    {
      q: "Why do some rows have no break-even RTP?",
      a: `${list(ewNames)} count each bet by the game's house edge (a low-edge game counts less). That makes the expected cost of finishing the wagering the same whatever you play, so no game choice can make the bonus pay.`,
    },
    {
      q: "How often is this updated?",
      a: "Every month, when we re-check each casino's bonus terms against its own pages. Each row links to the terms it was read from.",
    },
  ];

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 80 }}>
      <style>{CSS}</style>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Bonuses", path: "/bonuses" }, { name: "Bonus true-cost index", path: PATH }]),
          articleSchema(TITLE, `What each crypto casino welcome bonus asks for per $${DEPOSIT} deposited, from its own terms.`, PATH, PUBLISHED, updated),
          faqSchema(faqs),
        ]}
      />

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(255,197,49,.05), transparent 70%), #0A0D10" }}>
        <div className="bi-wrap" style={{ padding: "30px 24px 44px" }}>
          <div className="bi-crumb">
            <Link href="/">Home</Link> / <Link href="/bonuses">Bonuses</Link> / <span style={{ color: "#AEBAC1" }}>Bonus true-cost index</span>
          </div>
          <h1 className="bi-h1">Bonus true-cost index: what each welcome bonus really costs</h1>
          <p className="bi-lead">
            A &quot;100% bonus&quot; is a loan you repay in bets. This index works out, for each crypto casino welcome bonus, how much you have to bet on a ${DEPOSIT} deposit and what that betting costs on average, from each casino&apos;s own terms.
          </p>
          <AuthorByline updated={updated} />
          <div className="bi-answer">
            <b>The short answer</b>
            <p>
              On a ${DEPOSIT} deposit, the {s.n} bonuses here ask for {usd(Math.min(...r.map((x) => x.bets)))} to {usd(Math.max(...r.map((x) => x.bets)))} of bets. At a {pct(RTP)} RTP slot, finishing that costs {usd(s.minCost)} to {usd(s.maxCost)} on average, which is more than the bonus in {s.positive ? `${s.n - s.positive} of ${s.n}` : `all ${s.n}`} cases. The cheapest {s.best.length > 1 ? "are" : "is"} {list(s.best.map((x) => x.name))} ({signed(s.top)}); the most expensive {s.worst.length > 1 ? "are" : "is"} {list(s.worst.map((x) => x.name))} ({signed(s.bottom)}).
            </p>
          </div>
        </div>
      </div>

      <div className="bi-wrap">
        <section className="bi-sec">
          <h2 className="bi-h2">The index, per ${DEPOSIT} deposited</h2>
          <p className="bi-sub">
            Bonus minus cost is what the bonus is worth after the expected cost of its wagering, if you finish it at a {pct(RTP)} RTP slot ({ewNames.length} casinos fix the cost by house edge instead, whatever you play). Break-even RTP is how high a game&apos;s RTP would need to be for the bonus to pay. Best first.
          </p>
          <div className="bi-box">
            <div className="bi-head">
              <div className="bi-row" data-keep-grid>
                <span>Casino</span><span>Bonus</span><span>Wagering</span><span>Bets needed</span><span>Expected cost</span><span>Bonus minus cost</span><span>Break-even RTP</span><span>Source</span>
              </div>
            </div>
            {r.map((x) => {
              const tone = x.net > 0 ? POS : x.net > -50 ? MID : NEG;
              return (
                <div key={x.slug} className="bi-item">
                  <div className="bi-row" data-keep-grid>
                    <Link href={casinoHref(x.slug)} className="bi-name">
                      <span style={{ width: 28, height: 28, flex: "none", borderRadius: 7, overflow: "hidden" }}>
                        <BrandMark slug={x.slug} mono={x.mono} tint={brandFor(x.slug)} radius={7} fontSize={9} />
                      </span>
                      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.name}</span>
                    </Link>
                    <span className="bi-cell"><small>Bonus</small>{usd(x.bonus)} <span style={{ color: "#75828A" }}>({Math.round(x.match * 100)}%)</span></span>
                    <span className="bi-cell"><small>Wagering</small>{x.mult}× {BASE_LABEL[x.base]}</span>
                    <span className="bi-cell"><small>Bets needed</small>{usd(x.bets)}</span>
                    <span className="bi-cell"><small>Expected cost</small>{usd(x.expectedCost)}</span>
                    <span className="bi-cell"><small>Bonus minus cost</small><span className="bi-chip" style={{ color: tone.c, background: tone.bg }}>{signed(x.net)}</span></span>
                    <span className="bi-cell"><small>Break-even RTP</small>{x.breakEven === null ? <span style={{ color: "#75828A" }}>None</span> : pct(x.breakEven)}</span>
                    {x.source ? <a href={x.source} target="_blank" rel="noopener noreferrer nofollow" className="bi-src">Terms ↗</a> : <span />}
                  </div>
                  <div className="bi-detail">
                    {[x.edgeBase ? `Bets count by house edge against ${pct(x.edgeBase)}, so the cost is the same on every game.` : null, x.note, x.maxBet ? `Max bet: ${x.maxBet}.` : null, x.maxCashout ? `Max cashout: ${x.maxCashout}.` : null].filter(Boolean).join(" ")}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 13, lineHeight: 1.6, color: "#75828A" }}>
            Assumes the full match on a ${DEPOSIT} first deposit and that you finish the wagering. The expected cost is an average: any single run can win or lose far more, and busting early ends the wagering for less. Game weighting, max-bet and max-cashout rules (in each row) can make a bonus worth less still. To run your own deposit or RTP, use the <Link href="/bonus-terms-decoder" style={{ color: "#5FE3E8" }}>bonus terms decoder</Link>.
          </p>
        </section>

        {unlock.length > 0 && (
          <section className="bi-sec bi-narrow">
            <h2 className="bi-h2">Bonuses that unlock as you bet</h2>
            <p className="bi-sub">These pay a slice of the bonus with every bet rather than all at once after a multiplier, so they work like a small rebate on your betting. Compare that rebate with the house edge.</p>
            <ul className="bi-list bi-box">
              {unlock.map((u) => (
                <li key={u.slug}>
                  <b><Link href={casinoHref(u.slug)}>{u.name}</Link></b>: a {Math.round(u.match * 100)}% match ({usd(u.bonus)} on ${DEPOSIT}) that unlocks at $1 per {usd(u.per)} wagered, which is {pct(u.back)} of each bet back. Unlocking all of it takes {usd(u.bets)} of bets, which costs {usd(u.bets * (1 - RTP))} on average at a {pct(RTP)} RTP slot.{" "}
                  {u.source && <a href={u.source} target="_blank" rel="noopener noreferrer nofollow" className="bi-src">Terms ↗</a>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {unclear.length > 0 && (
          <section className="bi-sec bi-narrow">
            <h2 className="bi-h2">Left out: the terms aren&apos;t clear</h2>
            <p className="bi-sub">These welcome bonuses don&apos;t say clearly what the multiplier applies to, which can double the bets needed, or give two different multipliers. Ask support before you opt in.</p>
            <ul className="bi-list bi-box">
              {unclear.map((u) => (
                <li key={u.slug}>
                  <b><Link href={casinoHref(u.slug)}>{u.name}</Link></b>: {u.text}{" "}
                  {u.source && <a href={u.source} target="_blank" rel="noopener noreferrer nofollow" className="bi-src">Terms ↗</a>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bi-sec bi-narrow">
          <h2 className="bi-h2">If you don&apos;t want wagering at all</h2>
          <p className="bi-p">
            {list(noWager.map(opName))} skip the deposit match and pay rewards such as rakeback or cashback with little or no wagering. They&apos;re listed with their terms on <Link href="/lowest-wagering" style={{ color: "#5FE3E8" }}>bonuses you can actually cash out</Link> and <Link href="/rakeback-casinos" style={{ color: "#5FE3E8" }}>the best rakeback casinos</Link>.
          </p>
        </section>

        <section className="bi-sec bi-narrow">
          <h2 className="bi-h2">How the numbers work</h2>
          <p className="bi-p">Bets needed is the multiplier times what it applies to: on a ${DEPOSIT} deposit with a 100% match, 40× the deposit plus the bonus is 40 × $200 = $8,000. Expected cost is those bets times the house edge, {pct(1 - RTP)} at a {pct(RTP)} RTP slot, so $8,000 of bets costs $320 on average against a $100 bonus.</p>
          <p className="bi-p">Some casinos count each bet by its game&apos;s house edge against a baseline (a 1% edge game counts a quarter as much against a 4% baseline). That stops players clearing the bonus on low-edge games, and it fixes the expected cost at the baseline times the wagering, whatever you play.</p>
          <p className="bi-p">Every multiplier and base is read from one stored fact per casino, with the link to the terms it came from. This version uses terms checked between {fmtDate(checked[0])} and {fmtDate(checked[checked.length - 1])}.</p>
        </section>

        <section className="bi-sec bi-narrow">
          <h2 className="bi-h2" style={{ marginBottom: 12 }}>Questions</h2>
          <div className="bi-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p style={{ margin: "28px 0 0", fontSize: 14, lineHeight: 1.6, color: "#8E9CA4" }}>
            Using these figures? Cite and link this page; it&apos;s updated monthly. Corrections go to our <Link href="/corrections" style={{ color: "#C9D3D8" }}>corrections log</Link>.
          </p>
          <div style={{ margin: "36px 0" }}>
            <AuthorBox />
          </div>
          <NextSteps
            steps={[
              { href: "/bonuses", label: "Every tracked bonus", hint: "Each casino's welcome offer with its full terms." },
              { href: "/lowest-wagering", label: "Bonuses you can cash out", hint: "No-wagering and 1× offers." },
              { href: "/crypto-casino-withdrawals-explained", label: "How withdrawals work", hint: "Times, limits and fees at 44 casinos." },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
