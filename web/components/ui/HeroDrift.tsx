import { BrandMark } from "@/components/ui/BrandMark";
import { tintFor } from "@/lib/logo";

/**
 * A hero's drifting backdrop: brand logos or slot art moving in three rows
 * at different speeds and directions, faded out before the headline on the
 * left (the sportsbook pages' SportsLogoDrift, made general). Decorative:
 * aria-hidden, no pointer events; each row repeats its tiles and moves by
 * -50%, so the loop is seamless. The site-wide prefers-reduced-motion rule
 * in globals.css stops it. Phones get one slow row along the bottom edge.
 */
type Props = { logos: string[]; art?: never } | { art: string[]; logos?: never };

const SPEEDS = ["csg-slide 80s linear infinite", "csg-slide-r 96s linear infinite", "csg-slide 112s linear infinite"];

function Tile({ logo, art, big }: { logo?: string; art?: string; big: boolean }) {
  if (art) {
    const w = big ? 150 : 84;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={art} alt="" width={w} height={Math.round(w * 0.625)} loading="lazy" style={{ width: w, height: Math.round(w * 0.625), flex: "none", objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)" }} />
    );
  }
  const s = big ? 68 : 40;
  return (
    <span style={{ width: s, height: s, flex: "none", borderRadius: s * 0.24, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.02)" }}>
      <BrandMark slug={logo!} mono={logo!.slice(0, 2).toUpperCase()} tint={tintFor(logo!)} radius={s * 0.24} fontSize={s * 0.24} />
    </span>
  );
}

function Row({ items, animation, big, art }: { items: string[]; animation: string; big: boolean; art: boolean }) {
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", gap: big ? 16 : 10, width: "max-content", animation }}>
        {[...items, ...items].map((x, i) => (
          <Tile key={x + i} {...(art ? { art: x } : { logo: x })} big={big} />
        ))}
      </div>
    </div>
  );
}

export function HeroDrift(props: Props) {
  const art = !!props.art;
  const given = (props.art ?? props.logos ?? []).filter(Boolean);
  if (given.length < 5) return null;
  // A short list (ten wallets and exchanges) would leave each row too short
  // to reach the visible right-hand side, so it repeats until rows fill it.
  const items = Array.from({ length: Math.ceil(36 / given.length) }, () => given).flat();
  const rows = [0, 1, 2].map((r) => items.filter((_, i) => i % 3 === r));
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
          opacity: art ? 0.5 : 0.42,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
          maskImage: "linear-gradient(90deg, transparent 0%, transparent 50%, #000 78%, #000 95%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 20%, #000 80%, transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 50%, #000 78%, #000 95%, transparent 100%), linear-gradient(180deg, transparent 0%, #000 20%, #000 80%, transparent 100%)",
          WebkitMaskComposite: "source-in",
        }}
      >
        {rows.map((r, i) => (
          <Row key={i} items={r} animation={SPEEDS[i]} big art={art} />
        ))}
      </div>
      <div
        aria-hidden
        className="csg-mobile-only"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 12,
          pointerEvents: "none",
          opacity: 0.32,
          maskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)",
        }}
      >
        <Row items={items.slice(0, 24)} animation="csg-slide 90s linear infinite" big={false} art={art} />
      </div>
    </>
  );
}
