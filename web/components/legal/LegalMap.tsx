import { TONE, toneOf, type Shape, type Tone } from "@/lib/legal";

/**
 * Clickable choropleth: every region is a link to its law page, coloured by
 * its online-casino status. Plain SVG, so it works without JavaScript and
 * every region is reachable by keyboard.
 */
export function LegalMap({
  shapes,
  statusOf,
  hrefOf,
  viewBox,
  labels,
  fillOf,
  legend,
}: {
  shapes: Shape[];
  statusOf: (code: string) => string | undefined;
  hrefOf: (code: string) => string | null;
  viewBox: string;
  labels?: boolean;
  /** Overrides the status colour, e.g. to shade by how many casinos accept a country. */
  fillOf?: (code: string) => string | undefined;
  legend?: { color: string; label: string }[];
}) {
  return (
    <div>
      <svg viewBox={viewBox} role="img" aria-label="Map coloured by online casino legality" style={{ width: "100%", height: "auto", display: "block" }}>
        <style>{`.lm-r{stroke:#07090B;stroke-width:.6;transition:opacity .15s,filter .15s}.lm-a:hover .lm-r,.lm-a:focus .lm-r{filter:brightness(1.35);stroke:#fff;stroke-width:1}.lm-a:focus{outline:none}`}</style>
        {shapes.map((s, i) => {
          const tone: Tone = s.code ? toneOf(statusOf(s.code)) : "none";
          const href = s.code ? hrefOf(s.code) : null;
          const path = <path className="lm-r" d={s.d} fill={(fillOf && s.code && fillOf(s.code)) || TONE[tone].fill} />;
          return href ? (
            <a key={i} href={href} className="lm-a" data-code={s.code ?? undefined} aria-label={`${s.name}: ${TONE[tone].label}`}>
              {path}
            </a>
          ) : (
            <g key={i} data-code={s.code ?? undefined}>
              <title>{`${s.name}: ${TONE[tone].label}`}</title>
              {path}
            </g>
          );
        })}
        {labels &&
          shapes.map((s) =>
            s.c && s.code && !["DC", "DE", "RI", "MD"].includes(s.code) ? (
              <text key={`t-${s.code}`} x={s.c[0]} y={s.c[1]} textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, fontWeight: 700, fill: "#07090B", pointerEvents: "none" }}>
                {s.code}
              </text>
            ) : null
          )}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 14 }}>
        {(legend ?? (Object.keys(TONE) as Tone[]).map((t) => ({ color: TONE[t].fill, label: TONE[t].label }))).map((l) => (
          <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#A8B6BE" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
