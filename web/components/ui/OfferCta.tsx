import Link from "next/link";
import type { Operator } from "@/lib/types";
import { reviewPath } from "@/lib/outbound";

/**
 * The action at the end of a casino row or card: "Read review" as the main
 * (gold) button, and where we hold an affiliate link, a smaller "Visit ↗"
 * beside it that goes straight to the operator, marked sponsored.
 *
 * The review leads because that is where the reader sees the terms, the
 * wagering and every source before deciding; it is the same order as the
 * homepage, the casinos hub and the bonuses hub. The direct link stays one tap
 * away for anyone who has already decided.
 */
export function OfferCta({ o, size = "md" }: { o: Operator; size?: "sm" | "md" }) {
  const sm = size === "sm";
  const outbound = !!(o.affiliate && o.signupUrl);
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
      <Link
        href={reviewPath(o.slug)}
        className="csg-card-btn"
        style={{
          flex: "1 1 auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: sm ? "10px 14px" : "13px 18px",
          borderRadius: 11,
          background: "#FFC531",
          color: "#141007",
          fontSize: sm ? 13.5 : 14.5,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        Read review
      </Link>
      {outbound && (
        <a href={o.signupUrl} target="_blank" rel="noopener sponsored nofollow" data-copy-code={o.promoCode} data-placement="offer-cta" className="csg-visit" style={{ flex: "none", fontSize: sm ? 13 : 13.5, color: "#93A1A9", whiteSpace: "nowrap" }}>
          Visit ↗
        </a>
      )}
    </span>
  );
}
