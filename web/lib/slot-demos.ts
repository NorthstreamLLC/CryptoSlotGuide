import demos from "@/data/slot-demos.json";
import { studioAllTitles, slotArtBySlug, topSlotRows } from "./slot-page";
import { siteData } from "./site-data";
import { SLOT_SERIES } from "./slot-series";
import type { DemoTile } from "@/components/slots/DemoGrid";

/**
 * Free demo builds, played in the studio's own demo player (play money, no
 * account, no deposit). Anyone can play a demo, so it is the one "play"
 * button that works for every visitor, wherever they are.
 *
 * Pragmatic Play and Hacksaw Gaming so far. Only studio-hosted demos, never a casino's lobby: a casino link would be an
 * affiliate placement and would turn some visitors away. data/slot-demos.json
 * holds each title's game id, from the studio's own listing
 * (scripts/fetch-hacksaw-demos.mjs); /demo/<studio>/<id> resolves the current
 * build when someone presses play.
 */
export interface SlotDemo {
  url: string;
  studio: string;
}

const D = demos as { hacksaw?: Record<string, number>; pragmatic?: Record<string, string> };
const HACKSAW = D.hacksaw ?? {};
const PRAGMATIC = D.pragmatic ?? {};

export function demoFor(slug: string | null | undefined): SlotDemo | null {
  if (!slug) return null;
  if (HACKSAW[slug]) return { url: `/demo/hacksaw/${HACKSAW[slug]}`, studio: "Hacksaw Gaming" };
  if (PRAGMATIC[slug]) return { url: `/demo/pragmatic/${PRAGMATIC[slug]}`, studio: "Pragmatic Play" };
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
  return [...tilesFor("Pragmatic Play", PRAGMATIC, (id) => `/demo/pragmatic/${id}`), ...tilesFor("Hacksaw Gaming", HACKSAW, (id) => `/demo/hacksaw/${id}`)];
}
