/**
 * A guide's cover: its category's emblem on the guide's own tint, drawn as
 * inline SVG in the site's style (dark ground, grid, one bright accent).
 * No stock photography: every guide in a category shares the emblem, and the
 * tint (guideRows.json) tells them apart. Scales from a list thumbnail to a
 * page banner; decorative, so aria-hidden.
 */
const W = 320;
const H = 180;

function Emblem({ category, c }: { category: string; c: string }) {
  const s = { fill: "none", stroke: c, strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (category) {
    case "Law": // scales
      return (
        <g {...s}>
          <path d="M228 46v86M196 132h64M208 62h40M208 62l-16 34h32zM248 62l-16 34h32z" />
          <path d="M192 96a16 8 0 0 0 32 0M232 96a16 8 0 0 0 32 0" />
        </g>
      );
    case "Crypto": // coin with a chain link
      return (
        <g {...s}>
          <circle cx="228" cy="88" r="40" />
          <circle cx="228" cy="88" r="30" strokeOpacity=".5" />
          <path d="M220 70v36M232 70v36M214 76h22a8 8 0 0 1 0 12h-22M214 88h24a8 8 0 0 1 0 12h-24" />
        </g>
      );
    case "Accounts": // ID card
      return (
        <g {...s}>
          <rect x="176" y="54" width="104" height="70" rx="10" />
          <circle cx="204" cy="84" r="11" />
          <path d="M190 112c4-10 24-10 28 0M232 78h34M232 92h28M232 106h20" />
        </g>
      );
    case "Slots": // three reels
      return (
        <g {...s}>
          <rect x="172" y="50" width="112" height="76" rx="12" />
          <path d="M209 50v76M247 50v76" strokeOpacity=".5" />
          <path d="M184 88h14M222 88h14M260 88h14" strokeWidth="5" />
          <path d="M166 88h-6M296 88h6" />
        </g>
      );
    case "Bonuses": // gift box
      return (
        <g {...s}>
          <rect x="186" y="78" width="84" height="50" rx="6" />
          <rect x="180" y="62" width="96" height="18" rx="5" />
          <path d="M228 62v66M228 62c-6-16-30-16-26-2 3 8 26 2 26 2zM228 62c6-16 30-16 26-2-3 8-26 2-26 2z" />
        </g>
      );
    case "Betting": // ball and an odds line
      return (
        <g {...s}>
          <circle cx="214" cy="92" r="32" />
          <path d="M214 74l14 10-5 16h-18l-5-16zM214 60v14M246 90l-18-6M228 118l-5-18M200 118l5-18M182 90l18-6" strokeOpacity=".7" />
          <path d="M258 60l22-10M266 76h20" />
        </g>
      );
    case "Wallets": // wallet
      return (
        <g {...s}>
          <path d="M180 66h84a10 10 0 0 1 10 10v48a10 10 0 0 1-10 10h-84a10 10 0 0 1-10-10V72a10 10 0 0 1 10-10z" />
          <path d="M180 66l60-18 8 18M274 92h-26a8 8 0 0 0 0 16h26" />
          <circle cx="250" cy="100" r="2.5" fill={c} />
        </g>
      );
    default: // Method: checklist
      return (
        <g {...s}>
          <rect x="186" y="44" width="84" height="96" rx="10" />
          <path d="M200 70l6 6 10-12M200 96l6 6 10-12M200 122l6 6 10-12M226 72h30M226 98h30M226 124h22" />
        </g>
      );
  }
}

/** `tile`: crop to the emblem, for small list thumbnails where the full banner would leave it a speck. */
export function GuideCover({ category, tint, label = true, rounded = 14, tile = false }: { category: string; tint: string; label?: boolean; rounded?: number; tile?: boolean }) {
  const id = `gc-${category}-${tint.replace("#", "")}`;
  return (
    <svg viewBox={tile ? "148 43 160 90" : `0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ display: "block", borderRadius: rounded }}>
      <defs>
        <radialGradient id={`${id}-g`} cx="78%" cy="30%" r="80%">
          <stop offset="0" stopColor={tint} stopOpacity=".42" />
          <stop offset=".55" stopColor={tint} stopOpacity=".08" />
          <stop offset="1" stopColor="#0A0D10" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-p`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#fff" strokeOpacity=".05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="#0C1013" />
      <rect width={W} height={H} fill={`url(#${id}-p)`} />
      <rect width={W} height={H} fill={`url(#${id}-g)`} />
      <circle cx="228" cy="88" r="62" fill={tint} fillOpacity=".08" />
      <Emblem category={category} c={tint} />
      {label && (
        <text x="22" y="156" fill={tint} fontFamily="var(--font-jetbrains-mono), monospace" fontSize="11" letterSpacing="2">
          {category.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
