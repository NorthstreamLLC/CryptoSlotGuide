import Link from "next/link";
import type { Operator } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

/**
 * The button at the end of a casino row or card.
 *
 * One component because four surfaces had their own copy and all four were
 * wrong the same way: a button labelled "View offer" that opened our own review
 * page. That cost the reader a step on the way to the thing the button named,
 * and on /bonuses — 46 casinos, a page whose whole job is bonuses — there was
 * no route to an operator at all.
 *
 * Where a real affiliate link exists the button goes to the operator and is
 * marked sponsored. Where it does not, the button says what it actually does
 * rather than promising an offer it cannot open. The casino's name and its
 * offer text link to the profile in every row regardless, so nothing is lost.
 */
export function OfferCta({ o, size = "md" }: { o: Operator; size?: "sm" | "md" }) {
  const pad = size === "sm" ? "10px 12px" : "13px 16px";
  const font = size === "sm" ? 13 : 14.5;
  const outbound = !!(o.affiliate && o.signupUrl);

  if (outbound) {
    return (
      <a
        href={o.signupUrl}
        target="_blank"
        rel="noopener sponsored nofollow"
        className="transition-transform hover:-translate-y-px"
        style={{
          flex: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: pad,
          borderRadius: 10,
          background: "#FFC531",
          color: "#141007",
          fontSize: font,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        Visit {o.name} <Icon name="arrow" size={size === "sm" ? 14 : 15} />
      </a>
    );
  }

  return (
    <Link
      href={`/casinos/${o.slug}`}
      className="transition-colors hover:!border-white/25"
      style={{
        flex: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: pad,
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,.16)",
        color: "#DCE5E9",
        fontSize: font,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      Read review <Icon name="arrow" size={size === "sm" ? 14 : 15} />
    </Link>
  );
}
