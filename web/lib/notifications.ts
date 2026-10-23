import { siteData } from "./site-data";
import { getSpecFact } from "./spec-sheet";
import { raceFor } from "./races";
import { slotArtBySlug } from "./slot-page";
import { kevinLive, KEVIN_PATH } from "./kevin-promo";
import reviewsFile from "@/data/slot-reviews.json";

/**
 * What the header bell lists. Built on the server from data the site already
 * holds, so every item points at a real page and every date is the date that
 * page was last passed. Nothing here is invented to look busy: no fake
 * "live now" events, no counts that are not ours.
 */
export interface Notif {
  /** Stable id; the bell remembers which ids a reader has seen. */
  id: string;
  kind: "offer" | "guide" | "review";
  tag: string;
  title: string;
  sub: string;
  href: string;
  /** ISO date the item was last updated, where there is one. */
  date?: string;
  pinned?: boolean;
  /** Operator slug for a logo, or an art tile for a slot. */
  brand?: string;
  image?: string;
}

/** guideRows.json's "updated" ("16 Sep") as an ISO date; every guide was last passed in 2026. */
function guideIso(d: string): string | undefined {
  const m = /^(\d{1,2}) ([A-Z][a-z]{2})$/.exec(d.trim());
  const mon = m ? "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(m[2]) / 3 + 1 : 0;
  return m && mon >= 1 ? `2026-${String(mon).padStart(2, "0")}-${m[1].padStart(2, "0")}` : undefined;
}

export function buildNotifications(): Notif[] {
  const out: Notif[] = [];

  // Pinned: our pick's standing raffle and the code's welcome package.
  const pick = siteData.ops.find((o) => o.featured);
  if (pick) {
    const race = raceFor(pick.slug);
    out.push({
      id: `pin-${pick.slug}-${pick.promoCode ?? "offer"}-${pick.codePerk?.since ?? ""}`,
      kind: "offer",
      tag: "Our pick",
      title: race ? `${race.label} at ${pick.name}` : `${pick.name}: ${pick.bonusShort ?? pick.bonus}`,
      sub: pick.promoCode && pick.codePerk?.short ? `Code ${pick.promoCode}: ${pick.codePerk.short}, claimed through CasinoPerks on Telegram` : pick.bonusShort ?? pick.bonus,
      href: pick.slug === "roobet" && pick.promoCode ? "/promo-codes/roobet" : `/casinos/${pick.slug}`,
      date: pick.codePerk?.since,
      pinned: true,
      brand: pick.slug,
    });
  }

  // New at our pick: Roo Jackpots, while the fact is on Roobet's sheet.
  if (getSpecFact("roobet", "Bonus terms", "Roo Jackpots")) {
    out.push({ id: "pin-roo-jackpots-2026-10", kind: "offer", tag: "New at Roobet", title: "Roo Jackpots: four jackpots, the top one over $1 million", sub: "How the side bet works and what it costs", href: "/guides/roo-jackpots-explained", date: "2026-10-13", pinned: true, brand: "roobet" });
  }

  // Pragmatic Play x Kevin Hart, pinned while it runs.
  if (kevinLive()) {
    out.push({ id: "pin-kevin-hart-2026-10", kind: "offer", tag: "Live promo", title: "Play with Kevin Hart: 500,000+ Free Chip prizes", sub: "Pragmatic Play, until 7 November. No opt-in, cash winnings", href: KEVIN_PATH, date: "2026-10-23", pinned: true, image: "/assets/promos/play-with-kevin-mobile.webp" });
  }

  // The newest guides, by the date each was last passed.
  const guides = siteData.guideRows
    .map((g) => ({ g, iso: guideIso(g.updated) }))
    .filter((x) => x.iso)
    .sort((a, b) => b.iso!.localeCompare(a.iso!))
    .slice(0, 4);
  for (const { g, iso } of guides) {
    out.push({ id: `guide-${g.slug}-${iso}`, kind: "guide", tag: g.category, title: g.title, sub: `${g.readMins} min read`, href: `/guides/${g.slug}`, date: iso });
  }

  // The slot reviews most recently read.
  const reviews = Object.entries((reviewsFile as { reviews: Record<string, { read: string }> }).reviews)
    .sort((a, b) => b[1].read.localeCompare(a[1].read))
    .slice(0, 3);
  for (const [slug, r] of reviews) {
    const s = siteData.slots.find((x) => x.slug === slug);
    if (!s) continue;
    out.push({ id: `review-${slug}-${r.read}`, kind: "review", tag: "Slot review", title: `${s.name} review`, sub: `${s.provider} · ${s.rtp}% RTP`, href: `/slots/${slug}`, date: r.read, image: slotArtBySlug(slug) ?? undefined });
  }

  return out;
}
