"use client";

import dynamic from "next/dynamic";

/**
 * The homepage's legal map, kept out of the server payload.
 *
 * The map is ~117KB of precomputed SVG paths for 174 countries. Rendering it
 * server-side took the homepage from 499KB to 1,149KB — more than doubling the
 * site's most-visited page for a tool that sits several screens down.
 *
 * Passing the shapes down as a prop does not help: React serialises children
 * into the payload whether or not they are rendered. So the map is loaded with
 * `ssr: false`, which puts the component AND the country data it imports into
 * a separate client chunk, fetched after first paint instead of inlined into
 * the HTML.
 *
 * An earlier attempt did this by hand — an IntersectionObserver plus a dynamic
 * import inside useEffect — and hung on "Loading map…" forever, because
 * LegalMap is a server component and does not import that way. next/dynamic
 * handles the boundary properly.
 *
 * The heading, copy and links around this stay server-rendered, so the section
 * is in the HTML and crawlable, and the links still reach every page the map
 * would have opened if the chunk fails.
 */
const WorldMap = dynamic(() => import("./WorldMapClient").then((m) => m.WorldMapClient), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#4E5A62" }}>
        Loading map…
      </span>
    </div>
  ),
});

export function LazyLegalMap() {
  return <WorldMap />;
}
