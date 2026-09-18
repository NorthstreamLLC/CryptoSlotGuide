import Link from "next/link";
import type { ReactNode } from "react";
import { wagerView, compareWager } from "@/lib/wager";
import { siteData } from "@/lib/site-data";
import { brandFor, casinoFacts } from "@/lib/casino-facts";
import { BrandMark } from "@/components/ui/BrandMark";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Operator } from "@/lib/types";
import { raceFor, raceSlugs, dropFor } from "@/lib/races";
import { getSpecFact } from "@/lib/spec-sheet";
import { EmailSignup } from "@/components/ui/EmailSignup";

/**
 * Compare casino bonuses, split by how each one works:
 * welcome bonuses are credited first and must be wagered before you can
 * withdraw; rewards (rakeback, cashback, races) are earned by wagering and
 * then paid out. Terms come from each casino's own bonus pages.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const WELCOME_COLS = "md:grid-cols-[minmax(170px,1fr)_minmax(240px,1.6fr)_120px_130px_96px_100px_130px]";
const REWARD_COLS = "md:grid-cols-[minmax(170px,1fr)_minmax(220px,1.5fr)_150px_150px_minmax(150px,1fr)_130px]";

/** Welcome bonus if the headline is a deposit match, free spins or a first-deposit package; otherwise an earn-as-you-play reward. */
function isWelcome(o: Operator): boolean {
  if (o.noDepositBonus) return false;
  const b = o.bonusShort ?? o.bonus;
  return /\d+%\s*(sports\s*)?(bonus|match|welcome|first|on|up to)|free spins|\d\s*deposits|first deposit|deposit bonus/i.test(b) && !/^(instant )?rakeback|^up to \d+% cash/i.test(b);
}

/** The largest match percentage in an offer headline, e.g. 360 from "Up to 360% on 4 deposits". */
function matchPct(o: Operator): number {
  const all = [...(o.bonusShort ?? o.bonus).matchAll(/(\d{2,4})%/g)].map((m) => Number(m[1]));
  return all.length ? Math.max(...all) : 0;
}

function toWithdraw(o: Operator): { text: string; color: string } {
  const wv = wagerView(o);
  const m = wv.mult;
  if (wv.kind === "none" || m === 0) return { text: "No wagering", color: "#7BE0B8" };
  if (m === null) return { text: "See terms", color: "#6E7F88" };
  return { text: `${m}×`, color: m <= 20 ? "#7BE0B8" : m <= 40 ? "#E8EDF0" : "#F0A77F" };
}

/** What the multiplier applies to: the bonus, the deposit, or both. */
function basisOf(o: Operator): "bonus" | "deposit" | "both" {
  const b = (o.wagerBasis ?? "").toLowerCase();
  if (/^deposit/.test(b)) return "deposit";
  if (b.includes("deposit")) return "both";
  return "bonus";
}

/** Bets needed on a $100 deposit with a matching $100 bonus, so every offer is priced on the same stake. */
function betsOn100(o: Operator): string | null {
  const m = wagerView(o).mult;
  if (m === null || m === 0) return null;
  const base = basisOf(o) === "both" ? 200 : 100;
  return `$${(m * base).toLocaleString()}`;
}

/** How a reward is earned, from its headline. */
function earnedBy(o: Operator): string {
  const b = (o.bonusShort ?? o.bonus).toLowerCase();
  const rake = /rakeback|cashrake|rewards|drop/.test(b);
  const loss = /cashback|lossback/.test(b);
  if (rake && loss) return "Wagers or losses";
  if (loss) return "Net losses";
  if (rake) return "Every wager";
  if (/race|raffle|draw|leaderboard/.test(b)) return "Wager leaderboard";
  return "Every wager";
}

/** How often a reward pays out, from the casino's own rakeback, cashback and reload terms. */
function paidWhen(o: Operator): string | null {
  const text = ["Rakeback", "Cashback", "Reload bonuses", "Standing offer"].map((l) => getSpecFact(o.slug, "Bonus terms", l)?.value ?? "").join(" ").toLowerCase();
  const out: string[] = [];
  const mins = text.match(/every (\d+) minutes?/);
  if (mins) out.push(`Every ${mins[1]} min`);
  else if (/instant|real time|continuous|immediately/.test(text)) out.push("Instant");
  if (/\bdaily\b|every 24 hours|each day/.test(text)) out.push("daily");
  if (/twice a week/.test(text)) out.push("twice weekly");
  else if (/\bweekly\b|every (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|each week/.test(text)) out.push("weekly");
  if (/\bmonthly\b|on the 1st|each month/.test(text)) out.push("monthly");
  if (!out.length) return null;
  const s = out.join(" · ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function BonusesPage() {
  const { ops } = siteData;
  const welcome = ops.filter(isWelcome).sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || compareWager(a, b));
  const rewards = ops.filter((o) => !isWelcome(o)).sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || (raceFor(b.slug)?.monthly ?? 0) - (raceFor(a.slug)?.monthly ?? 0));

  const biggest = [...welcome].sort((a, b) => matchPct(b) - matchPct(a))[0];
  const lowest = welcome.filter((o) => (wagerView(o).mult ?? 0) > 0).sort((a, b) => (wagerView(a).mult ?? 0) - (wagerView(b).mult ?? 0))[0];
  const featured = ops.find((o) => o.featured);
  const raceTop = ops.find((o) => o.slug === raceSlugs()[0]);
  const picks = [
    featured && { tag: "Our featured pick", o: featured, line: featured.bonusShort ?? featured.bonus, icon: "gift" as const },
    biggest && { tag: "Biggest welcome match", o: biggest, line: biggest.bonusShort ?? biggest.bonus, icon: "percent" as const },
    lowest && { tag: "Easiest welcome bonus", o: lowest, line: `${wagerView(lowest).mult}× to withdraw · ${lowest.bonusShort ?? lowest.bonus}`, icon: "bolt" as const },
    raceTop && { tag: "Biggest races", o: raceTop, line: raceFor(raceTop.slug)?.label ?? "", icon: "trophy" as const },
  ].filter(Boolean) as { tag: string; o: Operator; line: string; icon: IconName }[];

  return (
    <main style={{ background: "#07090B" }}>
      <section style={{ borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(80% 120% at 85% 0%, rgba(255,204,0,.08), transparent 55%), radial-gradient(60% 80% at 0% 100%, rgba(0,194,204,.07), transparent 60%), #0A0D10" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 40px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 14 }}>Casino bonuses</div>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(36px, 4.6vw, 54px)", lineHeight: 1.02, letterSpacing: "-.035em", fontWeight: 800, fontStretch: "114%", color: "#fff", textWrap: "balance" }}>
            Compare the best casino bonuses
          </h1>
          <p style={{ margin: "0 0 26px", maxWidth: "64ch", fontSize: 16.5, lineHeight: 1.6, color: "#A8B6BE" }}>
            Offers from {ops.length} crypto casinos, split by how they work. A welcome bonus is paid up front and has to be wagered before you can withdraw it. Rakeback, cashback and races are earned by playing and paid out as you go. Every term comes from the casino&apos;s own bonus rules.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <a href="#welcome" style={chip}><span style={chipIcon}><Icon name="gift" size={16} /></span>{welcome.length} welcome bonuses</a>
            <a href="#rewards" style={chip}><span style={chipIcon}><Icon name="percent" size={16} /></span>{rewards.length} rakeback, cashback &amp; races</a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 12 }}>Best for</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 44 }}>
          {picks.map((pk) => {
            const brand = brandFor(pk.o.slug);
            return (
              <Link key={pk.tag} href={`/casinos/${pk.o.slug}`} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 18, borderRadius: 16, background: `radial-gradient(120% 90% at 100% 0%, ${brand}1a, transparent 60%), #0C1013`, border: `1px solid ${brand}33` }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: brand }}>
                  <Icon name={pk.icon} size={14} /> {pk.tag}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 30, height: 30, flex: "none", borderRadius: 8, overflow: "hidden" }}>
                    <BrandMark slug={pk.o.slug} mono={pk.o.mono} tint={brand} radius={8} fontSize={10} />
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{pk.o.name}</span>
                </span>
                <span style={{ fontSize: 15.5, lineHeight: 1.3, fontWeight: 800, color: "#fff" }}>{pk.line}</span>
                <span style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#00C2CC" }}>
                  View offer <Icon name="arrow" size={14} />
                </span>
              </Link>
            );
          })}
        </div>

        {/* WELCOME BONUSES */}
        <Heading id="welcome" eyebrow="Paid up front" title="Welcome bonuses">
          The casino adds bonus money when you deposit. Before you can withdraw it you have to bet it a set number of times: a $100 bonus at 30× means $3,000 of bets.
        </Heading>
        <Table cols={WELCOME_COLS} head={["Casino", "Offer", "Wager to withdraw", "Bets on $100 + $100", "Time limit", "Max cashout", ""]}>
          {welcome.map((o, i) => {
            const c = casinoFacts(o);
            const w = toWithdraw(o);
            return (
              <Row key={o.slug} o={o} i={i} cols={WELCOME_COLS} tag="Welcome bonus">
                <Offer o={o} />
                <Cell label="Wager to withdraw" value={w.text} color={w.color} />
                <Cell label="Bets on $100 + $100" value={betsOn100(o)} />
                <Cell label="Time limit" value={c.expiry} />
                <Cell label="Max cashout" value={c.maxCashout} />
              </Row>
            );
          })}
        </Table>

        {/* REWARDS */}
        <div style={{ height: 48 }} />
        <Heading id="rewards" eyebrow="Earned as you play" title="Rakeback, cashback & races">
          Nothing is paid up front. You earn these by wagering: rakeback returns a share of every bet, cashback a share of your losses, and races rank players by how much they bet. Most pay out as cash on a set schedule; any playthrough on a reward is on that casino&apos;s report.
        </Heading>
        <Table cols={REWARD_COLS} head={["Casino", "Offer", "Earned from", "Paid", "Drops & races", ""]}>
          {rewards.map((o, i) => {
            const extra = [dropFor(o.slug), raceFor(o.slug)?.label].filter(Boolean).join(" · ");
            return (
              <Row key={o.slug} o={o} i={i} cols={REWARD_COLS} tag="Rewards">
                <Offer o={o} />
                <Cell label="Earned from" value={earnedBy(o)} />
                <Cell label="Paid" value={paidWhen(o)} />
                <Cell label="Drops & races" value={extra || null} small />
              </Row>
            );
          })}
        </Table>

        <div style={{ marginTop: 28 }}>
          <EmailSignup source="bonuses" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14, marginTop: 14 }}>
          <div style={{ padding: "26px 28px", borderRadius: 18, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 10 }}>How to read this</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#A8B6BE" }}>
              &ldquo;Wager to withdraw&rdquo; applies to welcome bonuses: the bonus stays locked until you have bet it that many times. &ldquo;Bets on $100 + $100&rdquo; prices every offer on the same stake, a $100 deposit with a $100 bonus, so a multiplier on the bonus, the deposit or both can be compared directly. Rewards work the other way round: the betting comes first, and what you earn is paid out afterwards. Most casinos also ask you to bet each deposit once before withdrawing; that is a standard deposit rule, not a bonus requirement.
            </p>
          </div>
          <Link href="/guides/reading-wagering-requirements" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 18, padding: "26px 28px", borderRadius: 18, background: "linear-gradient(150deg,#10181B,#0B0F12)", border: "1px solid rgba(0,194,204,.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-.015em" }}>Reading wagering requirements</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "#00C2CC" }}>
              Read the guide <Icon name="arrow" size={14} />
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

const chip = { display: "inline-flex", alignItems: "center", gap: 9, padding: "9px 14px", borderRadius: 100, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.08)", fontSize: 13.5, fontWeight: 600, color: "#E8EDF0" } as const;
const chipIcon = { color: "#00C2CC", display: "inline-flex" } as const;

function Heading({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div id={id} style={{ scrollMarginTop: 90, marginBottom: 16 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>{eyebrow}</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 30, lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 800, color: "#fff" }}>{title}</h2>
      <p style={{ margin: 0, maxWidth: "72ch", fontSize: 15, lineHeight: 1.6, color: "#A8B6BE" }}>{children}</p>
    </div>
  );
}

function Table({ cols, head, children }: { cols: string; head: string[]; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", background: "linear-gradient(180deg,#0E1317,#0A0E11)", overflow: "hidden" }}>
      <div className={`hidden md:grid ${cols} items-center gap-4`} style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6E7F88" }}>
        {head.map((h, i) => <span key={i}>{h}</span>)}
      </div>
      {children}
    </div>
  );
}

function Row({ o, i, cols, tag, children }: { o: Operator; i: number; cols: string; tag: string; children: ReactNode }) {
  const brand = brandFor(o.slug);
  const href = `/casinos/${o.slug}`;
  return (
    <div className={`grid grid-cols-2 ${cols} items-center gap-x-4 gap-y-3 transition-colors hover:bg-white/[0.025]`} style={{ padding: "16px 20px", borderTop: i ? "1px solid rgba(255,255,255,.05)" : undefined, background: o.featured ? `linear-gradient(90deg, ${brand}12, transparent 60%)` : undefined }}>
      <Link href={href} className="col-span-2 md:col-span-1" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, overflow: "hidden" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={brand} radius={10} fontSize={11} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{o.name}</span>
          <span style={{ display: "inline-block", marginTop: 3, padding: "2px 8px", borderRadius: 100, background: o.featured ? `${brand}1f` : "rgba(255,255,255,.05)", fontFamily: MONO, fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", color: o.featured ? brand : "#8DA0AA" }}>
            {o.featured ? "Featured" : tag}
          </span>
        </span>
      </Link>
      {children}
      <div className="col-span-2 md:col-span-1">
        <Link href={href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 12px", borderRadius: 10, background: o.featured ? brand : "#00C2CC", color: "#0A0D0F", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
          View offer <Icon name="arrow" size={14} />
        </Link>
      </div>
    </div>
  );
}

function Offer({ o }: { o: Operator }) {
  return (
    <Link href={`/casinos/${o.slug}`} className="col-span-2 md:col-span-1" style={{ fontSize: 15, lineHeight: 1.3, fontWeight: 700, color: "#E8EDF0", minWidth: 0 }}>
      {o.bonusShort ?? o.bonus}
    </Link>
  );
}

function Cell({ label, value, color = "#fff", small }: { label: string; value: string | null; color?: string; small?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div className="md:hidden" style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".07em", textTransform: "uppercase", color: "#6E7F88", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: small ? 12.5 : 14, lineHeight: 1.35, fontWeight: small ? 600 : 700, color: value ? color : "#4E5A62" }}>{value ?? "—"}</div>
    </div>
  );
}
