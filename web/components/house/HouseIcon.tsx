/**
 * The mark for a house game — Dice, Crash, Plinko and the rest.
 *
 * House games have no studio art the way slots do: every casino draws its
 * own Dice, and a screenshot of one casino's is that casino's artwork. So
 * these are drawn once, in public/assets/house/icons.svg, as geometric marks
 * in currentColor. The tile colours them with the game's tint on the dark
 * ground, the same way the menu and the slot index use a brand mark.
 *
 * Falls back to the two-letter mono the cards used before, so a game added
 * to houseGames.json without a symbol still gets a tile rather than a gap.
 */
const SYMBOLS = new Set(["dice", "crash", "plinko", "mines", "limbo", "keno", "hi-lo", "wheel"]);

export function HouseIcon({ slug, mono, tint, size = 36, radius = 9 }: { slug: string; mono: string; tint: string; size?: number; radius?: number }) {
  const has = SYMBOLS.has(slug);
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: radius,
        background: `${tint}1f`,
        border: `1px solid ${tint}55`,
        color: tint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: Math.round(size * 0.3),
        fontWeight: 700,
      }}
    >
      {has ? (
        <svg width={Math.round(size * 0.68)} height={Math.round(size * 0.68)} viewBox="0 0 48 48" fill="none">
          <use href={`/assets/house/icons.svg#${slug}`} />
        </svg>
      ) : (
        mono
      )}
    </span>
  );
}
