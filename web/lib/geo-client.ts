"use client";

/**
 * One /api/geo request per page view, shared by every component that asks.
 * The answer is per visitor and never baked into the page HTML, so crawlers
 * and every visitor get the same page; the notes are drawn on top afterwards.
 */
export interface GeoAnswer {
  detected: boolean;
  country?: string;
  countryName?: string | null;
  casinos?: { acceptsSlugs: string[]; restrictedSlugs: string[] };
  alternatives?: { sweepstakes: number | null };
}

let pending: Promise<GeoAnswer | null> | null = null;

export function getGeo(): Promise<GeoAnswer | null> {
  if (!pending) {
    // ?geo=GB on the page passes through: the reader's way to correct a wrong guess, and how this is tested.
    const q = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("geo") : null;
    pending = fetch(`/api/geo${q ? `?geo=${encodeURIComponent(q)}` : ""}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<GeoAnswer>) : null))
      .catch(() => null);
  }
  return pending;
}
