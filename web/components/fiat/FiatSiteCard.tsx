import type { FiatBrand } from "@/lib/fiat";
import { tintFor } from "@/lib/logo";

/**
 * One licensed brand: its own icon, the name, every web address the register
 * lists for it, the company holding the licence, what the licence covers,
 * and a link to the site itself.
 *
 * The link is nofollow until we hold an affiliate link for the brand — it
 * is a reference to a site the regulator lists, not an endorsement.
 */
const MONO = "var(--font-jetbrains-mono), monospace";
const PRODUCT_LABEL = { casino: "Casino", sports: "Sportsbook" } as const;

function Mark({ brand, size }: { brand: FiatBrand; size: number }) {
  if (brand.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={brand.logo} alt="" width={size} height={size} loading="lazy" className={size === 36 ? "csg-fb-logo csg-fb-logo-c" : "csg-fb-logo"} />;
  }
  // No icon of its own: a monogram in the brand's own tint (derived from its
  // name), large enough to read. Our own type treatment, not an imitation of
  // their mark; the full name sits beside it on the card.
  const words = brand.name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  // A name that starts with a number (123bingo, 6paldo, 888) keeps the number.
  const lead = (words[0] ?? "?").match(/^\d{1,3}/)?.[0];
  const mono = (lead ?? (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?")[0])).toUpperCase();
  const tint = tintFor(brand.id);
  return (
    <span
      title={brand.name}
      aria-hidden
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: size / 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(120% 120% at 20% 0%, ${tint}66, ${tint}1f 62%), #0F1518`,
        border: `1px solid ${tint}66`,
        fontSize: mono.length === 1 ? size * 0.5 : mono.length === 2 ? size * 0.38 : size * 0.3,
        fontWeight: 800,
        letterSpacing: "-.04em",
        color: "#FFFFFF",
        textShadow: `0 1px 8px ${tint}88`,
      }}
    >
      {mono}
    </span>
  );
}

// Classes in globals.css (.csg-fb*), not inline styles: a register page draws
// hundreds of these cards, and the same style objects repeated on every one
// were most of the UK page's 1.7MB.
export function FiatBrandCard({ brand, compact = false }: { brand: FiatBrand; compact?: boolean }) {
  const [main, ...more] = brand.domains;
  return (
    <div id={brand.id} className={compact ? "csg-fb csg-fb-c" : "csg-fb"}>
      <div className="csg-fb-head">
        <Mark brand={brand} size={compact ? 36 : 44} />
        <div className="csg-fb-text">
          <div className="csg-fb-name">{brand.name}</div>
          <div className="csg-fb-dom">
            {main}
            {more.length > 0 && <span title={more.join(", ")}> +{more.length} more</span>}
          </div>
        </div>
      </div>
      {brand.holders.length > 0 && <div className="csg-fb-hold">Licence held by {brand.holders.join(", ")}</div>}
      <div className="csg-fb-foot">
        {brand.products.map((p) => (
          <span key={p} className={p === "casino" ? "csg-fb-tag csg-fb-tag-casino" : "csg-fb-tag"}>
            {PRODUCT_LABEL[p]}
          </span>
        ))}
        <a href={`https://${main}/`} target="_blank" rel="noopener noreferrer nofollow" className="csg-fb-visit hover:!text-accent">
          Visit site ↗
        </a>
      </div>
    </div>
  );
}
