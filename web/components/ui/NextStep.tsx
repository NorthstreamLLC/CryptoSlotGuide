import Link from "next/link";
import { siteData } from "@/lib/site-data";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";
import { CodeChip } from "@/components/ui/CodeChip";
import { hasPromoPage } from "@/lib/promo-pages";

const MONO = "var(--font-jetbrains-mono), monospace";
const GOLD = "#FFC531";

/**
 * The one clear next action at the end of a page: a slot review leads to
 * somewhere to play slots, a casino review to its offer, a guide to the
 * casinos or bonuses. One block, one main button, the same look everywhere.
 */
function Block({ kicker, title, sub, cta, href, external, code, geoSlug, geoName, secondary }: {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  external?: boolean;
  code?: string | null;
  geoSlug?: string;
  geoName?: string;
  secondary?: { label: string; href: string };
}) {
  const button = { padding: "14px 22px", borderRadius: 12, background: "linear-gradient(180deg,#FFD866,#FFC531)", color: "#141007", fontSize: 15.5, fontWeight: 800, whiteSpace: "nowrap" as const };
  return (
    <section aria-label="Next step" style={{ margin: "36px 0", padding: "24px 26px", borderRadius: 18, background: "radial-gradient(80% 140% at 0% 50%, rgba(255,197,49,.14), transparent 60%), #0F1418", border: "1px solid rgba(255,197,49,.32)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <div style={{ minWidth: 0, flex: "1 1 320px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".08em", color: GOLD, marginBottom: 6 }}>{kicker}</div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, color: "#fff" }}>{title}</div>
          <div style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.5, color: "#A8B6BE" }}>{sub}</div>
          {code && (
            <div style={{ marginTop: 12 }}>
              <CodeChip code={code} tint={GOLD} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8 }}>
          {external ? (
            <a href={href} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code ?? undefined} style={{ ...button, textAlign: "center" }}>{cta} ↗</a>
          ) : (
            <Link href={href} style={{ ...button, textAlign: "center" }}>{cta} →</Link>
          )}
          {secondary && (
            <Link href={secondary.href} style={{ textAlign: "center", fontSize: 13.5, fontWeight: 700, color: "#FFD36B" }}>{secondary.label}</Link>
          )}
        </div>
      </div>
      {geoSlug && geoName && <GeoBlockNote slug={geoSlug} name={geoName} compact />}
      {external && <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 10.5, color: "#7F8D96" }}>Affiliate link: we may earn a commission, which never changes what we report. 18+ · T&amp;Cs apply.</p>}
    </section>
  );
}

/** End of a slot page: where to play it. */
export function SlotNextStep({ name }: { name: string }) {
  const r = siteData.ops.find((o) => o.slug === "roobet");
  if (!r?.signupUrl) {
    return <Block kicker="NEXT STEP" title={`Ready to play ${name}?`} sub="The best crypto slot sites: big game libraries, fast withdrawals, and the bonus that fits slots." cta="Best crypto slot sites" href="/slots/best-crypto-slot-sites" />;
  }
  return (
    <Block
      kicker="NEXT STEP"
      title={`Ready to play ${name}?`}
      sub={r.promoCode ? `Check the RTP in the game's info screen first. Our pick for slots is Roobet: sign up with code ${r.promoCode}, then claim the welcome package through CasinoPerks on Telegram.` : "Check the RTP in the game's info screen first. Our pick for slots is Roobet."}
      cta="Play slots at Roobet"
      href={r.signupUrl}
      external
      code={r.promoCode}
      geoSlug="roobet"
      geoName={r.name}
      secondary={{ label: "Or compare the best crypto slot sites →", href: "/slots/best-crypto-slot-sites" }}
    />
  );
}

/** End of a casino review: its offer, or our pick where we hold no link. */
export function CasinoNextStep({ slug }: { slug: string }) {
  const o = siteData.ops.find((x) => x.slug === slug);
  if (!o) return null;
  if (o.affiliate && o.signupUrl) {
    const readable = !!o.promoCode && /^[A-Za-z]{3,14}$/.test(o.promoCode);
    return (
      <Block
        kicker="NEXT STEP"
        title={readable ? `Sign up at ${o.name} with code ${o.promoCode}` : `Sign up at ${o.name}`}
        sub={o.bonusShort ?? o.bonus ?? "Its current offer is on its own promotions page."}
        cta={`Claim at ${o.name}`}
        href={o.signupUrl}
        external
        code={readable ? o.promoCode : null}
        geoSlug={o.slug}
        geoName={o.name}
        secondary={o.slug === "roobet" ? { label: "How to claim the full package →", href: "/promo-codes/roobet" } : hasPromoPage(o.slug) ? { label: `How to use code ${o.promoCode} →`, href: `/promo-codes/${o.slug}` } : { label: "Or compare our top crypto casinos →", href: "/crypto-casinos" }}
      />
    );
  }
  return <Block kicker="NEXT STEP" title={`Not sure ${o.name} is the one?`} sub="Our top crypto casinos, with payout speed, bonus and coins side by side." cta="Compare crypto casinos" href="/crypto-casinos" />;
}

/** End of a guide: the bonuses (for bonus and casino guides) or the casino list. */
export function GuideNextStep({ category }: { category: string }) {
  const bonusy = /bonus|wager|promo|rakeback|vip/i.test(category);
  return bonusy ? (
    <Block kicker="PUT IT TO USE" title="Find a bonus with fair terms" sub="Welcome offers and promo codes, with the wagering spelled out next to each one." cta="See the best bonuses" href="/bonuses" />
  ) : (
    <Block kicker="PUT IT TO USE" title="Find a crypto casino that fits" sub="Our top picks, with payout speed, bonus and coins checked against each casino's own pages." cta="Compare crypto casinos" href="/crypto-casinos" secondary={{ label: "Or check what's legal where you live →", href: "/legal" }} />
  );
}
