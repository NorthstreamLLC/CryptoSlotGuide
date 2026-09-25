import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { accessIn } from "@/lib/legal";
import { brandFor } from "@/lib/casino-facts";
import coinsBy from "@/data/coinsBy.json";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * The featured operator, placed on pages that would otherwise end without one.
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
 * 3. DISCLOSURE. It is labelled and carries the affiliate note. This is a paid
 *    placement and reads as one.
 *
 * It is deliberately one quiet row rather than a second hero: the point is to
 * be present everywhere, not loud anywhere.
 */

export type PartnerContext =
  | { kind: "coin"; ticker: string }
  | { kind: "sports" }
  | { kind: "esports" }
  | { kind: "slots" }
  | { kind: "house" }
  | { kind: "wallet" }
  | { kind: "general" };

const COINS = coinsBy as Record<string, string[]>;

/** One true, cited line explaining why this operator belongs on this page. */
function pitchFor(slug: string, ctx: PartnerContext): string | null {
  const spec = (group: string, label: string) => getSpecFact(slug, group, label)?.value ?? null;

  switch (ctx.kind) {
    case "coin": {
      // Only claim a coin the operator's own list actually names.
      if (!(COINS[slug] ?? []).map(String).includes(ctx.ticker.toUpperCase())) return null;
      return `Takes ${ctx.ticker.toUpperCase()} deposits and withdrawals, alongside ${(COINS[slug] ?? []).length - 1} other coins.`;
    }
    case "sports":
      return spec("Sportsbook", "Sportsbook");
    case "esports":
      return spec("Sportsbook", "Esports titles") ?? spec("Sportsbook", "Esports");
    case "slots":
    case "house":
    case "wallet":
    case "general":
    default:
      return null;
  }
}

/**
 * The fallback line: withdrawal speed and the bonus condition that actually
 * decides whether an offer is worth taking. True on every page, so it is what
 * runs wherever there is no subject-specific fact to lead with.
 *
 * Two facts, each clamped to its own leading clause and joined with a visible
 * separator. Concatenating the raw cited values runs them together into one
 * unreadable sentence — these are full spec-sheet entries written to be read in
 * a table, not strung end to end.
 */
function defaultPitch(slug: string): string | null {
  const parts = [
    getSpecFact(slug, "Payouts & fees", "Stated withdrawal time")?.value,
    getSpecFact(slug, "Bonus terms", "Wagering")?.value,
  ]
    .filter((v): v is string => !!v)
    .map((v) => clause(v, 72));
  return parts.length ? parts.join(" · ") : null;
}

/** The leading clause of a cited fact — the profile carries the rest verbatim. */
const clause = (s: string, max: number): string => {
  const cut = s.split(/(?<=\.)\s+|[;(]/)[0].trim();
  return cut.length > max ? `${cut.slice(0, max - 1).replace(/[\s,;-]+$/, "")}…` : cut;
};

/** Trim a long cited fact to its first sentence — the profile carries the rest. */
const firstSentence = (s: string, max = 190): string => {
  const cut = s.split(/(?<=\.)\s+/)[0] ?? s;
  return cut.length > max ? `${cut.slice(0, max - 1).replace(/[\s,;-]+$/, "")}…` : cut;
};

export function FeaturedPartner({
  context = { kind: "general" },
  country,
  state,
  heading = "Casino we recommend",
}: {
  context?: PartnerContext;
  /** ISO code of the country this page is about, if it is about one. */
  country?: string;
  /** US state code. The operator restricts the whole US, so any value suppresses it. */
  state?: string;
  heading?: string;
}) {
  const o = siteData.ops.find((x) => x.featured);
  if (!o || !o.signupUrl) return null;

  // Rule 1, before anything else is computed.
  if (state) return null;
  if (country && accessIn(o.slug, country) === "restricted") return null;

  const raw = pitchFor(o.slug, context) ?? defaultPitch(o.slug);
  if (!raw) return null;
  const pitch = firstSentence(raw);

  const tint = brandFor(o.slug);

  return (
    <aside
      // A stable hook for the placement audit. Matching on the visible copy
      // does not work: React splits `Visit {name}` into separate SSR text
      // nodes, so a regex for the rendered sentence silently finds nothing and
      // reports a clean geo-gate that was never actually tested.
      data-featured-partner={o.slug}
      style={{
        marginTop: 44,
        padding: "18px 20px",
        borderRadius: 16,
        background: "#0C1013",
        border: "1px solid rgba(255,255,255,.07)",
        // One hairline of brand colour is the whole visual budget here.
        borderLeft: `2px solid ${tint}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#C7A45C" }}>{heading}</span>
        {/* The commercial relationship stays visible at the point of the
            recommendation, not only in the header strip. "Partner" rather than
            "advertiser": it is plainer English and it is the more accurate
            word for what the relationship actually is. */}
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".04em", color: "#7C8A93" }}>· partner</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
          <BrandMark slug={o.slug} mono={o.mono} tint={tint} radius={12} fontSize={15} />
        </span>

        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
            <Link href={`/casinos/${o.slug}`} className="hover:!text-accent" style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.015em", color: "#fff" }}>
              {o.name}
            </Link>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "#8E9CA5" }}>{o.licence} licence</span>
          </div>
          <p style={{ margin: "4px 0 0", maxWidth: "72ch", fontSize: 13.5, lineHeight: 1.55, color: "#A9B8C0", textWrap: "pretty" }}>{pitch}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Link
            href={`/casinos/${o.slug}`}
            className="transition-colors hover:!border-white/25"
            style={{ padding: "10px 15px", borderRadius: 9, border: "1px solid rgba(255,255,255,.14)", fontSize: 13.5, fontWeight: 600, color: "#C6D1D7", whiteSpace: "nowrap" }}
          >
            Read the review
          </Link>
          <a
            href={o.signupUrl}
            target="_blank"
            rel="noopener sponsored nofollow"
            className="transition-transform hover:-translate-y-px"
            style={{ padding: "10px 17px", borderRadius: 9, background: "#00C2CC", color: "#04191B", fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Visit {o.name} →
          </a>
        </div>
      </div>
    </aside>
  );
}
