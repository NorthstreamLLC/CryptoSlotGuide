import { BrandMark } from "@/components/ui/BrandMark";
import { logoFor, tintFor } from "@/lib/logo";
import { sportsbookOrder } from "@/lib/sports";

/**
 * Sportsbook logos drifting across the hero, three rows at different speeds
 * and in alternating directions, like boards round a pitch. The homepage's
 * LogoColumns does the same thing vertically; this is the sports pages'
 * version.
 *
 * Only books with a real logo on file, so no lettered placeholder tile ever
 * scrolls past. Decorative: aria-hidden, no pointer events, masked so it
 * fades out before the headline on the left. Each row repeats its tiles
 * twice and moves by -50%, which makes the loop seamless. The site-wide
 * prefers-reduced-motion rule in globals.css stops it for anyone who asks.
 *
 * On phones the hero stacks, so the three rows give way to one slow row
 * along the bottom edge.
 */
const SPEEDS = ["csg-slide 70s linear infinite", "csg-slide-r 88s linear infinite", "csg-slide 104s linear infinite"];

function Row({ slugs, animation, size }: { slugs: string[]; animation: string; size: number }) {
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 16, width: "max-content", animation }}>
        {[...slugs, ...slugs].map((slug, i) => (
          <span key={slug + i} style={{ width: size, height: size, flex: "none", borderRadius: size * 0.24, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)" }}>
            <BrandMark slug={slug} mono={slug.slice(0, 2).toUpperCase()} tint={tintFor(slug)} radius={size * 0.24} fontSize={size * 0.24} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function SportsLogoDrift({ lead }: { lead?: string }) {
  // The book this page is about leads the first row; the rest follow in the
  // sportsbook order, so the drift shows the books a reader would compare.
  const all = sportsbookOrder().map((o) => o.slug).filter((s) => logoFor(s));
  const ordered = lead && all.includes(lead) ? [lead, ...all.filter((s) => s !== lead)] : all;
  const rows = [0, 1, 2].map((r) => ordered.filter((_, i) => i % 3 === r));

  return (
    <>
      <div
        aria-hidden
        className="csg-desktop-only"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0.42,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
          maskImage: "linear-gradient(90deg, transparent 0%, transparent 52%, #000 80%, #000 95%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 52%, #000 80%, #000 95%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
          WebkitMaskComposite: "source-in",
        }}
      >
        {rows.map((slugs, r) => (
          <Row key={r} slugs={slugs} animation={SPEEDS[r]} size={72} />
        ))}
      </div>
      <div
        aria-hidden
        className="csg-mobile-only"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 14,
          pointerEvents: "none",
          opacity: 0.35,
          maskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
        }}
      >
        <Row slugs={ordered} animation="csg-slide 90s linear infinite" size={40} />
      </div>
    </>
  );
}
