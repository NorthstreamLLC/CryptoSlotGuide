/**
 * Which operators currently have REAL field-testing behind them — a
 * funded account actually opened, withdrawals actually timed, paytables
 * actually read inside that account (the process app/how-we-rate/page.tsx
 * describes as "the test protocol"). Confirmed 26 Aug 2026: this list is
 * empty today. Every "Tested by ..." byline and every per-operator RTP
 * Watch reading currently on the site is inherited from the original
 * design mockup's placeholder flavor text, not real work — none of it
 * has actually been done yet. The site is not public yet, so that's fine
 * for now, but nothing here should start reading as a completed claim
 * before this list says otherwise.
 *
 * Add an operator's slug here only once its casino review, and any
 * RTP Watch readings attributed to it, are backed by real testing.
 * This directly gates:
 *  - which operators' RTP Watch readings render as real vs. "not yet
 *    checked" (lib/entity-view.ts's slot branch, lib/rtp-watch-view.ts)
 *  - the slot review page's per-operator "RTP by casino build" table
 *  - (future) casino review bylines, once those get the same treatment
 */
export const FIELD_TESTED_OPERATOR_SLUGS: string[] = [];

export function isFieldTestedOperator(slug: string): boolean {
  return FIELD_TESTED_OPERATOR_SLUGS.includes(slug);
}
