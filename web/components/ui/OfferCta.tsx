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
    // The offer button and a way to read the review first. Someone who is not
    // ready to click through to an operator should not have to hunt for the
    // profile — the casino name links there too, but a named button is the
    // thing people look for, and burying it costs the reader more than it
    // gains the click.
    return (
      <span style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
        <a
          href={o.signupUrl}
          target="_blank"
          rel="noopener sponsored nofollow"
          className="transition-transform hover:-translate-y-px"
          style={{
            flex: "1 1 auto",
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
        <Link
          href={`/casinos/${o.slug}`}
          className="transition-colors hover:!border-white/25 hover:!text-white"
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: size === "sm" ? "10px 10px" : "13px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.16)",
            color: "#9FB0B9",
            fontSize: size === "sm" ? 12 : 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Review
        </Link>
      </span>
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
