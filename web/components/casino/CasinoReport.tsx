import Link from "next/link";
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
import { maxWithdrawal, maxDeposit } from "@/lib/casino-facts";
import { Icon, type IconName } from "@/components/ui/Icon";
import { raceFor, partnerFor, dropFor } from "@/lib/races";
import { rtpSummary } from "@/lib/rtp-watch-view";
import type { SpecFact } from "@/lib/types";

/**
 * The casino player report: what a player compares (offer, rewards, money
 * in and out, sportsbook, trust), each fact linked to the operator's own page.
 * The full fact table sits at the foot as "Every fact and its source".
 */

const MONO = "var(--font-jetbrains-mono), monospace";
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
  const m = v.match(/(?:(?:USD|EUR|USDT)\s?\d[\d.,]*(?:\s?(?:k|K|m|M|million))?|[$€£]\s?\d[\d.,]*(?:\s?(?:k|K|m|M|million))?|\d[\d.,]*\s?(?:USDT|USDC|USD|EUR|BTC|ETH|LTC|TRX|SOL|DOGE|mBTC)\b)/);
  if (m) return m[0].replace(/\s+/g, " ").replace(/[.,]+$/, "");
  if (/varies|depends|per coin|each coin|by coin|per currency/i.test(v)) return "Per coin";
  return null;
}

function Source({ f }: { f: Fact }) {
  if (!f?.sourceUrl) return null;
  return (
    <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8", whiteSpace: "nowrap" }}>
      {host(f.sourceUrl)} ↗
    </a>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 90, marginBottom: 56 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>{eyebrow}</div>
      <h2 style={{ margin: "0 0 20px", fontSize: 30, lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 800, fontStretch: "112%", color: "#fff" }}>{title}</h2>
      {children}
    </section>
  );
}

/** A big-number tile: short value up top, the operator's own wording underneath. */
function Tile({ label, value, f, accent }: { label: string; value: string | null; f: Fact; accent?: string }) {
  const known = !!f;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 18px 16px", borderRadius: 14, background: "#0E1316", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.1, color: known ? accent ?? "#fff" : "#4E5A62" }}>{known ? value ?? "See terms" : "Not stated"}</div>
      {f?.value && <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA", textWrap: "pretty" }}>{f.value}</div>}
      {f?.chips && <Chips items={f.chips} />}
      <div style={{ marginTop: "auto" }}>
        <Source f={f} />
      </div>
    </div>
  );
}

function Chips({ items, tint = "#B7C4CB" }: { items: string[]; tint?: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((c) => (
        <span key={c} style={{ padding: "4px 9px", borderRadius: 100, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", fontFamily: MONO, fontSize: 10.5, color: tint }}>
          {c}
        </span>
      ))}
    </div>
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
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#6E7F88", paddingTop: 2 }}>{k}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#C6D1D7" }}>
            {f!.chips ? <Chips items={f!.chips} /> : f!.value} <Source f={f} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({ children, glow }: { children: ReactNode; glow?: string }) {
  return (
    <div style={{ padding: 24, borderRadius: 18, background: glow ? `radial-gradient(120% 90% at 0% 0%, ${glow}1f, transparent 55%), #0C1013` : "#0C1013", border: `1px solid ${glow ? `${glow}33` : "rgba(255,255,255,.07)"}`, minWidth: 0 }}>
      {children}
    </div>
  );
}

export function CasinoReport({ e }: { e: EntityView }) {
  const o = siteData.ops.find((x) => x.slug === e.slug)!;
  const brand = BRAND[o.slug] ?? tintFor(o.slug);
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

  const nav = [
    ["bonuses", "Bonuses & rewards"],
    ["banking", "Deposits & withdrawals"],
    ...(o.sports ? [["sportsbook", "Sportsbook"]] : []),
    ["trust", "Licence & safety"],
    ["sources", "All facts"],
  ];

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.07)", background: `radial-gradient(80% 120% at 85% 0%, ${brand}26, transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.08), transparent 60%), #0A0D10` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "#5C6A72", marginBottom: 28 }}>
            <Link href="/" style={{ color: "#5C6A72" }}>Home</Link> / <Link href="/crypto-casinos" style={{ color: "#5C6A72" }}>Crypto casinos</Link> / <span style={{ color: "#A8B6BE" }}>{o.name}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40, alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <div style={{ width: 44, height: 44, flex: "none" }}>
                  <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={10} fontSize={13} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{o.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", color: "#6E7F88" }}>
                    {licence ? `${o.licence.toUpperCase()} LICENCE` : "CRYPTO CASINO"}{o.featured ? " · FEATURED" : ""}
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

              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: brand, marginBottom: 10 }}>{o.noDepositBonus ? "Rewards" : "Welcome offer"}</div>
              <h1 style={{ margin: "0 0 12px", fontSize: "clamp(34px, 4.4vw, 52px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
                {o.bonusShort ?? o.bonus}
              </h1>
              <p style={{ margin: "0 0 24px", maxWidth: "56ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE", textWrap: "pretty" }}>
                {take ?? offer?.value ?? bonusWithWager(o)}
              </p>

              <ul style={{ listStyle: "none", margin: "0 0 30px", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
                {perks.map((p) => (
                  <li key={p.title} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.02))", border: "1px solid rgba(255,255,255,.08)", minWidth: 0 }}>
                    <span style={{ width: 40, height: 40, flex: "none", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${brand}1a`, color: brand, boxShadow: `inset 0 0 0 1px ${brand}33` }}>
                      <Icon name={p.icon} size={20} />
                    </span>
                    <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: "-.01em", color: "#fff" }}>{p.title}</span>
                      {p.coins ? <CoinStack tickers={p.coins} max={6} size={18} /> : p.sub ? <span style={{ fontSize: 12.5, lineHeight: 1.35, color: "#8DA0AA" }}>{p.sub}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                {o.signupUrl ? (
                  <a href={o.signupUrl} target="_blank" rel="nofollow sponsored noopener" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 26px", borderRadius: 11, background: brand, color: "#0A0D0F", fontSize: 15, fontWeight: 800, boxShadow: `0 10px 30px ${brand}40` }}>
                    Claim offer at {o.name} <span aria-hidden>→</span>
                  </a>
                ) : null}
                <a href="#bonuses" style={{ padding: "15px 20px", borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", color: "#DCE5E9", fontSize: 14.5, fontWeight: 600 }}>
                  See the terms
                </a>
              </div>
              <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 10.5, color: "#5C6A72" }}>
                18+ · T&amp;Cs apply{o.affiliate ? " · Affiliate link" : ""} · Facts from {host(offer?.sourceUrl ?? sheet?.groups[0]?.facts[0]?.sourceUrl) || `${o.name}'s own pages`}
              </div>
            </div>

            {/* Key numbers */}
            <div style={{ padding: 22, borderRadius: 22, background: "rgba(12,16,19,.85)", border: `1px solid ${brand}33`, boxShadow: "0 30px 80px rgba(0,0,0,.45)", backdropFilter: "blur(6px)" }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 14 }}>Key numbers</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} data-keep-grid>
                {[
                  ["Withdrawals", pv.label !== "Not stated" ? pv.label : null, wdTime],
                  ["Withdrawal fee", shortAmount(wdFee) === "None" ? "Free" : shortAmount(wdFee) ?? (wdFee ? "Network fee" : null), wdFee],
                  ["Min deposit", shortAmount(minDep), minDep],
                  ["Min withdrawal", shortAmount(minWd), minWd],
                ].map(([label, value, fact]) => (
                  <div key={label as string} style={{ padding: "16px 16px 14px", borderRadius: 14, background: "#0F1519", border: "1px solid rgba(255,255,255,.06)" }}>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 6 }}>{label as string}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: fact ? "#fff" : "#4E5A62" }}>{fact ? (value as string) ?? "See terms" : "Not stated"}</div>
                  </div>
                ))}
              </div>
              {coinList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 8 }}>{coinList.length} coins</div>
                  <CoinList tickers={coinList} />
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.07)", fontSize: 12.5, color: "#A8B6BE" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="shield" size={15} color="#8DA0AA" /> {licence ? `${o.licence} licence` : "Licence not stated"}</span>
                <span style={{ color: "#3A454C" }}>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="id" size={15} color="#8DA0AA" /> KYC: {kyc ? ({ none: "not required", tiered: "at a threshold", required: "before withdrawal" } as const)[o.kyc] : "not stated"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(7,9,11,.9)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
            <Card glow={brand}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: brand, marginBottom: 8 }}>{o.noDepositBonus ? "Rewards" : "Welcome offer"}</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", color: "#fff", marginBottom: 6 }}>{o.bonusShort ?? o.bonus}</div>
              <div style={{ fontSize: 14, color: "#A8B6BE", marginBottom: 14 }}>{offer?.value}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                <span style={{ padding: "6px 11px", borderRadius: 100, background: `${brand}1f`, color: brand, fontFamily: MONO, fontSize: 11.5, fontWeight: 700 }}>
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
            </Card>
            {rewards.length > 0 && (
              <Card>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Ongoing rewards</div>
                <Rows rows={rewards} />
              </Card>
            )}
          </div>
          {bonuses.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 16 }}>
              {bonuses.map((b) => (
                <div key={b.title} style={{ padding: 20, borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 6 }}>{b.category}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{b.title}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", color: brand, marginBottom: 6 }}>{b.headline}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA", marginBottom: 10 }}>{b.subCopy}</div>
                  <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ fontFamily: MONO, fontSize: 10.5, color: "#5FE3E8" }}>{host(b.sourceUrl)} ↗</a>
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
            <Tile label="Max deposit" value={maxDeposit(o.slug)} f={maxDep} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginTop: 16 }}>
            <Card>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>
                {coinList.length ? `${coinList.length} coins accepted` : "Coins"}
              </div>
              {coinList.length ? <CoinList tickers={coinList} /> : <div style={{ color: "#8DA0AA", fontSize: 14 }}>Not stated</div>}
              <div style={{ marginTop: 10 }}>
                <Source f={coins} />
              </div>
            </Card>
            {payRows.some((r) => r.f) && <Card>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 4 }}>Payment details</div>
              <Rows
                rows={[
                  { k: "Card & bank", f: f("Coins & deposit limits", "Card and bank") },
                  { k: "Networks", f: f("Coins & deposit limits", "Networks") },
                  { k: "Deposit rules", f: f("Coins & deposit limits", "Deposit rules") },
                  { k: "Withdrawal rules", f: f("Payouts & fees", "Withdrawal rules") ?? f("Payouts & fees", "Withdrawal conditions") },
                  { k: "Currency rule", f: f("Payouts & fees", "Currency rule") },
                ]}
              />
            </Card>}
          </div>
        </Section>

        {/* SPORTSBOOK */}
        {o.sports && (
          <Section id="sportsbook" eyebrow="Sports & esports" title="Sportsbook">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
              <Tile label="Cash-out" value={sp.cashout ? "Yes" : null} f={sp.cashout} accent={brand} />
              <Tile label="Bet builder" value={sp.betBuilder ? "Yes" : null} f={sp.betBuilder} accent={brand} />
              <Tile label="Max payout" value={shortAmount(sp.maxPayout) ?? "See rules"} f={sp.maxPayout} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
              <Card>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 12 }}>
                  {sp.titles.length ? `${sp.titles.length} esports titles` : "Coverage"}
                </div>
                {sp.titles.length > 0 && <Chips items={sp.titles} tint="#E8EDF0" />}
                <Rows rows={[{ k: "Sports", f: sp.sportsbook }, { k: "Racing", f: f("Sportsbook", "Racing") }, { k: "Provider", f: sp.provider }]} />
              </Card>
              <Card>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 4 }}>Sports bonus</div>
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

        {/* FAQ */}
        {e.faqs.length > 0 && (
          <Section id="faq" eyebrow="Quick answers" title={`${o.name} FAQ`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {e.faqs.map((q) => (
                <details key={q.q} style={{ padding: "16px 20px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
                  <summary style={{ cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#E8EDF0" }}>{q.q}</summary>
                  <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.65, color: "#A8B6BE" }}>{q.a}</p>
                </details>
              ))}
            </div>
          </Section>
        )}

        {/* ALL FACTS */}
        <section id="sources" style={{ scrollMarginTop: 90 }}>
          <details>
            <summary style={{ cursor: "pointer", padding: "18px 22px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)", fontSize: 15, fontWeight: 700, color: "#E8EDF0" }}>
              Every fact and its source ({sheet?.groups.reduce((n, g) => n + g.facts.length, 0) ?? 0})
            </summary>
            <div style={{ marginTop: 16 }}>
              <CasinoSpecSheet slug={o.slug} kind="casino" />
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}
