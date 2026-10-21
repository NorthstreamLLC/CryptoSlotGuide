import Link from "next/link";
import { LandingShell, LinkCloud } from "@/components/landing/LandingShell";
import { pageMetadata } from "@/lib/seo";
import { watchEntries, pendingOperators, type WatchEntry } from "@/lib/casino-changewatch";
import styles from "./watch.module.css";

export const metadata = pageMetadata("Casino ChangeWatch", "Sourced records of casino verification, withdrawal and offer terms, with baselines distinguished from evidenced changes.", "/casino-changewatch", undefined, { noindex: watchEntries.length === 0 });
const operatorScopes: Record<string, string> = {
 stake: "Covers Stake.com only, not Stake.us.",
 rainbet: "English terms and help guidance. Localized terms can differ.",
 roobet: "Public help guidance; governing legal terms were not fully verified.",
 rollbit: "Public help guidance; governing legal terms were not fully verified."
};
const summaries: Record<string, string> = {
 "rainbet-verification-20261021": "English terms reserve ID, address and other checks before withdrawals and during the account lifecycle.",
 "rainbet-withdrawals-20261021": "English terms list a $15-equivalent minimum, except account closure, and a 1x crypto-deposit wagering lock.",
 "rainbet-offers-20261021": "The published First Deposit Promotion requires 40x deposit + bonus wagering. This is promotion-specific, not a universal rule.",
 "roobet-wagering-20261021": "Help guidance requires deposits to be wagered once. Only settled sportsbook bets count; this is a deposit rule, not bonus rollover.",
 "roobet-fees-20261021": "Roobet says it adds no crypto-withdrawal fee. Blockchain network fees still apply and appear in the cashier.",
 "roobet-verification-20261021": "Level 2 help guidance lists a passport, driving licence or government ID. This does not establish a universal verification threshold.",
 "rollbit-withdrawals-20261021": "Help guidance lists a $10 deposit and $10 wager prerequisite for new-account withdrawals. KYC and other requirements can still apply.",
 "rollbit-verification-20261021": "KYC may be required up to Level 5 depending on the account, according to Rollbit's public help guidance.",
 "gamdom-verification-20261021": "Verification can be required for promotions or withdrawals. Required checks must be completed before withdrawals resume.",
 "gamdom-withdrawals-20261021": "Deposits and free-spin winnings require at least one wager-through before withdrawal. Other eligibility rules still apply.",
 "stake-withdrawals-20261021": "Identity checks may hold up withdrawals. Deposits must be wagered once; bonus expiry depends on the promotion.",
 "shuffle-offers-20261021": "Default bonus rules use deposit + bonus, a 30-day window and a US$10-equivalent maximum bet. Individual promotions can override these defaults.",
};
const date = (value: string) => new Date(value + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function Page() {
 const groups = new Map<string, WatchEntry[]>();
 for (const entry of watchEntries) groups.set(entry.operatorSlug, [...(groups.get(entry.operatorSlug) ?? []), entry]);
 return <LandingShell crumbs={[{label:"Home",href:"/"},{label:"Casino ChangeWatch"}]} eyebrow="Know what you are agreeing to" title="Casino ChangeWatch" intro="Verification, withdrawals and bonus terms, checked against official sources. These first records establish a baseline, not proof of a policy change.">
  <div className={styles.watch}>
   {watchEntries.every(e => e.kind === "baseline") && <div className={styles.notice}><span className={styles.status}>Initial baseline</span><div><strong>No verified changes recorded yet</strong><p>We are establishing the starting point. A change will appear only when both the old and new terms are evidenced.</p></div></div>}
   <p className={styles.coverage}>{groups.size} operators with sourced baselines{pendingOperators.length ? ` / ${pendingOperators.length} awaiting terms verification` : ""}. Inclusion is not a ranking.</p>
   <div className={styles.cards}>
    {[...groups].map(([slug, entries]) => {
     const name = slug === "stake" ? "Stake.com" : entries[0].operator;
     const checkedDates = [...new Set(entries.map(e => e.source.checkedDate))];
     return <article className={styles.card} key={slug}>
      <header className={styles.cardHeader}>
       <div><h2>{name}</h2>{operatorScopes[slug] && <p className={styles.scope}>{operatorScopes[slug]}</p>}</div>
       <div className={styles.checked}><span>Last checked</span><strong>{date([...checkedDates].sort().at(-1)!)}</strong></div>
      </header>
      <div className={styles.entries}>
       {entries.map(e => <section className={styles.entry} key={e.id}>
        <div className={styles.pills}><span className={styles.category}>{e.category}</span><span className={styles.status}>{e.kind === "baseline" ? "Current baseline" : "Documented change"}</span></div>
        <p className={styles.summary}>{summaries[e.id] ?? e.current}</p>
        <div className={styles.sourceRow}><a href={e.source.url} rel="noopener noreferrer">View official source <span aria-hidden="true">&#8599;</span></a></div>
        <details className={styles.details}>
         <summary>Terms and evidence details</summary>
         <div><p>{e.current}</p><p>Effective date: {e.effectiveDate ? date(e.effectiveDate) : "Unknown. The source does not establish when this policy took effect."}</p>
          {checkedDates.length > 1 && <p>This record was checked on {date(e.source.checkedDate)}.</p>}
          {e.source.excerpt && <blockquote>{e.source.excerpt}</blockquote>}
          {e.kind === "change" && <><p>Previously: {e.previous}</p><a href={e.previousSource.url}>View previous evidence</a><p>Previous evidence checked {date(e.previousSource.checkedDate)}.</p><blockquote>{e.previousSource.excerpt}</blockquote></>}
         </div>
        </details>
       </section>)}
      </div>
      <footer className={styles.cardFooter}><Link href={`/casinos/${slug}`}>Read the {name} review <span aria-hidden="true">&#8594;</span></Link></footer>
     </article>;
    })}
    {pendingOperators.map(op => <article className={styles.card} key={op.operatorSlug}>
     <header className={styles.cardHeader}><div><h2>{op.operator}</h2><p className={styles.scope}>Not included in the verified baseline count.</p></div></header>
     <div className={styles.entries}><section className={styles.entry}>
      <div className={styles.pills}><span className={styles.pending}>Terms verification pending</span></div>
      <p className={styles.summary}>{op.reason}</p>
      <p className={styles.scope}>{op.guidanceNote}</p>
      <div className={styles.sourceRow}><a href={op.guidanceUrl} rel="noopener noreferrer">{op.guidanceLabel} <span aria-hidden="true">&#8599;</span></a></div>
     </section></div>
     <footer className={styles.cardFooter}><Link href={`/casinos/${op.operatorSlug}`}>Read the {op.operator} review <span aria-hidden="true">&#8594;</span></Link></footer>
    </article>)}
   </div>
   {!watchEntries.length && <div className={styles.card}><h2>No verified records yet</h2><p>This does not mean an operator&apos;s terms are unchanged. Check current official terms before relying on an offer or withdrawal rule.</p></div>}
   <details className={styles.method}><summary>How we track terms</summary><p>A baseline records terms seen on a checked date. A documented change requires both old and new source evidence. Checked dates say when we reviewed a source; effective dates say when the operator states the rule took effect and remain unknown unless evidenced. Coverage is selective and manually reviewed, not continuous monitoring.</p></details>
  </div>
  <LinkCloud title="Read before you decide" items={[{label:"Casino reviews",href:"/crypto-casinos"},{label:"Decode bonus terms",href:"/bonus-terms-decoder"},{label:"Verification explained",href:"/guides/kyc-thresholds-explained"},{label:"How we source information",href:"/how-we-rate"}]}/>
 </LandingShell>;
}
