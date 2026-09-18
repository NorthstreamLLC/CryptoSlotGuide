import { logoFor, tintFor } from "@/lib/logo";

/**
 * Renders a real logo image when one genuinely exists (see lib/logo.ts),
 * else the site's own tinted-monogram fallback — never the fake
 * placeholder PNGs that used to sit in public/assets/logos/. Fills
 * whatever box the caller already sized (width/height 100%), so it
 * drops into each page's existing wrapper without needing per-site
 * pixel tuning.
 */
export function BrandMark({
  slug,
  mono,
  tint,
  radius = 7,
  fontSize = 11,
}: {
  slug: string;
  mono: string;
  /** Pass the entity's own brand tint when it has one (providers, slots). Omit to fall back to a deterministic per-slug color. */
  tint?: string;
  radius?: number;
  fontSize?: number;
}) {
  const logo = logoFor(slug);
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius, background: "#0C1013" }} />
    );
  }
  return (
    <span
      style={{
        width: "100%",
        height: "100%",
        borderRadius: radius,
        background: tint ?? tintFor(slug),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize,
        fontWeight: 700,
        color: "#0A0D0F",
        flex: "none",
      }}
    >
      {mono}
    </span>
  );
}
