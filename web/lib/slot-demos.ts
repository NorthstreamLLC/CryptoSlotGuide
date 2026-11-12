import demos from "@/data/slot-demos.json";

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
