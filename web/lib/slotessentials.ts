import links from "@/data/slotessentials-links.json";

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
