import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { inHouseOrder } from "@/lib/house-order";
import { topSlotRows } from "@/lib/slot-page";
import { TOP_STUDIOS } from "@/lib/top-studios";
import { OfferCards } from "@/components/home/OfferCards";
import { SlotArtCards } from "@/components/home/SlotArtCards";
import { BrandMark } from "@/components/ui/BrandMark";

const MONO = "var(--font-jetbrains-mono), monospace";

function Heading({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#FFC531", marginBottom: 8 }}>{kicker}</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 26, letterSpacing: "-.028em", fontWeight: 800, color: "#fff" }}>{title}</h2>
      <p style={{ margin: 0, maxWidth: "70ch", fontSize: 14.5, lineHeight: 1.6, color: "#8DA0AA" }}>{sub}</p>
    </div>
  );
}

/**
 * Near the top of a studio page: where we would play, then the studio's slots
 * we rank. The casinos are our recommendations for slot players, not a claim
 * about which lobbies carry this studio; the line under the heading says so.
 */
export function ProviderLead({ name }: { name: string }) {
  const casinos = inHouseOrder(siteData.ops.filter((o) => o.affiliate && o.signupUrl)).slice(0, 4);
  const slots = topSlotRows().filter((r) => r.provider === name);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 44, marginBottom: 44 }}>
      {casinos.length > 0 && (
        <section>
          <Heading kicker="Where to play" title={`Our top casinos for ${name} slots`} sub={`The casinos we recommend to slot players. Each one names its studios in its own lobby, so search it for ${name} before you deposit.`} />
          <OfferCards ops={casinos} />
        </section>
      )}
      {slots.length > 0 && (
        <section>
          <Heading
            kicker="Best games"
            title={`The best ${name} slots`}
            sub={`${name} titles on our top-slots list, each with a full review. The RTP, max win and volatility are the figures ${name} publishes on its own game page.`}
          />
          <SlotArtCards rows={slots.slice(0, 8)} />
        </section>
      )}
    </div>
  );
}

/** Other studios worth knowing, from the same short list the homepage uses. */
export function ProviderAlternatives({ slug, name }: { slug: string; name: string }) {
  const others = TOP_STUDIOS.filter((s) => s !== slug)
    .map((s) => siteData.providers.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => !!p);
  if (!others.length) return null;
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 40px 40px" }}>
      <Heading kicker="Alternatives" title={`${name} alternatives`} sub="The other studios crypto players reach for most, each profiled on how it discloses RTP." />
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
        {others.map((p) => (
          <Link key={p.slug} href={`/providers/${p.slug}`} className="csg-lift" style={{ display: "flex", flexDirection: "column", gap: 10, padding: 18, borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
            <span style={{ width: 44, height: 44, borderRadius: 11, overflow: "hidden" }}>
              <BrandMark slug={p.slug} mono={p.mono} tint={p.tint} radius={11} fontSize={12} />
            </span>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{p.name}</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.note}</span>
            <span style={{ marginTop: "auto", fontFamily: MONO, fontSize: 11, color: "#00C2CC" }}>Studio profile →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
