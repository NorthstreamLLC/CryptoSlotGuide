import links from "@/data/slotessentials-links.json";
import seProviders from "@/data/slotessentials-providers.json";

/**
 * Links to SlotEssentials, the site owner's other property.
 *
 * This site reviews what it can source — a title gets a page here only when
 * the studio's own figures let us say something a lobby cannot. The other
 * 7,600 titles are not reviewed here and are not going to be; SlotEssentials
 * has a page for 8,339 of them, so a stats row with a link to that page is
 * what we offer, and the row says plainly what kind of page it is.
 *
 * Every URL comes from data/slotessentials-links.json, which was read off
 * slotessentials.com/sitemap.xml. Nothing here builds a URL from a slug: a
 * title with no sitemap entry gets no link rather than a guessed one.
 */
const DATA = links as {
  fullReviewStudios: string[];
  links: Record<string, string>;
};

const FULL = new Set(DATA.fullReviewStudios.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, "")));

export function slotEssentialsLink(slug: string | null | undefined): string | null {
  return slug ? (DATA.links[slug] ?? null) : null;
}

/**
 * What the linked page is. Nine studios have a written review on
 * SlotEssentials (How to Play, Features, Bonus Features); the rest have a
 * database entry with tracker tools. Calling the second a "full review"
 * would be a lie the reader discovers one click later.
 */
export function slotEssentialsLabel(studio: string | null | undefined): string {
  const k = (studio ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return FULL.has(k) ? "Full review on SlotEssentials" : "See on SlotEssentials";
}

/**
 * A studio's profile on SlotEssentials, from data/slotessentials-providers.json
 * (read off its sitemap by scripts/fetch-se-providers.mjs). Matched by name,
 * with the parenthesised platform SlotEssentials sometimes appends — "Quickspin
 * (Alea)" — ignored. ALIASES covers the studios whose names differ between the
 * two sites. A studio with no profile there gets null, never a built URL:
 * SlotEssentials answers 200 with an empty shell for a slug it does not have.
 */
const studioKey = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");
const ALIASES: Record<string, string> = {
  microgaminggamesglobal: "microgaming",
  gamesglobal: "microgaming",
  evolution: "evolutiongaming",
};
const STUDIO_URL: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const pr of (seProviders as { providers: { name: string; url: string }[] }).providers) {
    const k = studioKey(pr.name);
    if (!m.has(k)) m.set(k, pr.url);
  }
  return m;
})();

export function slotEssentialsStudio(studio: string | null | undefined): string | null {
  if (!studio) return null;
  const k = studioKey(studio);
  return STUDIO_URL.get(k) ?? STUDIO_URL.get(ALIASES[k] ?? "") ?? null;
}
