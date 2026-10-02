/**
 * The studios that lead every studio list, in the order given.
 *
 * An editorial call, like lib/top-slots.ts: the five studios whose games the
 * site's readers actually play, ahead of the A–Z. Nothing re-sorts them, and
 * no fact on a studio page is derived from this — it decides placement only.
 */
export const TOP_STUDIOS: string[] = ["pragmatic-play", "hacksaw-gaming", "push-gaming", "play-n-go", "nolimit-city"];

const RANK = new Map(TOP_STUDIOS.map((slug, i) => [slug, i]));

/** Position in the list, or Infinity, so a studio not on it sorts after every one that is. */
export const topStudioRank = (slug: string): number => RANK.get(slug) ?? Infinity;
