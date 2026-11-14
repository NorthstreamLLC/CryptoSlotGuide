import { DEMO_STUDIOS, DEMO_IDS, FEED, feedUrl } from "./demo-studios";
import catalogue from "@/data/gameCatalogue.json";

/** Studio of a catalogue title, for demos that come from the catalogue's own links. */
const PROVIDER = new Map((catalogue as { games: { slug: string | null; provider: string | null }[] }).games.filter((g) => g.slug).map((g) => [g.slug as string, g.provider ?? ""]));
import { studioAllTitles, slotArtBySlug, topSlotRows } from "./slot-page";
import { siteData } from "./site-data";
import { SLOT_SERIES } from "./slot-series";
import type { DemoTile } from "@/components/slots/DemoGrid";

/**
 * Free demo builds, played in the studio's own demo player (play money, no
 * account, no deposit). Anyone can play a demo, so it is the one "play"
 * button that works for every visitor, wherever they are.
 *
 * Only studio-hosted demos, never a casino's lobby: a casino link would be an
 * affiliate placement and would turn some visitors away. The studios and
 * their URLs are in lib/demo-studios.ts; data/slot-demos.json holds each
 * title's id, from the studio's own game pages.
 */
export interface SlotDemo {
  url: string;
  studio: string;
}

export function demoFor(slug: string | null | undefined): SlotDemo | null {
  if (!slug) return null;
  // The catalogue suffixes a clashing name ("mental-1") where a review page
  // owns the plain slug ("mental"), so both spellings are tried.
  for (const s of [slug, `${slug}-1`]) {
    for (const [key, cfg] of Object.entries(DEMO_STUDIOS)) {
      if (cfg.hidden) continue;
      const id = DEMO_IDS[key]?.[s];
      if (id !== undefined) return { url: `/demo/${key}/${id}`, studio: cfg.name };
    }
    if (feedUrl(s)) return { url: `/demo/feed/${s}`, studio: PROVIDER.get(s) || "the studio" };
  }
  return null;
}

/** Every demo on file as a tile for /slots/free-demos: the studio's figures, its art, and our page where we have one. */
export function demoTiles(): DemoTile[] {
  const REVIEWED = new Set(siteData.slots.map((x) => x.slug));
  const PICKS = new Set([...siteData.slots.map((x) => x.slug), ...topSlotRows().map((x) => x.slug)]);
  const clean = (v: string) => (/not published|—/i.test(v) ? "" : v);
  const tilesFor = (studio: string, ids: Record<string, string | number>, url: (id: string | number) => string): DemoTile[] => {
    const rows = new Map(studioAllTitles(studio).rows.filter((r) => r.slug).map((r) => [r.slug as string, r]));
    return Object.entries(ids)
      .map(([slug, id]) => {
        const r = rows.get(slug);
        if (!r) return null;
        // A hand-written review owns its slug; the catalogue rows only know the catalogue pages.
        const page = REVIEWED.has(slug) ? `/slots/${slug}` : r.href?.startsWith("/") ? r.href : null;
        const rank = PICKS.has(slug) ? 0 : SLOT_SERIES.some((x) => x.studio === studio && x.match.test(r.name)) ? 1 : page ? 2 : 3;
        return { slug, name: r.name, studio, url: url(id), art: r.image ?? slotArtBySlug(slug), rtp: clean(r.m1), vol: clean(r.m2), maxWin: clean(r.m3), page, rank };
      })
      .filter((t): t is DemoTile => !!t);
  };
  // One tile per title: a slug carried by two studios' lists keeps the first.
  const seen = new Set<string>();
  // Catalogue-link demos, grouped by their studio.
  const feedByStudio = new Map<string, Record<string, string>>();
  for (const slug of Object.keys(FEED)) {
    if (!feedUrl(slug)) continue;
    const st = PROVIDER.get(slug);
    if (st) (feedByStudio.get(st) ?? feedByStudio.set(st, {}).get(st)!)[slug] = slug;
  }
  return [
    ...Object.entries(DEMO_STUDIOS)
      .filter(([, cfg]) => !cfg.hidden)
      .flatMap(([key, cfg]) => tilesFor(cfg.name, DEMO_IDS[key] ?? {}, (id) => `/demo/${key}/${id}`)),
    ...[...feedByStudio].flatMap(([studio, ids]) => tilesFor(studio, ids, (slug) => `/demo/feed/${slug}`)),
  ].filter((t) => !seen.has(t.slug) && !!seen.add(t.slug));
}

/** Table rows with each title's free demo attached, where we hold one. */
export function withDemos<T extends { slug?: string | null; name: string }>(rows: T[]): (T & { demo?: SlotDemo })[] {
  return rows.map((r) => {
    const d = demoFor(r.slug);
    return d ? { ...r, demo: d } : r;
  });
}
