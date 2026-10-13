import Link from "next/link";

/**
 * The advertiser disclosure, as one quiet line. It used to sit in a band
 * under the header on every page; it now closes the homepage hero and opens
 * the footer, and every affiliate button still carries its own note.
 */
export function DisclosureStrip({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <p
      style={{
        margin: 0,
        textAlign: align,
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 11,
        lineHeight: 1.6,
        letterSpacing: ".02em",
        color: "#6E7F86",
      }}
    >
      <strong style={{ color: "#7FA9AE", fontWeight: 700 }}>Advertiser disclosure</strong> · We earn commission from some operators listed here. It never changes what a review says —{" "}
      <Link href="/how-we-rate" style={{ color: "#9FD9DD", textDecoration: "underline", textUnderlineOffset: 2 }}>
        how we source information
      </Link>
      .
    </p>
  );
}
