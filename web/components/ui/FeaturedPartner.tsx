import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { countryBy } from "@/lib/legal";
import { brandFor } from "@/lib/casino-facts";
import { pickPartners, type PartnerContext } from "@/lib/partner-fit";
import { GeoRanked } from "@/components/geo/GeoRanked";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";


/**
 * The partners that best fit the page (three by default; lib/partner-fit.ts
 * ranks them), placed on pages that would otherwise end without a casino to
 * go to. Not the same casino first everywhere: the page's subject and its own
 * key decide the order, and the visitor's location drops any that would turn
 * them away (GeoRanked).
 *
 * Three rules it enforces itself, rather than leaving to whoever adds it to a
 * page:
 *
 * 1. GEO. It does not render on a page scoped to a territory the operator's own
 *    restricted list names. Roobet blocks the US, UK, Australia, the
 *    Netherlands, Malta and more, so on those pages this is not merely
 *    tasteless — the click cannot convert and the reader is sent to a door that
 *    is shut. Pass `country`/`state` from any page that is about one place.
 * 2. RELEVANCE. The line it shows is chosen from the page's subject and comes
 *    from the operator's own cited facts, so it says something true about why
 *    it is on THIS page. It never claims coverage we have no data for — there
 *    is no casino-to-studio mapping on file, so a slots or provider page gets
 *    the withdrawal and bonus facts under a "somewhere to play" framing, never
 *    "carries this studio's games".
 * 3. DISCLOSURE. Carried by the site-wide advertiser strip that renders above
 *    every page this unit appears on, and by rel="sponsored" on the outbound
 *    link. Both verified present on slot, provider, wallet and guide pages. If
 *    that strip is ever removed from a template, the commercial relationship
 *    stops being declared anywhere on these pages and this unit has to carry
 *    its own label again.
 *
 * It is deliberately a quiet panel rather than a second hero: the point is to
 * be present everywhere, not loud anywhere.
 */

export type { PartnerContext };

export function FeaturedPartner({
  context = { kind: "general" },
  country,
  state,
  heading,
  count = 3,
  exclude,
  seed,
}: {
  context?: PartnerContext;
  /** ISO code of the country this page is about, if it is about one. */
  country?: string;
  /** US state code. Every partner restricts the whole US, so any value suppresses it. */
  state?: string;
  heading?: string;
  /** How many partners to show, best fit first. */
  count?: number;
  /** Casinos not to recommend: the one whose own page this is, say. */
  exclude?: string | string[];
  /** The page's own key (its slug), so pages with the same subject rotate. */
  seed?: string;
}) {
  // Rule 1, before anything else is computed.
  if (state) return null;
  /**
   * And where the country itself bans online casinos, whatever the operators'
   * own terms say. The per-operator gate below only asks whether the operator
   * would take you, which is a different question: Roobet does not restrict
   * India, so a "Visit Roobet" button was sitting on a page that opens by
   * saying online casinos are not legal in India. Nine countries are in that
   * position.
   */
  if (country && /not legal|banned|prohibit/i.test(countryBy(country)?.onlineCasino ?? "")) return null;
  /**
   * Nor in a licensed market (GB, DE, NL, ES, IT, SE ...): there a casino
   * needs the country's own licence, and advertising one without it is an
   * offence for the affiliate too. No partner holds one, and an operator not
   * listing the country as restricted does not make it licensed there — with
   * Roobet alone this was hidden by Roobet blocking GB; with three partners
   * it put Curaçao casinos on the UK page.
   */
  if (country && /licensed market/i.test(countryBy(country)?.onlineCasino ?? "")) return null;

  // Best fit first, each gated on its own restricted list for a page about one
  // place; two spare candidates stand in for any the visitor's location shuts.
  const rows = pickPartners({ context, seed, country, exclude: typeof exclude === "string" ? [exclude] : exclude ?? [], limit: count + 2 });
  if (!rows.length) return null;

  const title = heading ?? (rows.length > 1 ? "Casinos we recommend" : "Casino we recommend");

  return (
    <aside data-placement={context.kind === "alternative" ? "alternatives" : "partners"} style={{ marginTop: 44, padding: "18px 20px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.015em", color: "#F2F5F7" }}>{title}</span>
      </div>
      <GeoRanked
        count={count}
        note={<GeoBlockNote slug={rows[0].o.slug} name={rows[0].o.name} none />}
        items={rows.map(({ o, pitch }) => {
        const tint = brandFor(o.slug);
        return { slug: o.slug, node: (
          <div
            className="csg-fp-row"
            // A stable hook for the placement audit (scripts/audit-partner-geo.mjs).
            // Matching on the visible copy does not work: React splits
            // `Visit {name}` into separate SSR text nodes.
            data-featured-partner={o.slug}
            style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "12px 0" }}
          >
            {/* Number, mark and text stay on one line; only the buttons wrap. */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 300px", minWidth: 0 }}>
            <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, overflow: "hidden", border: `1px solid ${tint}55` }}>
              <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={12} fontSize={15} />
            </span>

            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
                <Link href={`/casinos/${o.slug}`} className="hover:!text-accent" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.015em", color: "#F2F5F7" }}>
                  {o.name}
                </Link>
                <span style={{ fontSize: 12.5, color: "#75828A" }}>{o.licence} licence</span>
              </div>
              <p style={{ margin: "4px 0 0", maxWidth: "72ch", fontSize: 13.5, lineHeight: 1.55, color: "#A9B8C0", textWrap: "pretty" }}>
                <strong style={{ color: "#E8EDF0" }}>{o.bonusShort ?? o.bonus}</strong>
                <span style={{ color: "#77858E" }}> · {pitch}</span>
              </p>
            </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                href={`/casinos/${o.slug}`}
                className="csg-card-btn"
                style={{ padding: "10px 17px", borderRadius: 10, background: "#FFC531", color: "#141007", fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Read review
              </Link>
              <a href={o.signupUrl} target="_blank" rel="noopener sponsored nofollow" data-copy-code={o.promoCode} className="csg-visit" style={{ fontSize: 13.5, color: "#93A1A9", whiteSpace: "nowrap" }}>
                Visit ↗
              </a>
            </div>
          </div>
        ) };
      })}
      />
      <style>{`.csg-fp-row + .csg-fp-row { border-top: 1px solid rgba(255,255,255,.06); }`}</style>
    </aside>
  );
}
