/**
 * Stake Wheel Wars: a Pragmatic Play promotion at Stake, 19 July 2026 00:01 UTC
 * to 2 January 2027 23:59 UTC (Stake's own terms). Everything that shows it (the
 * homepage strip, the section on /promo-codes/stake) reads from here and
 * switches off at END, so nothing about it stays on the site afterwards.
 *
 * Source: Stake's casino promotions page, the same page the stored
 * "Bonus terms / Leaderboards" fact for Stake cites. Prize tables are as Stake
 * states them: wheel-drop prizes are multiples of the winning bet, the Saturday
 * tournament pays fixed US-dollar amounts.
 */
export const WHEEL_WARS_START = Date.UTC(2026, 6, 19, 0, 1);
export const WHEEL_WARS_END = Date.UTC(2027, 0, 2, 23, 59);
export const wheelWarsLive = (now = Date.now()) => now >= WHEEL_WARS_START && now < WHEEL_WARS_END;

export const WHEEL_WARS_PATH = "/promo-codes/stake#wheel-wars";
export const WHEEL_WARS_SOURCE = "https://stake.com/promotions/category/casino";

/** Weekly Wheel Drops: [number of prizes, prize]. */
export const WHEEL_DROPS: [number, string][] = [
  [1, "2,000×"],
  [1, "1,000×"],
  [2, "500×"],
  [6, "100×"],
  [20, "50×"],
  [50, "20×"],
  [260, "10×"],
  [2660, "5×"],
];

/** Saturday Tournament: [position, prize]. */
export const SATURDAY_TOURNAMENT: [string, string][] = [
  ["1", "$5,000"],
  ["2", "$2,000"],
  ["3", "$1,000"],
  ["4–10", "$500"],
  ["11–20", "$100"],
  ["21–40", "$50"],
  ["41–80", "$20"],
  ["81–150", "$10"],
];
