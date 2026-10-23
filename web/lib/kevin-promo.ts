/**
 * Pragmatic Play x Kevin Hart, 19 October - 7 November 2026: a network-wide
 * Pragmatic promotion that runs inside its games at participating casinos.
 * Everything that shows it (homepage banner, /play-with-kevin-hart, the bell)
 * reads from here, and all of it switches off at END, so nothing about an
 * expired promotion stays on the site after the campaign.
 */

/** Bet with Kevin closes 7 November 2026 at 17:30 UTC (Pragmatic's in-game terms). */
export const KEVIN_END = Date.UTC(2026, 10, 7, 17, 30);
export const kevinLive = (now = Date.now()) => now < KEVIN_END;

export const KEVIN_PATH = "/play-with-kevin-hart";

/** Pragmatic's excluded markets: countries, plus provinces/cities as "CC-RR". */
const EXCLUDED_COUNTRIES = new Set(["AT", "BS", "BE", "BG", "HR", "CZ", "DK", "DE", "GR", "IT", "LV", "LT", "NL", "NO", "PT", "RO", "SK", "ES", "SE", "CH", "UA", "GB", "VE"]);
const EXCLUDED_REGIONS = new Set(["CA-AB", "CA-ON", "AR-C"]);

/** Online casino play is banned outright (Brazil: Provisional Measure 1.394, from 6 October 2026). */
const BANNED = new Set(["BR"]);

/**
 * Where the promotion is not offered, where online casinos are banned, or
 * where none of the casinos we list for it accepts players (the US: Roobet,
 * Stake and Gamdom all refuse it). Each casino card also carries its own geo note.
 */
export function kevinBlocked(country?: string | null, region?: string | null): boolean {
  if (!country) return false;
  const c = country.toUpperCase();
  if (c === "US" || EXCLUDED_COUNTRIES.has(c) || BANNED.has(c)) return true;
  return !!region && EXCLUDED_REGIONS.has(`${c}-${region.toUpperCase()}`);
}

/** Casinos whose own promotions page shows the campaign. */
export const KEVIN_CASINOS: { slug: string; sourceUrl: string }[] = [
  { slug: "roobet", sourceUrl: "https://roobet.com/promotions/kevin-hart-takes-over-roobet" },
  { slug: "stake", sourceUrl: "https://stake.com/promotions/category/casino" },
  { slug: "gamdom", sourceUrl: "https://gamdom.com/promotions/125m-prize-pool-play-with-kevin-hart" },
];

export const KEVIN_GAMES = ["Mega Wheel", "Amazing Baccarat", "Gates of Olympus Roulette", "Mega Roulette", "Money Time", "Sweet Bonanza CandyLand"];
