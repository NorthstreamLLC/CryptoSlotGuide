import { siteData } from "./site-data";
import { inHouseOrder } from "./house-order";
import type { PredictionMarket } from "./types";
import avail from "@/data/predAvailability.json";
import { COUNTRIES } from "./legal";

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

/* ------------------------------------------------------------------ */
/* Venue pages and availability by country                             */
/* ------------------------------------------------------------------ */


export interface VenueAvailability {
  mode: "blocklist" | "allowlist" | "agreement" | "broker";
  codes: string[];
  regions?: { country: string; name: string }[];
  closeOnly?: string[];
  unclear?: { quote: string; codes: string[] }[];
  complete: boolean;
  vpnBanned?: boolean;
  url: string;
  helpUrl?: string;
  asOf: string;
  text: string;
}

const AVAIL = (avail as unknown as { venues: Record<string, VenueAvailability> }).venues;

export const availabilityOf = (slug: string): VenueAvailability | null => AVAIL[slug] ?? null;

export const venueHref = (slug: string) => `/prediction-markets/${slug}`;
export const predCountryHref = (code: string) => `/prediction-markets/in/${code.toLowerCase()}`;

/** Every venue with the list it sits on. */
export function allVenues(): { v: PredictionMarket; tab: PredictionTab }[] {
  return [...venuesInOrder("crypto").map((v) => ({ v, tab: "crypto" as const })), ...venuesInOrder("fiat").map((v) => ({ v, tab: "fiat" as const }))];
}
export const venueBySlug = (slug: string) => allVenues().find((x) => x.v.slug === slug) ?? null;

export type VenueStatus =
  /** Not on the venue's list: open. */
  | { kind: "open" }
  /** Named on the list. */
  | { kind: "blocked" }
  /** Existing positions may be closed, nothing new opened. */
  | { kind: "close-only" }
  /** Open, except the named regions. */
  | { kind: "regions"; regions: string[] }
  /** The venue's wording could mean this country; quoted, not guessed. */
  | { kind: "unclear"; quote: string }
  /** Eligibility is set somewhere we cite but cannot read as a list (Kalshi's agreement, ForecastEx's brokers). */
  | { kind: "check" }
  /** An allowlist venue that does not serve this country. */
  | { kind: "not-offered" };

export function statusIn(slug: string, code: string): VenueStatus {
  const a = AVAIL[slug];
  const c = code.toUpperCase();
  if (!a) return { kind: "check" };
  if (a.mode === "allowlist") return a.codes.includes(c) ? { kind: "open" } : { kind: "not-offered" };
  if (a.mode === "agreement") return a.codes.includes(c) ? { kind: "open" } : { kind: "check" };
  if (a.mode === "broker") return { kind: "check" };
  if (a.closeOnly?.includes(c)) return { kind: "close-only" };
  if (a.codes.includes(c)) return { kind: "blocked" };
  const u = a.unclear?.find((x) => x.codes.includes(c));
  if (u) return { kind: "unclear", quote: u.quote };
  const regions = (a.regions ?? []).filter((r) => r.country === c).map((r) => r.name);
  if (regions.length) return { kind: "regions", regions };
  return { kind: "open" };
}

/** The countries with a prediction-markets page: every country we have written up, plus the US, where the regulated venues are. */
export function predCountries(): { code: string; name: string }[] {
  const list = COUNTRIES.filter((c) => !c.code.includes("-")).map((c) => ({ code: c.code, name: c.name }));
  return [{ code: "US", name: "United States" }, ...list].sort((a, b) => a.name.localeCompare(b.name));
}
export const predCountry = (code: string) => predCountries().find((c) => c.code === code.toUpperCase()) ?? null;

/** How many venues of a list are usable (open or open-except-regions) in a country. */
export function openCount(tab: PredictionTab, code: string): number {
  return venuesInOrder(tab).filter((v) => {
    const s = statusIn(v.slug, code);
    return s.kind === "open" || s.kind === "regions";
  }).length;
}

const REGION = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();
/** A country's name for a code the venues list (they name more places than we have pages for). */
export function countryNameOf(code: string): string {
  const ours = predCountry(code)?.name;
  if (ours) return ours;
  try {
    const n = REGION?.of(code);
    return n && n !== code ? n : code;
  } catch {
    return code;
  }
}
