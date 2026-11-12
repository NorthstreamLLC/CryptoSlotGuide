import demos from "@/data/slot-demos.json";
import { studioAllTitles, slotArtBySlug } from "./slot-page";
import type { DemoTile } from "@/components/slots/DemoGrid";

/**
 * Free demo builds, played in the studio's own demo player (play money, no
 * account, no deposit). Anyone can play a demo, so it is the one "play"
 * button that works for every visitor, wherever they are.
 *
 * Only studio-hosted demos, never a casino's lobby: a casino link would be an
 * affiliate placement and would turn some visitors away. data/slot-demos.json
 * holds each title's game id, from the studio's own listing
 * (scripts/fetch-hacksaw-demos.mjs); /demo/<studio>/<id> resolves the current
 * build when someone presses play.
 */
export interface SlotDemo {
  url: string;
  studio: string;
}

const HACKSAW = (demos as { hacksaw?: Record<string, number> }).hacksaw ?? {};

export function demoFor(slug: string | null | undefined): SlotDemo | null {
  const id = slug ? HACKSAW[slug] : undefined;
  return id ? { url: `/demo/hacksaw/${id}`, studio: "Hacksaw Gaming" } : null;
}

/** Every demo on file as a tile for /slots/free-demos: the studio's figures, its art, and our page where we have one. */
export function demoTiles(): DemoTile[] {
  const rows = new Map(studioAllTitles("Hacksaw Gaming").rows.filter((r) => r.slug).map((r) => [r.slug as string, r]));
  return Object.entries(HACKSAW)
    .map(([slug, id]) => {
      const r = rows.get(slug);
      if (!r) return null;
      const clean = (v: string) => (/not published|—/i.test(v) ? "" : v);
      return {
        slug,
        name: r.name,
        studio: "Hacksaw Gaming",
        url: `/demo/hacksaw/${id}`,
        art: r.image ?? slotArtBySlug(slug),
        rtp: clean(r.m1),
        vol: clean(r.m2),
        maxWin: clean(r.m3),
        page: r.href?.startsWith("/") ? r.href : null,
      };
    })
    .filter((t): t is DemoTile => !!t);
}
