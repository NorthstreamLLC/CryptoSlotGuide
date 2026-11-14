import Link from "next/link";
import { hasPromoPage } from "@/lib/promo-pages";
import { hasFactArticle } from "@/lib/fact-articles";
import { CasinoNextStep } from "@/components/ui/NextStep";
import type { ReactNode } from "react";
import { siteData } from "@/lib/site-data";
import { getCasinoSpecSheet, getSpecFact } from "@/lib/spec-sheet";
import { payoutView } from "@/lib/payout";
import { wagerView, bonusWithWager } from "@/lib/wager";
import { sportsFacts } from "@/lib/sports";
import { getCasinoBonuses } from "@/lib/casino-bonuses";
import { editorialTake, type EntityView } from "@/lib/entity-view";
import { tintFor } from "@/lib/logo";
import { BrandMark } from "@/components/ui/BrandMark";
import { CasinoSpecSheet } from "@/components/entity/CasinoSpecSheet";
import { CoinList, CoinStack } from "@/components/ui/CoinIcon";
import { maxWithdrawal, maxDepositTile, brandFor } from "@/lib/casino-facts";
import { kycTierOf, KYC_TIER_LABEL } from "@/lib/kyc";
import { Icon, type IconName } from "@/components/ui/Icon";
import { raceFor, partnerFor, dropFor } from "@/lib/races";
import { rtpSummary } from "@/lib/rtp-watch-view";
import { ReportUpdates } from "@/components/casino/ReportUpdates";
import { NextSteps } from "@/components/layout/NextSteps";
import { RooJackpotsCard } from "@/components/casino/RooJackpotsCard";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { VipClaim, CLAIM_NOTE } from "@/components/ui/VipClaim";
import { AuthorBox, AuthorByline } from "@/components/ui/AuthorBox";
import { StickyOffer } from "@/components/casino/StickyOffer";
import { rivalPairs } from "@/lib/versus";
import type { SpecFact } from "@/lib/types";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { ReportIssue } from "@/components/ui/ReportIssue";
import { CodeOffer } from "@/components/ui/CodeOffer";
import { PaymentPartners } from "@/components/ui/PaymentPartners";
import { latestNewsFor, newsPath } from "@/lib/news";
import { firstHandTest } from "@/lib/first-hand-tests";
import { FirstHandTest } from "@/components/casino/FirstHandTest";

/**
 * The casino player report: what a player compares (offer, rewards, money
 * in and out, sportsbook, trust), each fact linked to the operator's own page.
 * The full fact table sits at the foot as "Every fact and its source".
 */

const GOLD = "#FFC531";
/** Small plain label used above values (replaces the old mono small-caps). */
const LABEL = { fontSize: 12, fontWeight: 500, color: "#75828A" } as const;
const BRAND: Record<string, string> = { roobet: "#FFCC00", stake: "#1FFF20", "bc-game": "#24EE89", shuffle: "#896CFF" };

const REWARD_LABELS = ["Rakeback", "Cashback", "Weekly raffle", "Leaderboards", "VIP levels", "VIP ranks", "VIP Club", "VIP club", "Perks by level", "Missions", "VIP transfer", "Wagering-triggered rewards", "Reload bonuses", "Prize draws", "Lootboxes", "Referral program"];

type Fact = SpecFact | undefined;

function host(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** A short headline from a long cited sentence: the first amount, or a plain word. */
function shortAmount(f: Fact): string | null {
  const v = f?.value;
  if (!v) return null;
  if (/^(no|there is no|there isn't)\b[^.]*\b(minimum|limit|fee)/i.test(v) || /\bno (minimum|limit)s?\b/i.test(v.slice(0, 60))) return "None";
  if (/^(no fee|free|none\b|fee-free|no withdrawal fee)/i.test(v)) return "Free";
  const m = v.match(/(?:(?:USD|EUR|USDT)\s?\d[\d.,]*(?:\s?(?:k|K|m|M|million)\b)?|[$€£]\s?\d[\d.,]*(?:\s?(?:k|K|m|M|million)\b)?|\d[\d.,]*\s?(?:USDT|USDC|USD|EUR|BTC|ETH|LTC|TRX|SOL|DOGE|mBTC)\b)/);
  if (m) return m[0].replace(/\s+/g, " ").replace(/[.,]+$/, "");
  if (/varies|depends|per coin|each coin|by coin|per currency/i.test(v)) return "Per coin";
  return null;
}

function Source({ f }: { f: Fact }) {
  if (!f?.sourceUrl) return null;
  return (
    <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 12, color: "#5FE3E8", whiteSpace: "nowrap" }}>
      {host(f.sourceUrl)} ↗
    </a>
  );
}

function Section({ id, title, children }: { id: string; eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 156, marginBottom: 64 }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 26, lineHeight: 1.15, letterSpacing: "-.025em", fontWeight: 700, color: "#F2F5F7" }}>{title}</h2>
      {children}
    </section>
  );
}

/** A big-number tile: short value up top, the operator's own wording underneath. */
function Tile({ label, value, f, accent }: { label: string; value: string | null; f: Fact; accent?: string }) {
  const known = !!f;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 18px 16px", borderRadius: 14, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)", minWidth: 0 }}>
      <div style={LABEL}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1.15, color: known ? accent ?? "#F2F5F7" : "#67747C" }}>{known ? value ?? "See terms" : "Not stated"}</div>
      {f?.value && (
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA", textWrap: "pretty" }}>
          <More f={f} max={90} />
        </div>
      )}
      {f?.chips && (
        <>
          <Chips items={f.chips} />
          <Source f={f} />
        </>
      )}
    </div>
  );
}

function Chips({ items, tint = "#B7C4CB" }: { items: string[]; tint?: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((c) => (
        <span key={c} style={{ padding: "4px 10px", borderRadius: 100, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", fontSize: 12.5, color: tint }}>
          {c}
        </span>
      ))}
    </div>
  );
}

/** The first sentence of a cited fact, trimmed to a readable length. */
function brief(text: string, max = 130): string {
  // A leading "Yes." repeats the tile's own "Yes", so drop it when there is more to say.
  const t = text.replace(/^Yes[.,;]\s+(?=\S)/, "").replace(/^./, (c) => c.toUpperCase());
  const first = t.split(/(?<=\.)\s+(?=[A-Z])/)[0].replace(/[.;]$/, "");
  if (first.length <= max) return first;
  let cut = first.slice(0, max).replace(/[\s,;:–-]+\S*$/, "");
  // Never end inside an unclosed bracket, e.g. "deducted from your balance (e.g".
  if ((cut.match(/\(/g) ?? []).length > (cut.match(/\)/g) ?? []).length) cut = cut.slice(0, cut.lastIndexOf("(")).trimEnd();
  return cut.replace(/[,;:–-]$/, "") + "…";
}

/** A short summary, with the casino's full wording one tap away when it is longer. */
function More({ f, max = 130 }: { f: Fact; max?: number }) {
  if (!f?.value) return null;
  const short = brief(f.value, max);
  // Offer "Full terms" only when the summary actually leaves something out.
  const long = short.endsWith("…") || f.value.trim().split(/(?<=\.)\s+(?=[A-Z])/).length > 1;
  return (
    <>
      <span>{short}</span>
      {long ? (
        <details style={{ marginTop: 6 }}>
          <summary style={{ cursor: "pointer", display: "inline-block", padding: "5px 0", fontSize: 12, fontWeight: 700, color: "#5FE3E8", listStyle: "none" }}>Full terms</summary>
          <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: "#A8B6BE" }}>
            {f.value} <Source f={f} />
          </div>
        </details>
      ) : (
        <> <Source f={f} /></>
      )}
    </>
  );
}

/** Label/value rows with a source link each. */
function Rows({ rows }: { rows: { k: string; f: Fact }[] }) {
  const shown = rows.filter((r) => r.f);
  if (!shown.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {shown.map(({ k, f }) => (
        <div key={k} style={{ display: "grid", gridTemplateColumns: "minmax(110px, 160px) 1fr", gap: 14, padding: "12px 0", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ ...LABEL, fontSize: 13, paddingTop: 1 }}>{k}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#C6D1D7" }}>{f!.chips ? <><Chips items={f!.chips} /> <Source f={f} /></> : <More f={f} />}</div>
        </div>
      ))}
    </div>
  );
}

/** Ongoing rewards as an even grid of cards, one per reward, instead of one long column. */
function RewardGrid({ items, brand }: { items: { k: string; f: Fact }[]; brand: string }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
      {items.map(({ k, f }) => (
        <div key={k} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 18px 16px", borderRadius: 14, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#F2F5F7" }}>
            <span style={{ width: 8, height: 8, borderRadius: 100, background: brand, flex: "none" }} />
            {k}
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#C6D1D7" }}>
            <More f={f} max={150} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A flat panel; `glow` now only draws a thin brand-coloured top edge. */
function Card({ children, glow }: { children: ReactNode; glow?: string }) {
  return (
    <div style={{ padding: 24, borderRadius: 16, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)", boxShadow: glow ? `inset 0 2px 0 ${glow}` : undefined, minWidth: 0 }}>
      {children}
    </div>
  );
}

const POSTER_CSS = `
.cr-poster { position: relative; display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 30px 20px 20px; overflow: hidden;
  background: radial-gradient(80% 90% at 50% 20%, color-mix(in srgb, var(--tint) 30%, transparent), transparent 70%), #0B0F12; border-bottom: 1px solid rgba(255,255,255,.07); }
.cr-poster-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px); background-size: 24px 24px; mask-image: radial-gradient(70% 80% at 50% 30%, #000, transparent); }
.cr-poster-glow { position: absolute; top: 10px; left: 50%; width: 200px; height: 200px; margin-left: -100px; border-radius: 50%; background: var(--tint); opacity: .22; filter: blur(50px); }
.cr-poster-mark { position: relative; width: 112px; height: 112px; border-radius: 26px; overflow: hidden; box-shadow: 0 0 0 2px color-mix(in srgb, var(--tint) 50%, transparent), 0 20px 50px rgba(0,0,0,.5); }
.cr-poster-stats { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; width: 100%; margin: 0; }
.cr-poster-stats div { padding: 10px 8px; border-radius: 12px; text-align: center; background: rgba(7,9,11,.6); border: 1px solid rgba(255,255,255,.1); backdrop-filter: blur(6px); min-width: 0; }
.cr-poster-stats dt { font-size: 10.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: #8E9CA4; }
.cr-poster-stats dd { margin: 3px 0 0; font-size: 16px; font-weight: 700; letter-spacing: -.01em; color: #F2F5F7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cr-poster-kyc { display: block; padding: 10px 20px; font-size: 12.5px; color: #A9B8C0; border-bottom: 1px solid rgba(255,255,255,.07); }
.cr-poster-kyc:hover { color: #fff; }
`;

export function CasinoReport({ e }: { e: EntityView }) {
  const o = siteData.ops.find((x) => x.slug === e.slug)!;
  const brand = BRAND[o.slug] ?? brandFor(o.slug);
  const kycTier = kycTierOf(o.slug);
  const f = (g: string, l: string) => getSpecFact(o.slug, g, l);
  const pv = payoutView(o);
  const wv = wagerView(o);
  const sp = sportsFacts(o.slug);
  const take = editorialTake("casino", o.slug);
  const sheet = getCasinoSpecSheet(o.slug);
  const bonuses = getCasinoBonuses(o.slug);

  const offer = f("Bonus terms", "Standing offer");
  const coins = f("Coins & deposit limits", "Coins accepted");
  const coinList = coins?.chips ?? [];
  const minDep = f("Coins & deposit limits", "Minimum deposit") ?? f("Bonus terms", "Minimum deposit");
  const maxDep = f("Coins & deposit limits", "Deposit limits");
  const minWd = f("Payouts & fees", "Minimum withdrawal");
  const maxWd = f("Payouts & fees", "Withdrawal limits") ?? f("Payouts & fees", "Win and withdrawal caps");
  const wdTime = f("Payouts & fees", "Stated withdrawal time");
  const wdFee = f("Payouts & fees", "Withdrawal fees");
  const licence = f("Compliance", "Licence");
  const kyc = f("Compliance", "KYC policy");
  const rewards = REWARD_LABELS.map((l) => ({ k: l, f: f("Bonus terms", l) })).filter((r) => r.f);
  const raffle = f("Bonus terms", "Weekly raffle");
  const payRows = [f("Coins & deposit limits", "Card and bank"), f("Coins & deposit limits", "Networks"), f("Coins & deposit limits", "Deposit rules"), f("Payouts & fees", "Withdrawal rules"), f("Payouts & fees", "Withdrawal conditions"), f("Payouts & fees", "Currency rule")].map((x) => ({ f: x }));

  // Up to four reasons to play, each from a cited fact.
  const clause = (v?: string) => (v ?? "").split(/[;.(]/)[0].trim().replace(/^Yes,?s*/i, "");
  const rakeback = /rakeback/i.test(o.bonus);
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const rtp = rtpSummary(o.slug);
  const rtpFact: Fact = rtp
    ? {
        label: "Slot RTP",
        sourcing: "site-data",
        value: rtp.cut
          ? `Reduced RTP found on ${rtp.cut} of ${rtp.count} slots we checked: ${rtp.cutTitles.join("; ")}. Checked ${rtp.checkedAt}; see RTP Watch.`
          : `Full RTP build on all ${rtp.count} slots we checked: ${rtp.titles.join(", ")}. Checked ${rtp.checkedAt}; see RTP Watch.`,
      }
    : undefined;
  const perks = [
    wdTime && pv.label !== "Not stated" ? { icon: "bolt" as const, title: `${pv.label} withdrawals`, sub: cap(clause(wdTime.value)) } : null,
    wv.kind === "none" || wv.mult === 0
      ? { icon: "gift" as const, title: rakeback ? "No-wager rakeback" : "No-wager rewards", sub: "No playthrough required" }
      : wv.kind === "cited"
      ? { icon: "gift" as const, title: `${wv.label} wagering`, sub: "On the welcome bonus" }
      : null,
    raffle ? { icon: "ticket" as const, title: (raffle.value!.match(/[$€][\d,]+k? (?:weekly|daily|monthly) raffle/i)?.[0] ?? "Weekly raffle").replace(/Raffle/, "raffle"), sub: "Every wager earns tickets" } : raceFor(o.slug) ? { icon: "trophy" as const, title: raceFor(o.slug)!.label, sub: "Recurring, prizes every cycle" } : null,
    dropFor(o.slug) ? { icon: "clock" as const, title: dropFor(o.slug)!, sub: "Timed rewards you claim as they drop" } : null,
    coinList.length ? { icon: "coins" as const, title: `${coinList.length} coins accepted`, sub: "", coins: coinList } : null,
    wdFee && shortAmount(wdFee) === "None" ? { icon: "percent" as const, title: "No withdrawal fee", sub: clause(wdFee.value) } : null,
    o.sports ? { icon: "ball" as const, title: "Sportsbook & esports", sub: sp.titles.length ? `${sp.titles.length} esports titles` : "Sports and esports betting" } : null,
  ].filter(Boolean).slice(0, 4) as { icon: IconName; title: string; sub: string; coins?: string[] }[];

  const rivals = rivalPairs(o.slug, 6);
  const news = latestNewsFor(o.slug);
  const tested = firstHandTest(o.slug);

  const nav = [
    ["bonuses", "Bonuses & rewards"],
    ["banking", "Deposits & withdrawals"],
    ...(tested ? [["tested", "Our test"]] : []),
    ...(o.sports ? [["sportsbook", "Sportsbook"]] : []),
    ["trust", "Licence & safety"],
    ["sources", "All facts"],
  ];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(60% 90% at 85% 0%, ${brand}14, transparent 65%), #0A0D10` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 44px" }}>
          <div style={{ fontSize: 13, color: "#6F7C84", marginBottom: 28 }}>
            <Link href="/" style={{ color: "#8E9CA4" }}>Home</Link> / <Link href="/crypto-casinos" style={{ color: "#8E9CA4" }}>Crypto casinos</Link> / <span style={{ color: "#AEBAC1" }}>{o.name}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40, alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <div style={{ width: 44, height: 44, flex: "none" }}>
                  <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={10} fontSize={13} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#F2F5F7" }}>{o.name}</div>
                  <div style={{ fontSize: 13, color: "#8E9CA4" }}>
                    {licence ? `${o.licence} licence` : "Crypto casino"}{o.featured ? " · Featured" : ""}
                  </div>
                  {partnerFor(o.slug) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 12.5, fontWeight: 600, color: "#C6D1D7" }}>
                      <span style={{ color: brand, display: "inline-flex" }}><Icon name="handshake" size={14} /></span>
                      Official partner of {partnerFor(o.slug)}
                    </div>
                  )}
                  {rtp && (
                    <Link href="/rtp-watch" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 12.5, fontWeight: 600, color: rtp.cut ? "#DA9877" : "#7BE0B8" }}>
                      <Icon name="shield" size={14} />
                      {rtp.cut ? `Reduced RTP on ${rtp.cut} of ${rtp.count} slots checked` : `Full RTP verified on ${rtp.count} slots`}
                    </Link>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 13.5, fontWeight: 600, color: brand, marginBottom: 10 }}>{o.noDepositBonus ? "Rewards" : "Welcome offer"}</div>
              <h1 style={{ margin: "0 0 14px", fontSize: "clamp(34px, 4.4vw, 50px)", lineHeight: 1.05, letterSpacing: "-.04em", fontWeight: 700, color: "#F7F9FA", textWrap: "balance" }}>
                {o.bonusShort ?? o.bonus}
              </h1>
              <p style={{ margin: "0 0 24px", maxWidth: "56ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
                {take ?? offer?.value ?? bonusWithWager(o)}
              </p>
              <div style={{ margin: "-6px 0 24px" }}>
                <AuthorByline updated={e.updated} />
              </div>

              <ul style={{ listStyle: "none", margin: "0 0 30px", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
                {perks.map((p) => (
                  <li key={p.title} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)", minWidth: 0 }}>
                    <span style={{ width: 38, height: 38, flex: "none", borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${brand}1a`, color: brand, border: `1px solid ${brand}40` }}>
                      <Icon name={p.icon} size={20} />
                    </span>
                    <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-.01em", color: "#F2F5F7" }}>{p.title}</span>
                      {p.coins ? <CoinStack tickers={p.coins} max={6} size={18} /> : p.sub ? <span style={{ fontSize: 12.5, lineHeight: 1.35, color: "#8DA0AA" }}>{p.sub}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>

              {o.signupUrl && o.promoCode && (
                <div style={{ marginBottom: 12, maxWidth: 560 }}>
                  <CodeOffer code={o.promoCode} offer={o.bonusShort ?? o.bonus} casino={o.name} perk={o.codePerk?.text} tint={GOLD} />
                  {o.slug === "roobet" && o.codePerk && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                      <VipClaim compact />
                      <Link href="/promo-codes/roobet" style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>
                        How to claim code {o.promoCode} →
                      </Link>
                    </div>
                  )}
                  {o.slug === "roobet" && o.codePerk && <p style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#B7C4CB" }}>{CLAIM_NOTE}</p>}
                  {news && (
                    <Link href={`${newsPath(news.issue.month)}#item-${news.issue.items.indexOf(news.items[0]) + 1}`} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "9px 12px", borderRadius: 10, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)", fontSize: 13.5, lineHeight: 1.4, color: "#DCE3E7" }}>
                      <span style={{ padding: "2px 7px", borderRadius: 6, background: "rgba(255,126,182,.12)", fontSize: 11.5, fontWeight: 700, color: "#FF9CC6", flex: "none" }}>News</span>
                      <span style={{ minWidth: 0 }}>{news.items[0].headline}{news.items.length > 1 ? ` (+${news.items.length - 1} more)` : ""} →</span>
                    </Link>
                  )}
                  {((o.slug !== "roobet" && hasPromoPage(o.slug)) || hasFactArticle(o.slug)) && (
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
                      {o.slug !== "roobet" && hasPromoPage(o.slug) && (
                        <Link href={`/promo-codes/${o.slug}`} style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>
                          How code {o.promoCode} works →
                        </Link>
                      )}
                      {hasFactArticle(o.slug) && (
                        <Link href={`/casinos/${o.slug}/facts`} style={{ fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" }}>
                          Facts about {o.name} →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
              {o.signupUrl && (
                <div style={{ maxWidth: 560, marginBottom: 12 }}>
                  <GeoBlockNote slug={o.slug} name={o.name} />
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                {o.signupUrl ? (
                  <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" data-copy-code={o.promoCode} data-placement="review-hero" className="csg-card-btn" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 11, background: GOLD, color: "#141007", fontSize: 15, fontWeight: 700 }}>
                    Claim offer at {o.name} <span aria-hidden>↗</span>
                  </a>
                ) : null}
                <a href="#bonuses" style={{ padding: "15px 20px", borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 14.5, fontWeight: 600 }}>
                  See the terms
                </a>
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: "#67747C" }}>
                18+ · T&amp;Cs apply{o.affiliate ? " · Affiliate link" : ""} · Facts from {host(offer?.sourceUrl ?? sheet?.groups[0]?.facts[0]?.sourceUrl) || `${o.name}'s own pages`}
              </div>
            </div>

            {/* Key numbers, under a brand poster: the casino's own mark in its own colour, with the three figures players weigh first. */}
            <div style={{ borderRadius: 18, overflow: "hidden", background: "#0F1316", border: `1px solid ${brand}55`, boxShadow: `0 30px 80px -30px ${brand}66, 0 18px 50px rgba(0,0,0,.45)` }}>
              <div className="cr-poster" style={{ ["--tint" as string]: brand }}>
                <span className="cr-poster-grid" aria-hidden />
                <span className="cr-poster-glow" aria-hidden />
                <span className="cr-poster-mark">
                  <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={26} fontSize={34} />
                </span>
                <dl className="cr-poster-stats">
                  <div>
                    <dt>Withdrawals</dt>
                    <dd>{pv.label !== "Not stated" ? pv.label : "Not stated"}</dd>
                  </div>
                  <div>
                    <dt>Wagering</dt>
                    <dd>{wv.kind === "none" || wv.mult === 0 ? "None" : wv.kind === "cited" ? `${wv.mult}×` : "See terms"}</dd>
                  </div>
                  <div>
                    <dt>ID check</dt>
                    <dd>{kycTier ? ({ never: "Never", discretionary: "If asked", threshold: "At a trigger", required: "Required", conflicting: "Unclear" } as const)[kycTier] : ({ none: "Not required", tiered: "At a threshold", required: "Required" } as const)[o.kyc]}</dd>
                  </div>
                </dl>
                <style>{POSTER_CSS}</style>
              </div>
              {kycTier && (
                <Link href="/crypto-casinos/kyc-tracker" className="cr-poster-kyc">
                  ID check: {KYC_TIER_LABEL[kycTier]}, from {o.name}&apos;s own terms →
                </Link>
              )}
            <div style={{ padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F2F5F7", marginBottom: 14 }}>Key numbers</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, overflow: "hidden" }} data-keep-grid>
                {[
                  ["Withdrawals", pv.label !== "Not stated" ? pv.label : null, wdTime],
                  ["Withdrawal fee", shortAmount(wdFee) === "None" ? "Free" : shortAmount(wdFee) ?? (wdFee ? "Network fee" : null), wdFee],
                  ["Min deposit", shortAmount(minDep), minDep],
                  ["Min withdrawal", shortAmount(minWd), minWd],
                ].map(([label, value, fact], i) => (
                  <div key={label as string} style={{ padding: "14px 16px", borderLeft: i % 2 ? "1px solid rgba(255,255,255,.07)" : 0, borderTop: i > 1 ? "1px solid rgba(255,255,255,.07)" : 0 }}>
                    <div style={{ ...LABEL, marginBottom: 4 }}>{label as string}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: fact ? "#F2F5F7" : "#67747C" }}>{fact ? (value as string) ?? "See terms" : "Not stated"}</div>
                  </div>
                ))}
              </div>
              {coinList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ ...LABEL, marginBottom: 8 }}>{coinList.length} coins accepted</div>
                  <CoinList tickers={coinList} />
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.07)", fontSize: 12.5, color: "#A8B6BE" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="shield" size={15} color="#8DA0AA" /> {licence ? `${o.licence} licence` : "Licence not stated"}</span>
                <span style={{ color: "#77858E" }}>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="id" size={15} color="#8DA0AA" /> KYC: {kyc ? ({ none: "not required", tiered: "at a threshold", required: "before withdrawal" } as const)[o.kyc] : "not stated"}</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section nav */}
      <nav style={{ position: "sticky", top: 100, zIndex: 5, background: "rgba(7,9,11,.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", display: "flex", gap: 22, overflowX: "auto" }}>
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} style={{ padding: "14px 0", fontSize: 13, fontWeight: 600, color: "#A8B6BE", whiteSpace: "nowrap" }}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px 80px" }}>
        {/* BONUSES & REWARDS */}
        <Section id="bonuses" eyebrow="What you get" title="Bonuses & rewards">
          <Card glow={brand}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: brand, marginBottom: 8 }}>{o.noDepositBonus ? "Rewards" : "Welcome offer"}</div>
                <div style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 700, letterSpacing: "-.02em", color: "#F2F5F7", marginBottom: 10 }}>{o.bonusShort ?? o.bonus}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "#A8B6BE", marginBottom: 14 }}>
                  <More f={offer} max={170} />
                </div>
                <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: 7, background: `${brand}1a`, color: brand, fontSize: 12.5, fontWeight: 600 }}>
                  {wv.kind === "none" ? "No wagering on rewards" : `Wagering: ${wv.label}`}
                </span>
              </div>
              <Rows
                rows={[
                  { k: "Wagering", f: f("Bonus terms", "Wagering") ?? f("Bonus terms", "Wagering rules") },
                  { k: "Time limit", f: f("Bonus terms", "Expiry") },
                  { k: "Max bet", f: f("Bonus terms", "Max bet") },
                  { k: "Max cashout", f: f("Bonus terms", "Max cashout") },
                  { k: "Games that count", f: f("Bonus terms", "Game contribution") },
                  { k: "Min deposit", f: f("Bonus terms", "Minimum deposit") },
                ]}
              />
            </div>
          </Card>
          {rewards.length > 0 && (
            <>
              <h3 style={{ margin: "32px 0 12px", fontSize: 17, fontWeight: 700, color: "#F2F5F7" }}>Ongoing rewards</h3>
              <RewardGrid items={rewards} brand={brand} />
            </>
          )}
          {bonuses.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 16 }}>
              {bonuses.map((b) => (
                <div key={b.title} style={{ padding: 20, borderRadius: 14, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ ...LABEL, marginBottom: 6 }}>{b.category}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#F2F5F7", marginBottom: 8 }}>{b.title}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", color: brand, marginBottom: 6 }}>{b.headline}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA", marginBottom: 10 }}>{b.subCopy}</div>
                  <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontSize: 12, color: "#5FE3E8" }}>{host(b.sourceUrl)} ↗</a>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* BANKING */}
        <Section id="banking" eyebrow="Money in, money out" title="Deposits & withdrawals">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <Tile label="Withdrawal speed" value={pv.label !== "Not stated" ? pv.label : null} f={wdTime} accent={brand} />
            <Tile label="Withdrawal fee" value={shortAmount(wdFee) === "None" ? "Free" : shortAmount(wdFee) ?? "Network fee"} f={wdFee} />
            <Tile label="Min withdrawal" value={shortAmount(minWd)} f={minWd} />
            <Tile label="Max withdrawal" value={maxWithdrawal(o.slug)} f={maxWd} />
            <Tile label="Min deposit" value={shortAmount(minDep)} f={minDep} />
            <Tile label={maxDepositTile(o.slug).label} value={maxDepositTile(o.slug).value} f={maxDep} />
          </div>
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "#8E9CA4" }}>
            How {o.name} compares:{" "}
            <Link href="/crypto-casino-withdrawals-explained" style={{ fontWeight: 600, color: "#C9D3D8" }}>withdrawal times, limits and fees at every crypto casino →</Link>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginTop: 16 }}>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F2F5F7", marginBottom: 12 }}>
                {coinList.length ? `${coinList.length} coins accepted` : "Coins"}
              </div>
              {coinList.length ? <CoinList tickers={coinList} /> : <div style={{ color: "#8DA0AA", fontSize: 14 }}>Not stated</div>}
              <div style={{ marginTop: 10 }}>
                <Source f={coins} />
              </div>
            </Card>
            {payRows.some((r) => r.f) && <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F2F5F7", marginBottom: 4 }}>Payment</div>
              {/* The marks first: whether your rail is there is the question
                  this card exists to answer, and it was buried in a sentence.
                  The operator's own wording stays below with its source. */}
              <div style={{ margin: "12px 0 4px" }}>
                <PaymentPartners value={f("Coins & deposit limits", "Card and bank")?.value ?? null} />
              </div>
              <Rows
                rows={[
                  { k: "Payment partners", f: f("Coins & deposit limits", "Card and bank") },
                  { k: "Networks", f: f("Coins & deposit limits", "Networks") },
                  { k: "Deposit rules", f: f("Coins & deposit limits", "Deposit rules") },
                  { k: "Withdrawal rules", f: f("Payouts & fees", "Withdrawal rules") ?? f("Payouts & fees", "Withdrawal conditions") },
                  { k: "Currency rule", f: f("Payouts & fees", "Currency rule") },
                ]}
              />
            </Card>}
          </div>
        </Section>

        {tested && <FirstHandTest t={tested} name={o.name} brand={brand} />}

        {/* SPORTSBOOK */}
        {o.sports && (
          <Section id="sportsbook" eyebrow="Sports & esports" title="Sportsbook">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
              <Tile label="Cash-out" value={sp.cashout ? "Yes" : null} f={sp.cashout} accent={brand} />
              <Tile label="Bet builder" value={sp.betBuilder ? "Yes" : null} f={sp.betBuilder} accent={brand} />
              <Tile label="Max payout" value={shortAmount(sp.maxPayout) ?? "See rules"} f={sp.maxPayout} />
              {f("Sportsbook", "Prediction markets") && <Tile label="Prediction markets" value="Yes" f={f("Sportsbook", "Prediction markets")} accent={brand} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F2F5F7", marginBottom: 12 }}>
                  {sp.titles.length ? `${sp.titles.length} esports titles` : "Coverage"}
                </div>
                {sp.titles.length > 0 && <Chips items={sp.titles} tint="#E8EDF0" />}
                <Rows rows={[{ k: "Sports", f: sp.sportsbook }, { k: "Racing", f: f("Sportsbook", "Racing") }, { k: "Provider", f: sp.provider }]} />
              </Card>
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F2F5F7", marginBottom: 4 }}>Sports bonus</div>
                <Rows
                  rows={[
                    { k: "Offer", f: sp.offer },
                    { k: "Wagering", f: f("Sports bonus terms", "Wagering") },
                    { k: "Minimum odds", f: f("Sports bonus terms", "Minimum odds") },
                    { k: "Max bet", f: f("Sports bonus terms", "Max bet") },
                    { k: "Time limit", f: f("Sports bonus terms", "Expiry") },
                    { k: "Bets that count", f: f("Sports bonus terms", "Qualifying bets") },
                    { k: "Other promotions", f: f("Sports bonus terms", "Other sports promotions") },
                  ]}
                />
                {!sp.offer && <div style={{ fontSize: 14, color: "#8DA0AA" }}>No standing sports welcome offer published.</div>}
              </Card>
            </div>
          </Section>
        )}

        {/* TRUST */}
        <Section id="trust" eyebrow="Who runs it" title="Licence & safety">
          <Card>
            <Rows
              rows={[
                { k: "Licence", f: licence },
                { k: "Company", f: f("Compliance", "Company") },
                { k: "KYC", f: kyc },
                { k: "Register check", f: f("Compliance", "Register check") },
                { k: "Restricted", f: f("Compliance", "Restricted countries") },
                { k: "Slot RTP", f: rtpFact },
                { k: "Partners", f: f("Compliance", "Partners") },
                { k: "Awards", f: f("Compliance", "Awards") },
              ]}
            />
          </Card>
        </Section>

        <ReportUpdates slug={o.slug} name={o.name} />

        {/* FAQ */}
        {e.faqs.length > 0 && (
          <Section id="faq" eyebrow="Quick answers" title={`${o.name} FAQ`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {e.faqs.map((q) => (
                <details key={q.q} style={{ padding: "16px 20px", borderRadius: 14, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)" }}>
                  <summary style={{ cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#F2F5F7" }}>{q.q}</summary>
                  <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.65, color: "#A8B6BE" }}>{q.a}</p>
                  {q.href && (
                    <Link href={q.href} style={{ display: "inline-block", marginTop: 8, fontSize: 13.5, fontWeight: 600, color: "#5FE3E8" }}>
                      {q.hrefLabel ?? "Read more"} &rarr;
                    </Link>
                  )}
                </details>
              ))}
            </div>
          </Section>
        )}

        {/* ALL FACTS */}
        <section id="sources" style={{ scrollMarginTop: 156 }}>
          <details>
            <summary style={{ cursor: "pointer", padding: "18px 22px", borderRadius: 14, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)", fontSize: 15, fontWeight: 600, color: "#F2F5F7" }}>
              Every fact and its source ({sheet?.groups.reduce((n, g) => n + g.facts.length, 0) ?? 0})
            </summary>
            <div style={{ marginTop: 16 }}>
              <CasinoSpecSheet slug={o.slug} kind="casino" />
            </div>
          </details>
        </section>

        {/* SIDE BY SIDE — the comparisons a reader of this report tends to want next. */}
        {rivals.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 22, letterSpacing: "-.02em", fontWeight: 700, color: "#F2F5F7" }}>Compare {o.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
              {rivals.map(({ rival, href }) => (
                <Link key={href} href={href} className="transition-colors hover:border-white/20 hover:bg-white/[0.03]" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 14, background: "#0D1114", border: "1px solid rgba(255,255,255,.08)" }}>
                  <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, overflow: "hidden" }}>
                    <BrandMark slug={rival.slug} mono={rival.mono} tint={tintFor(rival.slug)} radius={9} fontSize={10} />
                  </span>
                  <span style={{ minWidth: 0, fontSize: 14.5, fontWeight: 600, color: "#E8EDF0" }}>
                    {o.name} <span style={{ color: "#6F7C84", fontWeight: 500 }}>vs</span> {rival.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {o.signupUrl && (
          <StickyOffer
            name={o.name}
            href={o.signupUrl}
            offer={o.bonusShort ?? o.bonus}
            note={wv.kind === "none" ? "No wagering" : `Wagering ${wv.label}`}
            brand={brand}
            code={o.promoCode}
          />
        )}

        {/* Not on the featured operator's own profile, which would be a page
            advertising itself. */}
        {o.slug === "roobet" && (
          <div style={{ margin: "0 0 28px" }}>
            <RooJackpotsCard />
          </div>
        )}
        <CasinoNextStep slug={o.slug} />
        {/* Alternatives picked by how they compare with this casino (ID checks,
            withdrawal speed, wagering, coins, sportsbook), with the reason on
            each row. Not our featured partner: a rival's review is not the
            place to push it. */}
        <FeaturedPartner context={{ kind: "alternative", of: o.slug }} heading={`Similar to ${o.name}, worth comparing`} exclude={[o.slug, "roobet"]} seed={o.slug} count={3} />
        <div style={{ margin: "32px 0" }}>
          <AuthorBox />
        </div>
        <ReportIssue subject={o.name} />
        <NextSteps
          steps={[
            ...(hasFactArticle(o.slug) ? [{ href: `/casinos/${o.slug}/facts`, label: `Facts about ${o.name}`, hint: "Who runs it, its licence and the rules that catch players out, each with its source." }] : []),
            { href: "/crypto-casinos", label: "All crypto casinos", hint: `Filter ${siteData.ops.length} casinos by payout speed, KYC, wagering and sportsbook.` },
            { href: "/bonuses", label: "Every bonus, side by side", hint: "Welcome offers and ongoing rewards with the wagering each one carries." },
            ...(raceFor(o.slug) ? [{ href: "/races", label: "Races & raffles", hint: "The recurring prize pools running at each casino, and what they pay." }] : []),
            { href: "/how-we-rate", label: "How we source every fact", hint: "Why each figure on this page links to the operator's own page." },
          ]}
        />
      </div>
    </main>
  );
}
