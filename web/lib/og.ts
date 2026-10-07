import { createHmac } from "node:crypto";

/**
 * The share card for a page with no picture of its own: /og?t=<title>&k=<kicker>&s=<sig>
 * (app/og/route.tsx) draws the page's own title on the site's card.
 *
 * The text is signed, and the route refuses anything unsigned, so nobody can
 * mint an image on our domain carrying words we never wrote ("Stake pays
 * 1 BTC to everyone") and pass it around as ours.
 */
const KEY = process.env.OG_SIGNING_KEY || "csg-og-card-v1";

export const ogSign = (t: string, k: string) => createHmac("sha256", KEY).update(`${k}\n${t}`).digest("hex").slice(0, 16);

/** What the card says above the title, from the page's section. */
const KICKERS: [RegExp, string][] = [
  [/^\/casinos\//, "Casino review"],
  [/^\/crypto-casinos/, "Crypto casinos"],
  [/^\/sweepstakes-casinos/, "Sweepstakes casinos"],
  [/^\/(us-casinos|us-sportsbooks)/, "United States"],
  [/^\/slots/, "Slots"],
  [/^\/providers/, "Game studios"],
  [/^\/(sportsbooks|betting|casino-sportsbooks|esports-casinos)/, "Sports betting"],
  [/^\/prediction-markets/, "Prediction markets"],
  [/^\/(legal|licensed-casinos)/, "Gambling law"],
  [/^\/(wallets|exchanges|coins)/, "Crypto"],
  [/^\/bonuses|^\/lowest-wagering/, "Bonuses"],
  [/^\/compare/, "Head to head"],
  [/^\/guides|^\/blog/, "Guide"],
];

export function ogCardPath(title: string, path: string): string {
  const k = KICKERS.find(([re]) => re.test(path))?.[1] ?? "CryptoSlotGuide";
  const t = title.length > 110 ? `${title.slice(0, 107).trimEnd()}…` : title;
  return `/og?t=${encodeURIComponent(t)}&k=${encodeURIComponent(k)}&s=${ogSign(t, k)}`;
}
