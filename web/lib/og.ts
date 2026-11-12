import { createHmac } from "node:crypto";
import { logoFor } from "./logo";
import { BADGES } from "./story-thumb";

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

/** The kicker for a path; shared by both cards. */
export function ogKicker(path: string): string {
  return KICKERS.find(([re]) => re.test(path))?.[1] ?? "CryptoSlotGuide";
}

export function ogCardPath(title: string, path: string): string {
  const k = KICKERS.find(([re]) => re.test(path))?.[1] ?? "CryptoSlotGuide";
  const t = title.length > 110 ? `${title.slice(0, 107).trimEnd()}…` : title;
  return `/og?t=${encodeURIComponent(t)}&k=${encodeURIComponent(k)}&s=${ogSign(t, k)}`;
}

/**
 * A share card with a picture drawn from the story's own data (app/og/story):
 * the casino's logo, the KYC tiers, the bonus costs or the Curaçao register,
 * beside the page's title. Same signing as the plain card, over every field,
 * so the casino and the badge can't be swapped either.
 */
export function storyCardPath(spec: { kind: "casino" | "kyc" | "cost" | "register" | "licensees"; slug?: string; badge?: "incident" | "breach" }, title: string, path: string, kicker?: string): string {
  const k = kicker ?? KICKERS.find(([re]) => re.test(path))?.[1] ?? "CryptoSlotGuide";
  const t = title.length > 110 ? `${title.slice(0, 107).trimEnd()}…` : title;
  const c = spec.slug ?? "";
  const b = spec.badge ?? "";
  const s = ogSign(t, `${k}|${spec.kind}|${c}|${b}`);
  return `/og/story?v=${spec.kind}${c ? `&c=${encodeURIComponent(c)}` : ""}${b ? `&b=${b}` : ""}&t=${encodeURIComponent(t)}&k=${encodeURIComponent(k)}&s=${s}`;
}

/** The story card for a ThumbSpec, or undefined where the story has no data picture. */
export function storyCardFor(spec: import("./story-thumb").ThumbSpec, title: string, path: string, kicker?: string): string | undefined {
  if (spec.kind === "cover") return undefined;
  if (spec.kind === "casino" && !logoFor(spec.slug)?.endsWith(".png")) return undefined;
  const badge = "badge" in spec && spec.badge ? (spec.badge.text === BADGES.breach.text ? "breach" : "incident") : undefined;
  return storyCardPath({ kind: spec.kind, slug: spec.kind === "casino" ? spec.slug : undefined, badge }, title, path, kicker);
}
