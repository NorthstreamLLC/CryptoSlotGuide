import sources from "@/data/payment-logo-sources.json";
import { detectPartners, type PaymentPartner } from "@/lib/payment-partners";

/**
 * The payment providers a casino's own page names, as marks rather than a
 * sentence.
 *
 * Every mark sits on a light plate. The providers serve their icons in
 * whatever colours suit their own sites — Visa and Interac are dark blue on
 * white, Mastercard and Pix are colour on transparent — so dropping them
 * straight onto a near-black card loses about half of them. A plate is also
 * how these marks appear everywhere else a reader has seen them, at the foot
 * of a checkout, so it reads as intended rather than as a fix.
 *
 * A provider with no mark still gets a chip with its name. Falling back to
 * nothing would silently drop a rail someone is looking for.
 */

const FILES = sources as Record<string, { file?: string; url?: string }>;
const MONO = "var(--font-jetbrains-mono), monospace";

function Chip({ p }: { p: PaymentPartner }) {
  const file = FILES[p.slug]?.file;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: file ? "4px 10px 4px 4px" : "6px 10px",
        borderRadius: 8,
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.09)",
      }}
    >
      {file && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: 5,
            background: "#fff",
            flex: "0 0 auto",
          }}
        >
          {/* Plain img: these are 17 small static files of five different
              formats, several of them .ico, which next/image will not take. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/assets/payments/${file}`} alt="" width={20} height={20} style={{ width: 20, height: 20, objectFit: "contain", display: "block" }} loading="lazy" />
        </span>
      )}
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#C8D4DA", whiteSpace: "nowrap" }}>{p.name}</span>
    </span>
  );
}

export function PaymentPartners({ value, heading = "Payment partners" }: { value: string | null | undefined; heading?: string }) {
  const partners = detectPartners(value);
  if (!partners.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#8E9CA5" }}>{heading}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {partners.map((p) => (
          <Chip key={p.slug} p={p} />
        ))}
      </div>
    </div>
  );
}
