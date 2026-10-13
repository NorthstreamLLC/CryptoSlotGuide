import Link from "next/link";
import type { Operator } from "@/lib/types";
import { siteData } from "@/lib/site-data";
import { inHouseOrder } from "@/lib/house-order";
import { casinoFacts, brandFor, licenceLabel } from "@/lib/casino-facts";
import { getSpecFact } from "@/lib/spec-sheet";
import { payoutView } from "@/lib/payout";
import { wagerView } from "@/lib/wager";
import { raceFor } from "@/lib/races";
import { topSlotRows } from "@/lib/slot-page";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BrandMark } from "@/components/ui/BrandMark";
import { CoinStack } from "@/components/ui/CoinIcon";
import { CodeChip } from "@/components/ui/CodeChip";
import { VipClaim } from "@/components/ui/VipClaim";
import { OfferCta } from "@/components/ui/OfferCta";
import { AuthorBox, AuthorByline } from "@/components/ui/AuthorBox";
import { SlotArtCards } from "@/components/home/SlotArtCards";
import { NextSteps } from "@/components/layout/NextSteps";

const PATH = "/slots/best-crypto-slot-sites";
const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

export const metadata = pageMetadata(
  "Best crypto slot sites: where to play slots with crypto",
  "The crypto casinos we recommend for slots, compared on withdrawal speed, fees, coins, KYC and rewards, every figure from each casino's own pages. Plus how crypto slots work and how to pick a site.",
  PATH
);

const firstClause = (s?: string | null) => (s ? s.split(/(?<=\.)\s|;/)[0].replace(/\.$/, "").trim() : null);

/** What we like and don't, each line from one fact in the casino's own spec sheet. */
function likes(o: Operator) {
  const f = casinoFacts(o);
  const pv = payoutView(o);
  const wv = wagerView(o);
  const like: string[] = [];
  const dislike: string[] = [];
  if (pv.kind !== "none" && /instant/i.test(pv.label)) like.push("States instant crypto withdrawals");
  else if (f.withdrawals) like.push(`Withdrawals stated at ${f.withdrawals}`);
  if (f.fee === "Free") like.push("No casino fee on crypto withdrawals, network fees only");
  if (f.minDeposit === "No minimum") like.push("No minimum on crypto deposits");
  else if (f.minDeposit === "$0.01") like.push("Deposits from $0.01");
  if (o.ln) like.push("Takes Bitcoin over Lightning");
  if (f.coins.length >= 10) like.push(`${f.coins.length} coins accepted`);
  const race = raceFor(o.slug);
  if (race) like.push(`${race.label}`);
  if (o.kyc === "none") like.push("No KYC for crypto play, per its terms");
  if (o.sports) like.push("Sportsbook on the same balance");

  if (o.kyc === "required") dislike.push("ID check required before the first withdrawal");
  if (f.fee && f.fee !== "Free") dislike.push(`Withdrawal fee: ${f.fee}`);
  if (f.minDeposit && /^\$(\d+)/.test(f.minDeposit) && Number(f.minDeposit.slice(1)) >= 20) dislike.push(`Minimum deposit ${f.minDeposit}`);
  if (wv.mult && wv.mult >= 35) dislike.push(`Bonus wagering ${wv.label}`);
  if (f.coins.length && f.coins.length < 6) dislike.push(`Only ${f.coins.length} coins`);
  if (!pv || pv.kind === "none") dislike.push("Withdrawal time not stated");
  if (f.minWithdrawal && /see terms/i.test(f.minWithdrawal)) dislike.push("Minimum withdrawal only shown in the cashier");
  return { like: like.slice(0, 5), dislike: dislike.slice(0, 3) };
}

function infoRows(o: Operator): [string, React.ReactNode][] {
  const f = casinoFacts(o);
  const company = firstClause(getSpecFact(o.slug, "Compliance", "Company")?.value as string | undefined);
  const restricted = getSpecFact(o.slug, "Bonus terms", "Restricted countries")?.value as string | undefined;
  const rows: [string, React.ReactNode][] = [
    ["Licence", licenceLabel(o.licence)],
    ...(company ? ([["Operator", company]] as [string, React.ReactNode][]) : []),
    ["Cryptocurrencies", f.coins.length ? <CoinStack tickers={f.coins} max={6} size={20} /> : "See terms"],
    ["Withdrawal time", f.withdrawals ?? "Not stated"],
    ["Withdrawal fee", f.fee ?? "Not stated"],
    ["Minimum deposit", f.minDeposit ?? "Not stated"],
    ["KYC", f.kyc ?? "Not stated"],
    ["Sportsbook", o.sports ? "Yes" : "No"],
  ];
  if (restricted) rows.push(["Restricted countries", `${restricted.split(",").length}+ named in its terms`]);
  return rows;
}

export default function Page() {
  const sites = inHouseOrder(siteData.ops.filter((o) => o.affiliate && o.signupUrl)).slice(0, 8);
  const instant = sites.filter((o) => /instant/i.test(payoutView(o).label));
  const free = sites.filter((o) => casinoFacts(o).fee === "Free");
  const ln = sites.filter((o) => o.ln);
  const noKyc = sites.filter((o) => o.kyc === "none");
  const names = (xs: Operator[]) => xs.map((o) => o.name).join(", ");
  const slots = topSlotRows().slice(0, 4);
  const COIN_NAME: Record<string, string> = { BTC: "Bitcoin", ETH: "Ethereum", USDT: "Tether", LTC: "Litecoin", SOL: "Solana", DOGE: "Dogecoin", XRP: "XRP", TRX: "Tron" };
  const common = Object.keys(COIN_NAME).filter((t) => sites.every((o) => casinoFacts(o).coins.includes(t))).map((t) => COIN_NAME[t]);
  // The newest date any of these casinos' facts were read.
  const updated = sites
    .flatMap((o) => ["Payouts & fees", "Coins & deposit limits", "Bonus terms", "Compliance"].flatMap((g) => ["Stated withdrawal time", "Withdrawal fees", "Minimum deposit", "Coins accepted", "Standing offer", "KYC policy", "Licence"].map((l) => getSpecFact(o.slug, g, l)?.asOf ?? "")))
    .filter(Boolean)
    .sort()
    .pop();

  const toc = [
    ["ranking", "Ranking of the best crypto slot sites"],
    ["takeaways", "Key takeaways"],
    ["glance", "At a glance"],
    ["reviews", "Reviews of the best sites"],
    ["slots", "Slots to start with"],
    ["how", "How crypto slots work"],
    ["fair", "Are crypto slots legit and fair?"],
    ["pros", "Pros and cons"],
    ["choose", "How to choose a site"],
    ["faq", "Questions"],
  ];

  const faqs = [
    { q: "What is the best crypto slot site?", a: `Our pick is ${sites[0]?.name}. It states ${firstClause(getSpecFact(sites[0]?.slug ?? "", "Payouts & fees", "Stated withdrawal time")?.value as string) ?? "its withdrawal time"}, and its rewards are ${casinoFacts(sites[0]).headline.toLowerCase()}.` },
    { q: "Do crypto casinos run the same slots as other casinos?", a: "Yes. The slots come from the same studios, such as Pragmatic Play and Hacksaw Gaming. What can differ is the RTP build: many studios license several returns for one game and the casino picks one, so check the paytable in the game's info screen." },
    { q: "Which coins can I play slots with?", a: `${common.length ? `${common.join(", ")} ${common.length === 1 ? "is" : "are"} accepted at every site on this list` : "Each site lists its own coins"}; most take more, shown in each review's General information. ${ln.length ? `${names(ln)} also take Bitcoin over Lightning.` : ""}` },
    { q: "Do I need ID to play crypto slots?", a: `It depends on the casino's terms. ${noKyc.length ? `${names(noKyc)} say crypto play needs no KYC; ` : ""}the others ask for ID at a threshold or before a withdrawal.` },
  ];

  return (
    <main style={{ background: "#07090B" }}>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Slots", path: "/slots" }, { name: "Best crypto slot sites", path: PATH }]),
          itemListSchema("Best crypto slot sites", sites.map((o) => ({ name: o.name, path: `/casinos/${o.slug}` }))),
          faqSchema(faqs),
        ]}
      />

      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(70% 120% at 85% 0%, rgba(255,197,49,.12), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "34px 24px 38px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 20 }}>
            <Link href="/" style={{ color: "#83919A" }}>Home</Link> / <Link href="/slots" style={{ color: "#83919A" }}>Slots</Link> / <span style={{ color: "#A8B6BE" }}>Best crypto slot sites</span>
          </div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 54px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", maxWidth: "18ch" }}>Best crypto slot sites</h1>
          <p style={{ margin: "0 0 22px", maxWidth: "62ch", fontSize: 17, lineHeight: 1.6, color: "#B7C4CB" }}>
            The crypto casinos we recommend for slots, compared on what matters when you cash out: withdrawal speed, fees, coins, ID checks and rewards. Every figure comes from the casino&apos;s own pages.
          </p>
          <AuthorByline updated={updated} />
        </div>
      </section>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 24px 0", display: "grid", gap: 36, gridTemplateColumns: "minmax(0,1fr)" }} className="lg:!grid-cols-[minmax(0,1fr)_280px]">
        <div style={{ minWidth: 0 }}>
          {/* Ranking */}
          <section id="ranking" style={{ scrollMarginTop: 100 }}>
            <h2 style={H2}>Ranking of the best crypto slot sites</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sites.map((o, i) => {
                const f = casinoFacts(o);
                const l = likes(o);
                return (
                  <div key={o.slug} style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${o.featured ? "rgba(255,197,49,.45)" : "rgba(255,255,255,.08)"}`, background: o.featured ? "linear-gradient(90deg, rgba(255,197,49,.08), transparent 60%), #0C1013" : "#0C1013" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "16px 18px" }}>
                      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: i < 3 ? GOLD : "#77858E", width: 22 }}>{i + 1}</span>
                      <span style={{ width: 58, height: 58, flex: "none", borderRadius: 14, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={14} fontSize={15} />
                      </span>
                      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{o.name}{o.featured && <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 100, background: GOLD, color: "#141007", fontFamily: MONO, fontSize: 9.5, fontWeight: 800, verticalAlign: "middle" }}>OUR PICK</span>}</div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: o.featured ? "#FFD36B" : "#57E39A", marginTop: 3 }}>{f.headline}</div>
                        {o.promoCode && o.codePerk?.short && <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6, fontSize: 12.5, color: "#E8EDF0" }}><CodeChip code={o.promoCode} tint={GOLD} size="sm" bare /> {o.codePerk.short}</div>}
                      </div>
                      <div style={{ display: "flex", flex: "0 1 280px", minWidth: 220 }}>
                        <OfferCta o={o} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[150px_170px_1fr]" style={{ gap: 1, background: "rgba(255,255,255,.05)", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                      <div style={CELL}><div style={LBL}>Withdrawals</div><div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{f.withdrawals ?? "Not stated"}</div></div>
                      <div style={CELL}><div style={LBL}>Coins</div>{f.coins.length ? <CoinStack tickers={f.coins} max={5} size={20} /> : <span style={{ color: "#A8B6BE" }}>See terms</span>}</div>
                      <div style={CELL}>
                        <div style={LBL}>What we like</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                          {l.like.slice(0, 3).map((x) => <span key={x} style={{ fontSize: 12.5, color: "#C3CFD5" }}><span style={{ color: "#57E39A" }}>✓</span> {x}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={NOTE}>Ranked in our house order, which puts our commercial partners first; it never changes the facts below. Affiliate links · 18+ · T&amp;Cs apply.</p>
          </section>

          {/* Takeaways */}
          <section id="takeaways" style={SEC}>
            <h2 style={H2}>Key takeaways</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                `${instant.length} of the ${sites.length} sites state instant crypto withdrawals in their own terms.`,
                free.length ? `${names(free)} charge no casino fee on crypto withdrawals, only the network fee.` : null,
                ln.length ? `${names(ln)} take Bitcoin over Lightning, which settles in seconds.` : null,
                noKyc.length ? `${names(noKyc)} say crypto play needs no KYC; the rest check ID at a threshold or before withdrawing.` : null,
                "The slots are the same studios' games everywhere, but a casino can run a lower-RTP build of the same title. Check the paytable before you spin.",
                "Rakeback and races pay without a wagering multiple at several sites, which is often worth more than a one-off deposit match.",
              ]
                .filter(Boolean)
                .map((t) => (
                  <li key={t!} style={{ display: "flex", gap: 10, fontSize: 15.5, lineHeight: 1.55, color: "#DCE5E9" }}>
                    <span style={{ width: 8, height: 8, flex: "none", marginTop: 8, borderRadius: "50%", background: "#57E39A" }} />
                    {t}
                  </li>
                ))}
            </ul>
          </section>

          {/* At a glance */}
          <section id="glance" style={SEC}>
            <h2 style={H2}>Best crypto slot sites at a glance</h2>
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px,1fr) minmax(160px,2fr) 120px 110px", gap: 12, padding: "12px 16px", background: "rgba(255,197,49,.08)", fontSize: 12.5, fontWeight: 700, color: "#E8EDF0" }}>
                <span>Casino</span><span>Offer</span><span>Withdrawals</span><span>Min deposit</span>
              </div>
              {sites.map((o) => {
                const f = casinoFacts(o);
                return (
                  <div key={o.slug} style={{ display: "grid", gridTemplateColumns: "minmax(120px,1fr) minmax(160px,2fr) 120px 110px", gap: 12, padding: "13px 16px", borderTop: "1px solid rgba(255,255,255,.06)", fontSize: 14, color: "#C3CFD5", alignItems: "center" }}>
                    <Link href={`#review-${o.slug}`} style={{ fontWeight: 700, color: "#fff", textDecoration: "underline", textDecorationColor: "rgba(87,227,154,.5)", textUnderlineOffset: 4 }}>{o.name}</Link>
                    <span>{f.headline}</span>
                    <span>{f.withdrawals ?? "—"}</span>
                    <span>{f.minDeposit ?? "—"}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews" style={SEC}>
            <h2 style={H2}>Reviews of the best crypto slot sites</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {sites.map((o) => {
                const f = casinoFacts(o);
                const l = likes(o);
                const wd = firstClause(getSpecFact(o.slug, "Payouts & fees", "Stated withdrawal time")?.value as string | undefined);
                return (
                  <article key={o.slug} id={`review-${o.slug}`} style={{ scrollMarginTop: 100, padding: 24, borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <span style={{ width: 64, height: 64, flex: "none", borderRadius: 16, overflow: "hidden" }}>
                        <BrandMark slug={o.slug} mono={o.mono} tint={brandFor(o.slug)} radius={16} fontSize={16} />
                      </span>
                      <h3 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{o.name} overview</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "16px 18px", borderRadius: 14, marginBottom: 18, background: "linear-gradient(90deg, rgba(255,197,49,.1), rgba(255,255,255,.02))", border: "1px solid rgba(255,197,49,.25)" }}>
                      <div style={{ flex: "1 1 260px" }}>
                        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#A8B6BE", marginBottom: 4 }}>Offer available</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{f.headline}</div>
                        {o.promoCode && o.codePerk?.short && <div style={{ marginTop: 4, fontSize: 13, color: "#FFE08A" }}>With code {o.promoCode}: {o.codePerk.short}</div>}
                        {o.promoCode && o.codePerk?.short && <div style={{ marginTop: 10 }}><VipClaim compact label="Claim the package via our VIP team" /></div>}
                      </div>
                      <div style={{ display: "flex", flex: "0 1 280px", minWidth: 220 }}>
                        <OfferCta o={o} />
                      </div>
                    </div>
                    <p style={{ margin: "0 0 18px", fontSize: 15.5, lineHeight: 1.7, color: "#C3CFD5" }}>
                      {o.name} is licensed in {licenceLabel(o.licence).replace(/ licence$/i, "")}
                      {f.coins.length ? ` and takes ${f.coins.length} coins, including ${f.coins.slice(0, 3).join(", ")}` : ""}.
                      {wd ? ` On withdrawals, its own pages say: "${wd}".` : ""} {f.fee === "Free" ? "It charges no fee of its own on crypto withdrawals. " : ""}
                      Its headline reward is {f.headline.charAt(0).toLowerCase() + f.headline.slice(1)}.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, padding: 18, borderRadius: 14, marginBottom: 18, background: "linear-gradient(135deg, rgba(87,227,154,.06), rgba(255,107,122,.05))", border: "1px solid rgba(255,255,255,.07)" }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#57E39A", marginBottom: 10 }}>What we like</div>
                        {l.like.map((x) => <div key={x} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 14, fontWeight: 600, color: "#E8EDF0" }}><span style={{ color: "#57E39A" }}>●</span>{x}</div>)}
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "#FF8A6B", marginBottom: 10 }}>What we don&apos;t like</div>
                        {(l.dislike.length ? l.dislike : ["Nothing in its published terms stands out against it"]).map((x) => <div key={x} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 14, fontWeight: 600, color: "#E8EDF0" }}><span style={{ color: "#FF8A6B" }}>●</span>{x}</div>)}
                      </div>
                    </div>
                    <h4 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 800, color: "#fff" }}>General information</h4>
                    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                      {infoRows(o).map(([k, v], i) => (
                        <div key={k} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, padding: "11px 16px", borderTop: i ? "1px solid rgba(255,255,255,.06)" : undefined, fontSize: 14, alignItems: "center" }}>
                          <span style={{ color: "#8E9CA5" }}>{k}</span>
                          <span style={{ fontWeight: 700, color: "#E8EDF0" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={`/casinos/${o.slug}`} style={{ display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 700, color: "#00C2CC" }}>Full {o.name} review, every fact sourced →</Link>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="slots" style={SEC}>
            <h2 style={H2}>Slots to start with</h2>
            <p style={P}>The top of our slot list, each with a full review and the RTP, max win and volatility its studio publishes.</p>
            <SlotArtCards rows={slots} />
            <Link href="/slots" style={{ display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 700, color: "#00C2CC" }}>All top slots →</Link>
          </section>

          <section id="how" style={SEC}>
            <h2 style={H2}>How crypto slots work</h2>
            <p style={P}>A crypto slot is the same game you would play anywhere, from the same studio. The difference is the cashier: you deposit a coin such as Bitcoin, Ethereum or Tether, the casino credits your balance once the network confirms the transfer, and withdrawals go back to your own wallet. How fast that happens depends on the casino&apos;s processing and on the chain itself.</p>
            <p style={P}>Read more in <Link href="/guides/how-to-deposit-crypto" style={A}>how to deposit crypto without losing it</Link> and <Link href="/coins" style={A}>each coin&apos;s confirmation times and fees</Link>.</p>
          </section>

          <section id="fair" style={SEC}>
            <h2 style={H2}>Are crypto slots legit and fair?</h2>
            <p style={P}>The slots on these sites come from licensed studios, and each casino holds its own licence, named in its terms and listed in its General information above. Fairness comes down to the RTP build: many studios license more than one return for the same game and the casino picks which one it runs. The game&apos;s info screen shows the build you are playing.</p>
            <p style={P}>&ldquo;Provably fair&rdquo; is a different thing: it applies to a casino&apos;s own originals such as dice and crash, not to studio slots. See <Link href="/guides/how-casino-rtp-versions-work" style={A}>how casino RTP versions work</Link> and <Link href="/house-games" style={A}>provably fair originals</Link>.</p>
          </section>

          <section id="pros" style={SEC}>
            <h2 style={H2}>Pros and cons of crypto slot sites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
              <div style={BOX}>
                <div style={{ ...LBL, color: "#57E39A" }}>Pros</div>
                {["Withdrawals can settle in minutes rather than days", "Rakeback and races without a wagering multiple at several sites", "Low or no minimum deposits on crypto", "Your coins come back to your own wallet"].map((x) => <div key={x} style={LI}><span style={{ color: "#57E39A" }}>✓</span>{x}</div>)}
              </div>
              <div style={BOX}>
                <div style={{ ...LBL, color: "#FF8A6B" }}>Cons</div>
                {["Coin prices move while your balance sits there", "Network fees on every transfer", "Most sites restrict some countries, the US and UK among them", "A casino may run a lower-RTP build of a slot"].map((x) => <div key={x} style={LI}><span style={{ color: "#FF8A6B" }}>–</span>{x}</div>)}
              </div>
            </div>
          </section>

          <section id="choose" style={SEC}>
            <h2 style={H2}>How to choose the best crypto slot site</h2>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10, fontSize: 15.5, lineHeight: 1.6, color: "#C3CFD5" }}>
              <li><strong style={{ color: "#fff" }}>Check it accepts your country.</strong> Each casino&apos;s terms list where it won&apos;t take you; <Link href="/legal" style={A}>our map</Link> shows the law where you live.</li>
              <li><strong style={{ color: "#fff" }}>Compare withdrawals and fees.</strong> The stated time and whether the casino adds its own fee matter more than a bonus headline.</li>
              <li><strong style={{ color: "#fff" }}>Read the wagering.</strong> A deposit match with a high multiple can be worth less than plain rakeback; <Link href="/lowest-wagering" style={A}>lowest wagering</Link> sorts them.</li>
              <li><strong style={{ color: "#fff" }}>Check the coin you hold is accepted</strong>, and on which network.</li>
              <li><strong style={{ color: "#fff" }}>Look at the slot&apos;s RTP</strong> in the game&apos;s info screen before you spin.</li>
            </ol>
          </section>

          <section id="faq" style={SEC}>
            <h2 style={H2}>Questions</h2>
            {faqs.map((f) => (
              <details key={f.q} style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <summary style={{ cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.q}</summary>
                <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.65, color: "#A8B6BE" }}>{f.a}</p>
              </details>
            ))}
            <div style={{ margin: "32px 0" }}>
              <AuthorBox />
            </div>
            <NextSteps
              steps={[
                { href: "/slots", label: "Top slots", hint: "Our ranked slots, each with a full review." },
                { href: "/crypto-casinos", label: "All crypto casinos", hint: "Every casino we track, filterable by payout, KYC and coin." },
                { href: "/promo-codes/roobet", label: "Roobet code ELITE", hint: "The welcome package and how to claim it." },
              ]}
            />
          </section>
        </div>

        {/* Table of contents */}
        <aside className="hidden lg:block">
          <nav aria-label="Table of contents" style={{ position: "sticky", top: 96, padding: "18px 18px 14px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#E8EDF0", marginBottom: 10 }}>Table of contents</div>
            {toc.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="hover:!text-[#57E39A]" style={{ display: "block", padding: "7px 0 7px 12px", borderLeft: "2px solid rgba(255,255,255,.08)", fontSize: 13.5, lineHeight: 1.35, color: "#B7C4CB" }}>
                {label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
      <div style={{ height: 60 }} />
    </main>
  );
}

const H2: React.CSSProperties = { margin: "0 0 16px", fontSize: 30, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" };
const SEC: React.CSSProperties = { marginTop: 52, scrollMarginTop: 100 };
const P: React.CSSProperties = { margin: "0 0 14px", fontSize: 15.5, lineHeight: 1.7, color: "#C3CFD5" };
const A: React.CSSProperties = { color: "#00C2CC", textDecoration: "underline", textUnderlineOffset: 3 };
const NOTE: React.CSSProperties = { margin: "12px 0 0", fontFamily: MONO, fontSize: 10.5, lineHeight: 1.6, color: "#77858E" };
const CELL: React.CSSProperties = { padding: "12px 16px", background: "#0C1013" };
const LBL: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#8E9CA5", marginBottom: 6 };
const BOX: React.CSSProperties = { padding: 18, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" };
const LI: React.CSSProperties = { display: "flex", gap: 8, marginBottom: 8, fontSize: 14.5, color: "#DCE5E9" };
