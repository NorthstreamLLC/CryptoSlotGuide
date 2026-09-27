/**
 * Display helpers for a slot's studio-published figures. Checked against
 * each studio's own game page on 15 Sep 2026 (see Slot.sourceUrl); a
 * figure the studio doesn't publish is listed in Slot.unpublished and
 * shows as "Not published" instead of a number from a slot database.
 */
import type { Slot } from "./types";
import { siteData } from "./site-data";

export const hasRtp = (s: Slot) => !s.unpublished?.includes("rtp");
export const hasVol = (s: Slot) => !s.unpublished?.includes("vol");
export const hasMaxWin = (s: Slot) => !s.unpublished?.includes("maxWin");

export const rtpLabel = (s: Slot) => (hasRtp(s) ? `${s.rtp.toFixed(2)}%` : "Not published");
export const volLabel = (s: Slot) => (hasVol(s) ? s.vol : "Not published");
export const maxWinLabel = (s: Slot) => (hasMaxWin(s) ? s.maxWin : "Not published");

/** Sort key for "highest RTP first" — unpublished RTP sorts last. */
export const rtpSortValue = (s: Slot) => (hasRtp(s) ? s.rtp : -1);

/**
 * The slots carrying a mechanic tag, highest RTP first — the order the
 * category page renders. Shared with that page's ItemList schema so the two
 * cannot drift.
 */
export function slotsByMechanic(tag: string) {
  const { slots, slotTags } = siteData;
  return slots
    .filter((s) => (slotTags[s.slug] ?? []).includes(tag as never))
    .sort((a, b) => rtpSortValue(b) - rtpSortValue(a));
}
