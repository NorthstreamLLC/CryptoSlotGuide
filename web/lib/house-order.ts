import type { Operator } from "./types";

/**
 * The order casinos appear in when a list has no measured column to sort by.
 *
 * This is a COMMERCIAL order, not a verdict. It decides placement and nothing
 * else: no fact, score, payout time, wagering multiple or "best for" label
 * anywhere on the site is derived from it. Every list that ranks by something
 * measured — payout speed, wagering, bonus size, quiz fit — keeps sorting by
 * that measurement, and this file is only ever the tie-break there.
 *
 * The advertiser disclosure in the header is what tells readers this exists, so
 * it has to stay on every page that uses this order.
 */

/**
 * Tiers, highest first. Slugs must match data/ops.json — `npm run check:house`
 * fails the build if one drifts, because a typo here degrades silently into
 * alphabetical and nobody notices for weeks.
 */
const TIERS: string[][] = [
  ["roobet"],
  // The sweepstakes siblings sit in the same tier as the crypto brands they
  // belong to. They are separate operators on separate slugs (data/sweeps.json),
  // and a US reader browsing sweeps sees the .us names, so both spellings have
  // to be here or the order silently applies to only half the site.
  ["stake", "stake-us", "shuffle", "shuffle-us"],
  ["rainbet", "gamdom", "bc-game", "duelbits", "razed", "500-casino"],
];

/**
 * Position within a tier is the listed position, not alphabetical — otherwise
 * "Stake then Shuffle" renders as "Shuffle, Stake", and a brand with no
 * affiliate link (BC.Game) sinks below the tier it was put in. The tiers are
 * really just a readable way to write one ordered list.
 */
const RANK = new Map<string, number>();
TIERS.flat().forEach((slug, i) => RANK.set(slug, i));

/** Everything unlisted shares one rank below the tiers, so they fall through to the tie-breaks. */
const UNRANKED = RANK.size;

export const houseRank = (slug: string): number => RANK.get(slug) ?? UNRANKED;

/** Every slug this file names, for the drift check. */
export const HOUSE_SLUGS: string[] = TIERS.flat();

/**
 * Anything with a slug, a name, and the two placement flags — which covers both
 * Operator (data/ops.json) and SweepsCasino (data/sweeps.json) without either
 * file having to know about this one.
 */
export type Placeable = Pick<Operator, "slug" | "name" | "affiliate" | "featured">;

/**
 * Placement order: house tier, then the `featured` flag, then operators with an
 * affiliate link, then A–Z. Alphabetical last means the order stays
 * deterministic and reproducible rather than whatever the JSON file happens to
 * be in — and it means an operator can never drift up the page on its own.
 */
export function byHouse(a: Placeable, b: Placeable): number {
  return (
    houseRank(a.slug) - houseRank(b.slug) ||
    Number(!!b.featured) - Number(!!a.featured) ||
    Number(!!b.affiliate) - Number(!!a.affiliate) ||
    a.name.localeCompare(b.name)
  );
}

/** The same order for anything that carries its operator on a property. */
export const byHouseOn = <T,>(pick: (row: T) => Placeable) => (a: T, b: T) => byHouse(pick(a), pick(b));

/** Sorts a copy, so callers can pass a frozen import straight in. */
export const inHouseOrder = <T extends Placeable>(ops: readonly T[]): T[] => [...ops].sort(byHouse);
