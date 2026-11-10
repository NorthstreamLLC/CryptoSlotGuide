"use client";
import { useState } from "react";
import { amount, decode, formatAmount, type Basis } from "@/lib/bonus-decoder";
import styles from "./tools.module.css";

/** A casino's welcome bonus, from the Bonus true-cost index (lib/bonus-index.ts) and its stored facts. */
export type DecoderPreset = {
  slug: string;
  name: string;
  match: number;
  mult: number;
  basis: Exclude<Basis, "unknown">;
  edgeBase: number | null;
  maxBet: string | null;
  maxCashout: string | null;
  expiry: string | null;
  note: string | null;
  source: string | null;
};

const fields = { bonus: "Bonus amount", deposit: "Deposit amount", multiplier: "Wagering multiplier (×)", contribution: "Game contribution (%)", rtp: "Game RTP (%)", maxBet: "Maximum eligible bet", cap: "Maximum total cashout (fixed amount)", days: "Expiry period (days)" };
type Values = Record<keyof typeof fields, string>;
const empty: Values = { bonus: "", deposit: "", multiplier: "", contribution: "", rtp: "96", maxBet: "", cap: "", days: "" };
const pctText = (n: number) => `${(n * 100).toFixed(2).replace(/\.?0+$/, "")}%`;

export function BonusDecoder({ presets = [] }: { presets?: DecoderPreset[] }) {
  const [values, setValues] = useState(empty);
  const [basis, setBasis] = useState<Basis>("unknown");
  const [currency, setCurrency] = useState("USD");
  const [submitted, setSubmitted] = useState(false);
  const [presetSlug, setPresetSlug] = useState("");
  const preset = presets.find((p) => p.slug === presetSlug) ?? null;
  const result = decode({ ...values, basis, edgeBase: preset?.edgeBase ?? null });
  const invalid = Object.entries(values).filter(([k, v]) => v.trim() && (amount(v) === null || ((k === "contribution" || k === "rtp") && Number(v) > 100)));
  const money = (n: number | null) => formatAmount(n === null ? null : Math.round(n * 100) / 100, currency);

  function choose(slug: string) {
    setPresetSlug(slug);
    setSubmitted(false);
    const p = presets.find((x) => x.slug === slug);
    if (!p) return;
    const deposit = amount(values.deposit) ?? 100;
    setCurrency("USD");
    setBasis(p.basis);
    setValues({ ...empty, rtp: values.rtp || "96", deposit: String(deposit), bonus: String(Math.round(deposit * p.match * 100) / 100), multiplier: String(p.mult), contribution: "100" });
  }
  function change(k: keyof Values, v: string) {
    const next = { ...values, [k]: v };
    // With a casino picked, the bonus follows the deposit at that casino's match.
    if (preset && k === "deposit" && amount(v) !== null) next.bonus = String(Math.round(amount(v)! * preset.match * 100) / 100);
    setValues(next);
    setSubmitted(false);
  }

  return (
    <div className={styles.tool}>
      <form className={styles.formCard} onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} noValidate>
        <div className={styles.formHeading}><span>YOUR OFFER</span><h2>Start with the small print</h2></div>
        {presets.length > 0 && (
          <div className={styles.grid} style={{ marginBottom: 0 }}>
            <label>
              Fill in from a casino&apos;s terms
              <select value={presetSlug} onChange={(e) => choose(e.target.value)}>
                <option value="">Enter my own terms</option>
                {presets.map((p) => <option key={p.slug} value={p.slug}>{p.name}: {Math.round(p.match * 100)}%, {p.mult}× {p.basis === "deposit-bonus" ? "deposit + bonus" : p.basis === "bonus" ? "bonus" : "deposit"}</option>)}
              </select>
            </label>
          </div>
        )}
        {preset && (
          <p>
            {preset.name}&apos;s first-deposit offer, from its own terms: a {Math.round(preset.match * 100)}% match at {preset.mult}× {preset.basis === "deposit-bonus" ? "the deposit plus the bonus" : preset.basis === "bonus" ? "the bonus" : "the deposit"}.
            {preset.edgeBase ? ` Bets count by house edge against ${pctText(preset.edgeBase)}, so the game you pick doesn't change the cost.` : ""}
            {preset.maxBet ? ` Max bet: ${preset.maxBet}.` : ""}
            {preset.maxCashout ? ` Max cashout: ${preset.maxCashout}.` : ""}
            {preset.expiry ? ` Time limit: ${preset.expiry}.` : ""}
            {preset.note ? ` ${preset.note}` : ""}
            {preset.source && <> <a href={preset.source} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>Read the terms ↗</a></>}
            {" "}The bonus assumes your deposit is within its maximum.
          </p>
        )}
        <p id="decoder-help">{preset ? "Change the deposit or RTP to see your own numbers, or edit any field." : "Copy your offer terms below. Blank means unknown."} All monetary amounts must use the same currency; no exchange conversion is performed. Changing the currency only changes the label.</p>
        <div className={styles.grid}>
          <label>Currency<select value={currency} onChange={(e) => { setCurrency(e.target.value); setSubmitted(false); }}>{["USD", "EUR", "GBP", "BTC", "ETH", "USDT"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Wagering basis<select value={basis} onChange={(e) => { setBasis(e.target.value as Basis); setSubmitted(false); }}><option value="unknown">Unknown — check terms</option><option value="bonus">Bonus only</option><option value="deposit-bonus">Deposit + bonus</option><option value="deposit">Deposit only</option></select></label>
          {Object.entries(fields).map(([key, label]) => {
            const k = key as keyof Values;
            const bad = invalid.some(([i]) => i === k);
            return (
              <label key={k}>
                {label}{["bonus", "deposit", "maxBet", "cap"].includes(k) ? ` (${currency})` : ""}
                <input type="number" inputMode="decimal" min="0" max={k === "contribution" || k === "rtp" ? 100 : undefined} step="any" value={values[k]} aria-invalid={bad} aria-describedby={bad ? `${k}-error` : "decoder-help"} onChange={(e) => change(k, e.target.value)} />
                {bad && <span id={`${k}-error`} className={styles.error}>Enter a finite number from 0{k === "contribution" || k === "rtp" ? " to 100" : " upward"}.</span>}
              </label>
            );
          })}
        </div>
        <p>Expiry starts at the event named in the offer (for example, activation). Days here do not establish an exact deadline or timezone. If the cap uses a multiplier, convert it only using the basis stated in the terms.</p>
        <button type="submit">Explain these terms</button>{" "}
        <button type="button" onClick={() => { setValues(empty); setBasis("unknown"); setPresetSlug(""); setSubmitted(false); }}>Clear</button>
      </form>
      <section className={styles.results} aria-live="polite" aria-atomic="true">
        {submitted && (invalid.length ? <p role="alert">Correct the highlighted inputs before calculating.</p> : <>
          <h2>{preset ? `${preset.name}'s bonus, explained` : "Your terms, explained"}</h2>
          <p className={styles.total}><span>Required qualifying wagering</span><strong>{money(result.required)}</strong></p>
          <div className={styles.resultBlock}>
            <h3>Calculation</h3>
            <p>Basis: {basis === "bonus" ? "bonus only" : basis === "deposit-bonus" ? "deposit + bonus" : basis === "deposit" ? "deposit only" : "unknown"}.</p>
            <p>{money(result.base)} x {values.multiplier.trim() || "unknown multiplier"} = {money(result.required)}.</p>
          </div>
          <div className={styles.resultBlock}>
            <h3>Game contribution</h3>
            {preset?.edgeBase ? <p>{preset.name} counts each bet by its game&apos;s house edge against {pctText(preset.edgeBase)}, so a low-edge game counts less and the contribution field doesn&apos;t apply.</p>
              : amount(values.contribution) === null ? <p>Game contribution: Not provided. Total stakes required cannot be calculated without it.</p>
              : amount(values.contribution) === 0 ? <p>Game contribution: 0%. A game with 0% contribution cannot advance wagering.</p>
              : <>
                <p>At {values.contribution}% contribution, total stakes needed for that wagering: {money(result.adjusted)}.</p>
                <p>This assumes the same contribution applies to every qualifying bet.</p>
              </>}
          </div>
          <div className={styles.resultBlock}>
            <h3>What finishing it costs, on average</h3>
            {result.cost === null ? <p>Enter the bonus, the game&apos;s RTP and the contribution to see the average cost of the wagering.</p> : <>
              <p>Average cost of the wagering: {money(result.cost)}{preset?.edgeBase ? ` (${pctText(preset.edgeBase)} of the wagering, whatever you play)` : ` (the stakes times the ${pctText(1 - (amount(values.rtp) ?? 0) / 100)} house edge of a ${values.rtp}% RTP game)`}.</p>
              {result.net !== null && <p>Bonus minus that cost: <strong style={{ color: result.net >= 0 ? "#57E39A" : "#FF7E7E" }}>{result.net < 0 ? "−" : "+"}{money(Math.abs(result.net))}</strong>. {result.net < 0 ? "On average, finishing the wagering costs more than the bonus gives." : "On average, the bonus is worth more than finishing its wagering costs."}</p>}
              {result.breakEven !== null ? <p>Break-even RTP: {pctText(result.breakEven)}. A game would need at least that RTP, and full contribution, for the bonus to pay on average.</p>
                : preset?.edgeBase ? <p>No break-even RTP: with house-edge weighting, the cost is the same on every game.</p> : null}
              <p>This is an average over many plays, not a prediction: one session can win or lose far more, and running out of money ends the wagering early.</p>
            </>}
          </div>
          <div className={styles.resultBlock}>
            <h3>Maximum bet</h3>
            {preset?.maxBet && !values.maxBet.trim() ? <p>{preset.name}&apos;s terms: {preset.maxBet}.</p> : <>
              <p>Maximum eligible bet: {money(amount(values.maxBet))}.</p>
              {amount(values.maxBet) === 0 && <p>A zero limit permits no positive eligible bet.</p>}
            </>}
            <p>This is a ceiling, not a recommended stake; excluded games and other limits still apply.</p>
          </div>
          <div className={styles.resultBlock}>
            <h3>Withdrawal cap</h3>
            {preset?.maxCashout && !values.cap.trim() ? <p>{preset.name}&apos;s terms: {preset.maxCashout}.</p> : <p>Maximum total cashout: {money(amount(values.cap))}.</p>}
            <p>This is only the cap stated, not a predicted withdrawal or balance. Check whether the cap applies to winnings, bonus funds or the entire withdrawal.</p>
          </div>
          <div className={styles.resultBlock}>
            <h3>Expiry</h3>
            <p>{values.days.trim() ? `${values.days} days after the offer's specified start event.` : preset?.expiry ? `${preset.name}'s terms: ${preset.expiry}.` : "Unknown - check the start event, deadline and timezone."}</p>
            {amount(values.days) === 0 && <p>Zero means no elapsed-day window.</p>}
          </div>
          <aside className={styles.notes}>
            <h3>Important notes</h3>
            <ul>
              <li>Required wagering is turnover. The average cost is turnover times the house edge; neither is a deposit recommendation or a guaranteed withdrawal.</li>
              <li>Maximum profit is different from maximum total cashout: do not enter a profit-only cap as a total cashout cap.</li>
              <li>Any bonus principal removed at cashout is separate from the wagering basis and is not deducted by this calculator.</li>
              <li>Losses can exhaust funds before completion. Even 0x wagering does not establish withdrawal eligibility.</li>
              <li>Rounding is for display only; confirm exact terms with the operator.</li>
            </ul>
          </aside>
        </>)}
      </section>
    </div>
  );
}
