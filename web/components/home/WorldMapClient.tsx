"use client";

import { MapHover } from "@/components/legal/MapHover";
import { LegalMap } from "@/components/legal/LegalMap";
import { countryHoverInfo } from "@/lib/legal-hover";
import { WORLD_SHAPES, countryBy } from "@/lib/legal";

/**
 * The world map as the homepage shows it, in its own client chunk.
 *
 * Split out so LazyLegalMap can load it with `ssr: false` — that is what keeps
 * the 117KB of country paths out of the homepage's HTML. Same shapes, statuses
 * and links as /legal, so the two never drift.
 */
export function WorldMapClient() {
  return (
    <MapHover info={countryHoverInfo(WORLD_SHAPES)}>
      <LegalMap
        shapes={WORLD_SHAPES}
        viewBox="0 0 960 470"
        statusOf={(c) => (c === "US" ? "varies by state" : countryBy(c)?.onlineCasino)}
        hrefOf={(c) => (c === "US" ? "/legal/us" : countryBy(c) ? `/legal/${c.toLowerCase()}` : null)}
      />
    </MapHover>
  );
}
