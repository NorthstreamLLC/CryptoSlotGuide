import reviews from "@/data/slot-reviews.json";

/**
 * The long-form reviews of the editorial picks (lib/top-slots.ts).
 *
 * Thirteen slots carry an opinion as well as a sheet. The score is ours and
 * the page says so; the byline is the site's games desk — there is no named
 * reviewer because there is no such person, and inventing one is the kind of
 * thing this site exists to not do. Every number inside a review is one the
 * page already shows from the studio's own data; where a studio publishes a
 * feature description on its own game page it is cited as featureSource, and
 * reviews without one stay with the figures.
 */
export interface SlotReviewSection {
  title: string;
  body: string;
}

export interface SlotReview {
  /** Our score out of ten, one decimal. */
  score: number;
  /** ISO date the review was last read through. */
  read: string;
  /** The studio's own game page the mechanics are described from, if it has one. */
  featureSource?: string;
  verdict: string;
  sections: SlotReviewSection[];
}

const DATA = reviews as unknown as { byline: string; reviews: Record<string, SlotReview> };

export const REVIEW_BYLINE: string = DATA.byline;

export const slotReview = (slug: string): SlotReview | null => DATA.reviews[slug] ?? null;

export const reviewedSlugs = (): string[] => Object.keys(DATA.reviews);

/** "2026-10-02" → "2 October 2026", for the byline. */
export function reviewDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
