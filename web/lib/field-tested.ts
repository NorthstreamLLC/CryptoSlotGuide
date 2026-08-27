/**
 * Which operators currently have REAL field-testing behind them — a
 * funded account actually opened, withdrawals actually timed, paytables
 * actually read inside that account (the process app/how-we-rate/page.tsx
 * describes as "the test protocol"). Backed by data/fieldTestedOperators.json,
 * which starts empty and is meant to be maintained two ways:
 *
 *  1. Automatically, by scripts/import-rtp-readings.mjs — importing real
 *     RTP Watch readings for an operator adds its slug here too, since
 *     reading a paytable inside an operator's client requires the same
 *     funded account as everything else "field-tested" claims.
 *  2. By hand, once a casino/wallet/exchange review itself gets a real
 *     funded-account pass (not just RTP checks) — add the slug directly
 *     to the JSON file.
 *
 * Confirmed 26 Aug 2026: this list was empty at that point — every
 * "Tested by ..." byline and RTP Watch reading on the site up to then was
 * the original design mockup's placeholder flavor text, not real work.
 * The site isn't public yet, so that's fine as of writing, but nothing
 * here should start reading as a completed claim before this list says
 * otherwise. This directly gates:
 *  - which operators' RTP Watch readings render as real vs. "not yet
 *    checked" (lib/entity-view.ts's slot branch, lib/rtp-watch-view.ts)
 *  - the slot review page's per-operator "RTP by casino build" table
 *  - casino/wallet/exchange review bylines and standfirst claims
 */
import { siteData } from "./site-data";

export function isFieldTestedOperator(slug: string): boolean {
  return siteData.fieldTestedOperators.includes(slug);
}

/**
 * Separate from the above — whether an operator's *desk-research*
 * criteria (bonus terms, coin/chain support, licence + complaint
 * history — data/criteria.json's "editorial"-sourced rows) have
 * actually been checked against real public sources: the operator's
 * own T&Cs/help pages, the licensing regulator's own register, and
 * AskGamblers/Casino.Guru's complaint history. No funded account
 * needed for any of that, which is the whole point — but it still has
 * to actually happen before ops.json's wager/kyc/licence/bonus fields
 * can be shown as verified rather than "published, not yet audited."
 * Backed by data/editoriallyAuditedOperators.json, empty until real
 * desk research is done and the slug is added by hand.
 */
export function isEditoriallyAudited(slug: string): boolean {
  return siteData.editoriallyAuditedOperators.includes(slug);
}
