import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { payoutView, comparePayout } from "@/lib/payout";
import { brandFor, casinoFacts, maxWithdrawal } from "@/lib/casino-facts";
import { coinHref } from "@/lib/coins";
import { reviewPath } from "@/lib/outbound";
import { pageMetadata } from "@/lib/seo";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { AuthorByline, AuthorBox } from "@/components/ui/AuthorBox";
import { NextSteps } from "@/components/layout/NextSteps";
import { GuideNextStep } from "@/components/ui/NextStep";

/**
 * The withdrawals guide, at the address the old WordPress article ranked on
 * ("bitcoin casino withdrawal", position ~20 in Search Console, Nov 2026).
 * It replaces that article's unsourced prose: every casino figure below is the
 * casino's own stated wording from the spec sheets, every coin figure is from
 * that network's own documentation (data/coinDefs.json), so the page updates
 * whenever the monthly re-check does.
 */
const PATH = "/crypto-casino-withdrawals-explained";
const TITLE = "Crypto casino withdrawals: how long they take, fees and limits";
const PUBLISHED = "2026-04-02";
/** When this page was last rewritten; "updated" is this or the newest fact it shows, whichever is later. */
const REWRITTEN = "2026-11-05";

const KYC_LABEL = { none: "No KYC", tiered: "At a threshold", required: "Required" } as const;

/** Casinos with a stated withdrawal time on file, fastest first. */
function rows() {
  return [...siteData.ops]
    .filter((o) => getSpecFact(o.slug, "Payouts & fees", "Stated withdrawal time"))
    .sort(comparePayout)
    .map((o) => {
      const f = casinoFacts(o);
      const pv = payoutView(o);
      const stated = getSpecFact(o.slug, "Payouts & fees", "Stated withdrawal time")!;
      return {
        o,
        time: pv.label !== "Not stated" ? pv.label : "See terms",
        mins: pv.mins,
        min: f.minWithdrawal ?? "See terms",
        max: maxWithdrawal(o.slug) ?? (getSpecFact(o.slug, "Payouts & fees", "Withdrawal limits") ? "See terms" : "Not stated"),
        fee: f.fee ?? "Not stated",
        kyc: getSpecFact(o.slug, "Compliance", "KYC policy") ? KYC_LABEL[o.kyc] : "Not stated",
        source: stated.sourceUrl,
        asOf: stated.asOf,
      };
    });
}

/** Rules that hold a withdrawal up, each quoted from one casino's own terms. */
const HOLDUPS: { slug: string; group: string; label: string; title: string; match: RegExp }[] = [
  { slug: "roobet", group: "Payouts & fees", label: "Withdrawal limits", title: "Deposits must be wagered first", match: /wagered/i },
  { slug: "wager-com", group: "Payouts & fees", label: "Withdrawal fees", title: "Withdrawing an unwagered deposit can cost you", match: /8%|commission/i },
  { slug: "razed", group: "Compliance", label: "KYC policy", title: "ID checks arrive at withdrawal", match: /ID|KYC/ },
  { slug: "jackpotbet", group: "Payouts & fees", label: "Payout caps", title: "Big wins can be paid in instalments", match: /instalment/i },
  { slug: "shuffle", group: "Payouts & fees", label: "Withdrawal limits", title: "Same wallet, same network", match: /same (wallet|network)/i },
];

/** The sentence of a cited value that carries the rule a hold-up card is about. */
const pick = (t: string, re: RegExp) => {
  const parts = t.split(/(?<=[.;])\s+(?=[A-Z])/);
  return first(parts.find((p) => re.test(p)) ?? parts[0]);
};

const host = (u?: string) => (u ? new URL(u).hostname.replace(/^www\./, "") : "");
const first = (t: string) => {
  const s = t.split(/(?<=[.;])\s+(?=[A-Z])/)[0].replace(/;$/, "").trim();
  return /[.!?)"]$/.test(s) ? s : `${s}.`;
};

export function generateMetadata() {
  const r = rows();
  const fast = r.filter((x) => x.mins !== null && x.mins <= 60).length;
  return pageMetadata(
    TITLE,
    `How long crypto casino withdrawals really take, what they cost and what holds them up. Stated withdrawal times, minimums, maximums and fees for ${r.length} casinos (${fast} say an hour or less), each from the casino's own terms.`,
    PATH
  );
}

const CSS = `
.wg-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.wg-narrow { max-width: 760px; }
.wg-crumb { font-size: 13px; color: #6F7C84; margin-bottom: 24px; }
.wg-crumb a { color: #8E9CA4; }
.wg-h1 { margin: 0 0 16px; font-size: clamp(34px, 4.4vw, 50px); line-height: 1.06; letter-spacing: -.04em; font-weight: 700; color: #F7F9FA; text-wrap: balance; }
.wg-lead { margin: 0 0 22px; max-width: 62ch; font-size: 17.5px; line-height: 1.6; color: #98A6AE; }
.wg-answer { margin: 28px 0 0; padding: 20px 22px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; box-shadow: inset 0 2px 0 #57E39A; }
.wg-answer b { display: block; margin-bottom: 6px; font-size: 15px; color: #F2F5F7; }
.wg-answer p { margin: 0; font-size: 15px; line-height: 1.65; color: #B7C4CB; }
.wg-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; }
.wg-stats div { padding: 14px 16px; }
.wg-stats div + div { border-left: 1px solid rgba(255,255,255,.08); }
.wg-stats b { display: block; font-size: 24px; font-weight: 700; letter-spacing: -.02em; color: #F2F5F7; }
.wg-stats small { display: block; margin-top: 2px; font-size: 12.5px; color: #8E9CA4; }
.wg-sec { padding-top: 72px; scroll-margin-top: 100px; }
.wg-h2 { margin: 0 0 8px; font-size: 26px; letter-spacing: -.025em; font-weight: 700; color: #F2F5F7; }
.wg-sub { margin: 0 0 20px; max-width: 70ch; font-size: 15px; line-height: 1.6; color: #8E9CA4; }
.wg-p { margin: 0 0 14px; font-size: 16px; line-height: 1.7; color: #C9D3D8; }
.wg-box { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: #0D1114; overflow: hidden; }
.wg-row { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.1fr) minmax(0, .8fr) minmax(0, .8fr) minmax(0, .8fr) minmax(0, .8fr) auto; gap: 16px; align-items: center; padding: 12px 18px; font-size: 14px; color: #DCE3E7; }
.wg-row + .wg-row { border-top: 1px solid rgba(255,255,255,.06); }
.wg-row.wg-head { font-size: 12px; font-weight: 500; color: #75828A; padding-top: 12px; padding-bottom: 12px; }
.wg-name { display: flex; align-items: center; gap: 10px; min-width: 0; font-weight: 600; color: #F2F5F7; }
.wg-name:hover { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
.wg-src { font-size: 12px; color: #5FE3E8; white-space: nowrap; }
.wg-cell small { display: none; }
.wg-coins { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.wg-coin { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; }
.wg-coin b { font-size: 15.5px; color: #F2F5F7; }
.wg-coin span { font-size: 13.5px; line-height: 1.45; color: #AEBAC1; }
.wg-coin em { font-style: normal; color: #75828A; }
.wg-holds { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
.wg-hold { padding: 18px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0D1114; }
.wg-hold b { display: block; margin-bottom: 6px; font-size: 15.5px; color: #F2F5F7; }
.wg-hold p { margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #AEBAC1; }
.wg-faq details { padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
.wg-faq summary { cursor: pointer; font-size: 16px; font-weight: 600; color: #F2F5F7; }
.wg-faq p { margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: #98A6AE; }
@media (max-width: 960px) {
  .wg-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wg-stats div:nth-child(3) { border-left: 0; }
  .wg-stats div:nth-child(n+3) { border-top: 1px solid rgba(255,255,255,.08); }
  .wg-coins { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wg-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px 14px; padding: 14px 16px; }
  .wg-row.wg-head { display: none; }
  .wg-name { grid-column: 1 / -1; }
  .wg-cell small { display: block; font-size: 11.5px; color: #75828A; }
}
@media (max-width: 560px) { .wg-wrap { padding: 0 16px; } .wg-coins { grid-template-columns: 1fr; } }
`;

export default function Page() {
  const r = rows();
  const fast = r.filter((x) => x.mins !== null && x.mins <= 60).length;
  const instant = r.filter((x) => /instant|seconds|immediate/i.test(x.time)).length;
  const free = r.filter((x) => x.fee === "Free").length;
  // "No max stated" means the casino publishes none, not that there is none.
  const noMax = r.filter((x) => /^no (max|cap|limit)/i.test(x.max) && !/stated/i.test(x.max)).length;
  const fastest = r.filter((x) => x.mins !== null).slice(0, 5).map((x) => x.o.name);
  const updated = [REWRITTEN, ...r.map((x) => x.asOf).filter((d): d is string => !!d)].sort().pop()!;
  const coins = siteData.coinDefs;
  const holdups = HOLDUPS.flatMap((h) => {
    const f = getSpecFact(h.slug, h.group, h.label);
    const o = siteData.ops.find((x) => x.slug === h.slug);
    return f?.value && f.sourceUrl && o && h.match.test(f.value) ? [{ ...h, o, text: pick(f.value, h.match), url: f.sourceUrl }] : [];
  });

  const faqs = [
    {
      q: "How long do crypto casino withdrawals take?",
      a: `Of the ${r.length} casinos in our table, ${fast} state that crypto withdrawals take an hour or less, and ${instant} describe them as instant or within seconds. After the casino sends, the coin's network adds its own time: about 10 minutes per Bitcoin block, seconds on faster chains. Your first withdrawal can take longer if the casino asks for ID.`,
    },
    {
      q: "Which crypto casino pays out fastest?",
      a: `By their own stated times, the fastest in our table are ${fastest.join(", ")}. These are the casinos' stated times, not our own measurements; each row links to the page the figure comes from.`,
    },
    {
      q: "Do crypto casinos charge withdrawal fees?",
      a: `${free} of the ${r.length} say they charge no withdrawal fee of their own. Most of the rest pass on the network fee, which is paid to the blockchain rather than the casino, and some charge extra in specific cases, such as withdrawing a deposit you haven't wagered.`,
    },
    {
      q: "Is there a maximum withdrawal at crypto casinos?",
      a: `${noMax} of the casinos in our table state no maximum crypto withdrawal. Others cap a single transaction, a day or a month, and some pay very large wins in instalments.`,
    },
    {
      q: "Why is my crypto casino withdrawal pending?",
      a: "The usual reasons, all from the casinos' own terms: the deposit hasn't been wagered the required number of times yet, an ID check has been triggered, the withdrawal is above a limit that needs manual review, or it was sent on a different network from the one you deposited on.",
    },
  ];

  return (
    <main style={{ background: "#080B0D", color: "#E8EDF0", paddingBottom: 80 }}>
      <style>{CSS}</style>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: "Crypto casino withdrawals", path: PATH }]),
          articleSchema(TITLE, "How long crypto casino withdrawals take, what they cost and what holds them up, from each casino's own terms.", PATH, PUBLISHED, updated),
          faqSchema(faqs),
        ]}
      />

      <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)", background: "radial-gradient(60% 80% at 15% 0%, rgba(87,227,154,.06), transparent 70%), #0A0D10" }}>
        <div className="wg-wrap" style={{ padding: "30px 24px 44px" }}>
          <div className="wg-crumb">
            <Link href="/">Home</Link> / <Link href="/guides">Guides</Link> / <span style={{ color: "#AEBAC1" }}>Withdrawals</span>
          </div>
          <h1 className="wg-h1">Crypto casino withdrawals: how long they take, what they cost</h1>
          <p className="wg-lead">The stated withdrawal time, minimum, maximum and fee at {r.length} crypto casinos, each from the casino&apos;s own terms, plus how each coin&apos;s network adds to the wait and the rules that hold a payout up.</p>
          <AuthorByline updated={updated} />
          <div className="wg-answer">
            <b>The short answer</b>
            <p>
              {fast} of the {r.length} casinos here state that crypto withdrawals take an hour or less, and {instant} call them instant or within seconds. The network then adds its own time: about 10 minutes per Bitcoin block, seconds on faster chains. What slows most payouts is not the blockchain but the casino&apos;s rules: unwagered deposits, ID checks and limits.
            </p>
          </div>
          <div className="wg-stats" data-keep-grid>
            <div><b>{fast}</b><small>state an hour or less</small></div>
            <div><b>{instant}</b><small>say instant or seconds</small></div>
            <div><b>{free}</b><small>charge no withdrawal fee</small></div>
            <div><b>{noMax}</b><small>state no maximum</small></div>
          </div>
        </div>
      </div>

      <div className="wg-wrap">
        <section className="wg-sec" id="by-casino">
          <h2 className="wg-h2">Withdrawal times, limits and fees by casino</h2>
          <p className="wg-sub">Fastest stated time first. These are each casino&apos;s own stated figures, not our measurements; the source link on each row opens the page it comes from.</p>
          <div className="wg-box">
            <div className="wg-row wg-head" data-keep-grid>
              <span>Casino</span><span>Stated time</span><span>Minimum</span><span>Maximum</span><span>Fee</span><span>ID check</span><span>Source</span>
            </div>
            {r.map((x) => (
              <div key={x.o.slug} className="wg-row" data-keep-grid>
                <Link href={reviewPath(x.o.slug)} className="wg-name">
                  <span style={{ width: 28, height: 28, flex: "none", borderRadius: 7, overflow: "hidden" }}>
                    <BrandMark slug={x.o.slug} mono={x.o.mono} tint={brandFor(x.o.slug)} radius={7} fontSize={9} />
                  </span>
                  <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.o.name}</span>
                </Link>
                <span className="wg-cell" style={{ fontWeight: 600, color: x.mins !== null && x.mins <= 60 ? "#57E39A" : "#DCE3E7" }}><small>Stated time</small>{x.time}</span>
                <span className="wg-cell"><small>Minimum</small>{x.min}</span>
                <span className="wg-cell"><small>Maximum</small>{x.max}</span>
                <span className="wg-cell"><small>Fee</small>{x.fee}</span>
                <span className="wg-cell"><small>ID check</small>{x.kyc}</span>
                {x.source ? <a href={x.source} target="_blank" rel="noopener noreferrer nofollow" className="wg-src">{host(x.source)} ↗</a> : <span />}
              </div>
            ))}
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 14.5 }}>
            <Link href="/fastest-payouts" style={{ fontWeight: 600, color: "#C9D3D8" }}>See the fastest-payout casinos, with their bonuses →</Link>
          </p>
        </section>

        <section className="wg-sec" id="how-it-works">
          <div className="wg-narrow">
            <h2 className="wg-h2">What happens when you withdraw</h2>
            <p className="wg-p">A crypto withdrawal has two parts. First the casino approves the request and sends the coins: this is the stated time in the table, and where most delays happen. Then the transfer has to be confirmed on the coin&apos;s network before your wallet shows it, which is the part no casino controls.</p>
            <p className="wg-p">The network fee is paid to the blockchain, not the casino. Some casinos absorb it, most deduct it from the amount you withdraw, and the cashier shows it before you confirm. That fee is also why minimum withdrawals exist: below a certain amount the network would take most of it.</p>
          </div>
        </section>

        <section className="wg-sec" id="by-coin">
          <h2 className="wg-h2">How long each coin&apos;s network takes</h2>
          <p className="wg-sub">From each network&apos;s own documentation. Pick a faster chain for small, frequent withdrawals; the casino&apos;s cashier lists which networks it supports for each coin.</p>
          <div className="wg-coins">
            {coins.map((c) => (
              <Link key={c.ticker} href={coinHref(c)} className="wg-coin csg-card">
                <b>{c.name} <em>{c.ticker}</em></b>
                <span><em>Block time:</em> {c.blockTime}</span>
                <span><em>Finality:</em> {c.finality}</span>
                <span><em>Fees:</em> {c.feeModel}</span>
              </Link>
            ))}
          </div>
        </section>

        {holdups.length > 0 && (
          <section className="wg-sec" id="holdups">
            <h2 className="wg-h2">What holds a withdrawal up</h2>
            <p className="wg-sub">The rules that turn an instant payout into a wait, each quoted from one casino&apos;s own terms. Most casinos have some version of each, so check the terms of the one you use.</p>
            <div className="wg-holds">
              {holdups.map((h) => (
                <div key={h.slug + h.label} className="wg-hold">
                  <b>{h.title}</b>
                  <p>
                    <Link href={reviewPath(h.slug)} style={{ color: "#F2F5F7", fontWeight: 600 }}>{h.o.name}</Link>: {h.text}
                  </p>
                  <a href={h.url} target="_blank" rel="noopener noreferrer nofollow" className="wg-src">Source: {host(h.url)} ↗</a>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="wg-sec wg-narrow" id="faq">
          <h2 className="wg-h2" style={{ marginBottom: 12 }}>Questions</h2>
          <div className="wg-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <GuideNextStep category="Payments" />
          <div style={{ margin: "36px 0" }}>
            <AuthorBox />
          </div>
          <NextSteps
            steps={[
              { href: "/fastest-payouts", label: "Fastest-payout casinos", hint: "Ranked on stated withdrawal time, with each casino's bonus." },
              { href: "/guides/kyc-thresholds-explained", label: "When casinos ask for ID", hint: "KYC thresholds and what triggers a check." },
              { href: "/coins", label: "Every coin we track", hint: "Block times, finality and fees by network." },
            ]}
          />
        </section>
      </div>
    </main>
  );
}
