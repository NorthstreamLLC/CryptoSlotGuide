/**
 * The sportsbook pages' backdrop: a pitch, drawn faintly, with a few balls
 * resting on it. Pure SVG and CSS, so there is no stock photography to
 * source or licence, and it never competes with the text over it —
 * everything sits under 9% opacity and the pointer passes straight through.
 */
export function SportsAura({ tone = "#57B98C" }: { tone?: string }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* turf light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(70% 90% at 82% 10%, ${tone}26, transparent 60%), radial-gradient(50% 70% at 0% 100%, rgba(255,197,49,.07), transparent 60%)`,
        }}
      />
      {/* mown stripes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          background: "repeating-linear-gradient(90deg, rgba(255,255,255,.018) 0 64px, transparent 64px 128px)",
          maskImage: "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent)",
        }}
      />
      <svg viewBox="0 0 1400 520" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <g fill="none" stroke="#fff" strokeOpacity=".1" strokeWidth="2">
          {/* pitch markings */}
          <rect x="560" y="40" width="1100" height="440" rx="4" />
          <line x1="1110" y1="40" x2="1110" y2="480" />
          <circle cx="1110" cy="260" r="88" />
          <circle cx="1110" cy="260" r="3" fill="#fff" fillOpacity=".08" />
          <rect x="560" y="150" width="120" height="220" />
          <rect x="560" y="205" width="44" height="110" />
          <path d="M680 220 A 60 60 0 0 1 680 300" />
        </g>
        {/* football */}
        <g transform="translate(1235 120)" stroke="#fff" strokeOpacity=".16" strokeWidth="2" fill="none">
          <circle r="44" />
          <polygon points="0,-16 15,-5 9,13 -9,13 -15,-5" fill="#fff" fillOpacity=".06" />
          <line x1="0" y1="-16" x2="0" y2="-44" />
          <line x1="15" y1="-5" x2="41" y2="-14" />
          <line x1="9" y1="13" x2="25" y2="36" />
          <line x1="-9" y1="13" x2="-25" y2="36" />
          <line x1="-15" y1="-5" x2="-41" y2="-14" />
        </g>
        {/* basketball */}
        <g transform="translate(905 410)" stroke={tone} strokeOpacity=".24" strokeWidth="2" fill="none">
          <circle r="34" />
          <line x1="-34" y1="0" x2="34" y2="0" />
          <line x1="0" y1="-34" x2="0" y2="34" />
          <path d="M-24 -24 Q -8 0 -24 24" />
          <path d="M24 -24 Q 8 0 24 24" />
        </g>
        {/* tennis ball */}
        <g transform="translate(1330 395)" stroke="#FFC531" strokeOpacity=".2" strokeWidth="2" fill="none">
          <circle r="22" />
          <path d="M-20 -9 Q 0 0 -20 9" />
          <path d="M20 -9 Q 0 0 20 9" />
        </g>
        {/* puck */}
        <g transform="translate(760 95)" stroke="#fff" strokeOpacity=".13" strokeWidth="2" fill="none">
          <ellipse rx="26" ry="9" />
          <path d="M-26 0 v10 a26 9 0 0 0 52 0 v-10" />
        </g>
      </svg>
    </div>
  );
}
