"use client";
import { useState } from "react";
import { amount, decode, formatAmount, type Basis } from "@/lib/bonus-decoder";
import styles from "./tools.module.css";
const fields = { bonus: "Bonus amount", deposit: "Deposit amount", multiplier: "Wagering multiplier (×)", contribution: "Game contribution (%)", maxBet: "Maximum eligible bet", cap: "Maximum total cashout (fixed amount)", days: "Expiry period (days)" };
type Values = Record<keyof typeof fields, string>;
const empty: Values = { bonus: "", deposit: "", multiplier: "", contribution: "", maxBet: "", cap: "", days: "" };
export function BonusDecoder() {
 const [values, setValues] = useState(empty);
 const [basis, setBasis] = useState<Basis>("unknown");
 const [currency, setCurrency] = useState("USD");
 const [submitted, setSubmitted] = useState(false);
 const result = decode({ ...values, basis });
 const invalid = Object.entries(values).filter(([k,v]) => v.trim() && (amount(v) === null || (k === "contribution" && Number(v) > 100)));
 const money = (n: number | null) => formatAmount(n, currency);
 return <div className={styles.tool}>
 <form className={styles.formCard} onSubmit={e => { e.preventDefault(); setSubmitted(true); }} noValidate>
 <div className={styles.formHeading}><span>YOUR OFFER</span><h2>Start with the small print</h2></div>
 <p id="decoder-help">Copy your offer terms below. Blank means unknown. All monetary amounts must use the same currency; no exchange conversion is performed. Changing the currency only changes the label.</p>
 <div className={styles.grid}>
 <label>Currency<select value={currency} onChange={e => {setCurrency(e.target.value);setSubmitted(false);}}>{["USD","EUR","GBP","BTC","ETH","USDT"].map(c => <option key={c}>{c}</option>)}</select></label>
 <label>Wagering basis<select value={basis} onChange={e => {setBasis(e.target.value as Basis);setSubmitted(false);}}><option value="unknown">Unknown — check terms</option><option value="bonus">Bonus only</option><option value="deposit-bonus">Deposit + bonus</option></select></label>
 {Object.entries(fields).map(([key,label]) => { const k = key as keyof Values; const bad = invalid.some(([i]) => i === k); return <label key={k}>{label}{["bonus","deposit","maxBet","cap"].includes(k) ? ` (${currency})` : ""}<input type="number" inputMode="decimal" min="0" max={k === "contribution" ? 100 : undefined} step="any" value={values[k]} aria-invalid={bad} aria-describedby={bad ? `${k}-error` : "decoder-help"} onChange={e => {setValues({...values,[k]:e.target.value});setSubmitted(false);}} />{bad && <span id={`${k}-error`} className={styles.error}>Enter a finite number from 0{ k === "contribution" ? " to 100" : " upward"}.</span>}</label>; })}
 </div><p>Expiry starts at the event named in the offer (for example, activation). Days here do not establish an exact deadline or timezone. If the cap uses a multiplier, convert it only using the basis stated in the terms.</p>
 <button type="submit">Explain these terms</button> <button type="button" onClick={() => {setValues(empty);setBasis("unknown");setSubmitted(false);}}>Clear</button>
 </form>
 <section className={styles.results} aria-live="polite" aria-atomic="true">{submitted && (invalid.length ? <p role="alert">Correct the highlighted inputs before calculating.</p> : <>
 <h2>Your terms, explained</h2>
 <p className={styles.total}><span>Required qualifying wagering</span><strong>{money(result.required)}</strong></p>
 <div className={styles.resultBlock}>
  <h3>Calculation</h3>
  <p>Basis: {basis === "bonus" ? "bonus only" : basis === "deposit-bonus" ? "deposit + bonus" : "unknown"}.</p>
  <p>{money(result.base)} x {values.multiplier.trim() || "unknown multiplier"} = {money(result.required)}.</p>
 </div>
 <div className={styles.resultBlock}>
  <h3>Game contribution</h3>
  {amount(values.contribution) === null ? <p>Game contribution: Not provided. Total stakes required cannot be calculated without it.</p> : amount(values.contribution) === 0 ? <p>Game contribution: 0%. A game with 0% contribution cannot advance wagering.</p> : <>
   <p>At {values.contribution}% contribution, total stakes needed for that wagering: {money(result.adjusted)}.</p>
   <p>This assumes the same contribution applies to every qualifying bet.</p>
  </>}
 </div>
 <div className={styles.resultBlock}>
  <h3>Maximum bet</h3>
  <p>Maximum eligible bet: {money(amount(values.maxBet))}.</p>
  {amount(values.maxBet) === 0 && <p>A zero limit permits no positive eligible bet.</p>}
  <p>This is a ceiling from your input, not a recommended stake; excluded games and other limits still apply.</p>
 </div>
 <div className={styles.resultBlock}>
  <h3>Withdrawal cap</h3>
  <p>Maximum total cashout: {money(amount(values.cap))}.</p>
  <p>This is only the fixed cap entered, not a predicted withdrawal or balance. Check whether the cap applies to winnings, bonus funds or the entire withdrawal.</p>
 </div>
 <div className={styles.resultBlock}>
  <h3>Expiry</h3>
  <p>{values.days.trim() ? `${values.days} days after the offer's specified start event.` : "Unknown - check the start event, deadline and timezone."}</p>
  {amount(values.days) === 0 && <p>Zero means no elapsed-day window.</p>}
 </div>
 <aside className={styles.notes}>
  <h3>Important notes</h3>
  <ul>
   <li>Required wagering is turnover, not expected loss, a deposit recommendation, or a guaranteed withdrawal.</li>
   <li>Maximum profit is different from maximum total cashout: do not enter a profit-only cap as a total cashout cap.</li>
   <li>Any bonus principal removed at cashout is separate from the wagering basis and is not deducted by this calculator.</li>
   <li>Losses can exhaust funds before completion. Even 0x wagering does not establish withdrawal eligibility.</li>
   <li>Rounding is for display only; confirm exact terms with the operator.</li>
  </ul>
 </aside>
 </>)}</section></div>;
}
