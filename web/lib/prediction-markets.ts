import { siteData } from "./site-data";
import { inHouseOrder } from "./house-order";
import type { PredictionMarket } from "./types";

export type PredictionTab = "crypto" | "fiat";

/**
 * The venues of one tab, in placement order.
 *
 * The page sorted A–Z while its ItemList was emitted in file order, so the
 * structured data described a different list from the one on screen — the one
 * mismatch Google penalises outright. Both now read this, so there is exactly
 * one order and it is the house order: the same mechanism the casino lists use,
 * disclosed by the same strip in the header, reordered in the same file.
 */
export function venuesInOrder(tab: PredictionTab): PredictionMarket[] {
  return inHouseOrder(siteData.predMarkets[tab]);
}

/** Where the row's button goes, and whether that is a tracked link. */
export function venueCta(v: PredictionMarket): { href: string; sponsored: boolean } {
  return v.affiliate && v.signupUrl ? { href: v.signupUrl, sponsored: true } : { href: v.site, sponsored: false };
}
