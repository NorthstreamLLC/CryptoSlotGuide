import { siteData } from "./site-data";
import { logoFor } from "./logo";
import { kycRows, type KycTier } from "./kyc";
import { INDEX_ROWS, cost } from "./bonus-index";
import { CGA_REGISTER } from "./curacao-register";

/**
 * What a story's picture shows, shared by the homepage thumbnails
 * (components/home/StoryThumb.tsx) and the share cards (app/og/story), so the
 * two always draw the same casinos and the same figures.
 */
export type Badge = { text: string; tone: "bad" | "watch" | "ok" };
export type ThumbSpec =
  | { kind: "casino"; slug: string; badge?: Badge }
  | { kind: "kyc" }
  | { kind: "cost" }
  | { kind: "register"; badge?: Badge }
  | { kind: "cover"; category: string; tint: string };

export const TONE: Record<Badge["tone"], string> = { bad: "#FF6B6B", watch: "#FFC531", ok: "#57E39A" };
export const TIER_TINT: Record<KycTier, string> = { never: "#57E39A", discretionary: "#9BE15D", threshold: "#FFC531", conflicting: "#B79CFF", required: "#FF6B6B" };
export const REGISTER_TONE = { watch: "#FFC531", ok: "#57E39A", plain: "#5FA8FF", bad: "#FF6B6B" } as const;

/** Badges a story can carry: fixed wording, so a card never says more than we wrote. */
export const BADGES = {
  incident: { text: "Security incident", tone: "bad" },
  breach: { text: "Regulator breached", tone: "bad" },
} as const satisfies Record<string, Badge>;

/** Which picture a news story gets, from its title: the regulator, or the casino it names. */
export function thumbForNews(title: string, fallback: { category: string; tint: string }): ThumbSpec {
  const incident = /offline|breach|hack|security|outage|scare/i.test(title);
  if (/cura[cç]ao/i.test(title)) return { kind: "register", badge: incident ? BADGES.breach : undefined };
  const op = siteData.ops.find((o) => logoFor(o.slug) && new RegExp(`\\b${o.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(title));
  if (op) return { kind: "casino", slug: op.slug, badge: incident ? BADGES.incident : undefined };
  return { kind: "cover", ...fallback };
}

/** n casinos with a logo for the KYC picture: round-robin over the tiers, so it shows the spread. */
export function kycPicks(n: number, onlyPng = false) {
  const rows = kycRows().filter((r) => logoFor(r.slug) && (!onlyPng || logoFor(r.slug)!.endsWith(".png")));
  const byTier = new Map<KycTier, typeof rows>();
  for (const r of rows) byTier.set(r.tier, [...(byTier.get(r.tier) ?? []), r]);
  const picked: typeof rows = [];
  while (picked.length < n && [...byTier.values()].some((v) => v.length)) {
    for (const v of byTier.values()) if (v.length && picked.length < n) picked.push(v.shift()!);
  }
  return picked;
}

/** Welcome bonuses by what their wagering costs on a $100 deposit, cheapest first. */
export function costPicks(n: number, onlyPng = false) {
  const rows = INDEX_ROWS.filter((r) => logoFor(r.slug) && (!onlyPng || logoFor(r.slug)!.endsWith(".png")))
    .map((r) => ({ slug: r.slug, c: cost(r).expectedCost }))
    .sort((a, b) => a.c - b.c);
  if (n >= rows.length) return rows;
  if (n === 3) return [rows[0], rows[Math.floor(rows.length / 2)], rows[rows.length - 1]];
  return rows.slice(0, n);
}

export const registerParts = () => CGA_REGISTER.counts.filter((c) => c.n > 0);
