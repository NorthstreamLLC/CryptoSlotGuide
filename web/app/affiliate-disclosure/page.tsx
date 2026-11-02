import Link from "next/link";
import vip from "@/data/vip.json";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { siteData } from "@/lib/site-data";
import { inHouseOrder } from "@/lib/house-order";
import { InfoPage, A } from "@/components/info/InfoPage";

export const metadata = pageMetadata(
  "Affiliate disclosure",
  `How ${SITE_NAME} earns money: affiliate links and codes, the casinos we have them with, how links are marked, and what commission never changes.`,
  "/affiliate-disclosure"
);

export default function Page() {
  // The casinos whose sign-up links on this site are affiliate links, in the order the site lists them.
  const partners = inHouseOrder(siteData.ops.filter((o) => o.affiliate && o.signupUrl));
  return (
    <InfoPage
      kicker="Disclosure"
      title="Affiliate disclosure"
      path="/affiliate-disclosure"
      tint="#FFC531"
      intro={<p style={{ margin: 0 }}>{SITE_NAME} is free to read because some casinos pay us when a reader signs up through our links. This page sets out exactly how that works, so you can weigh what we publish knowing it.</p>}
      sections={[
        {
          title: "How we earn",
          body: (
            <>
              <p style={{ margin: 0 }}>When you sign up at a casino through one of our links, or with one of our promo codes such as SLOTGUIDE or ELITE, the casino may pay us a commission. It costs you nothing, and at some casinos the code adds something for you, which the casino&apos;s code page sets out. We also partner with {vip.name}, a VIP team, for Roobet players who claim the ELITE welcome package.</p>
            </>
          ),
        },
        {
          title: "How links are marked",
          body: (
            <p style={{ margin: 0 }}>Affiliate links are labelled near the button (&quot;Affiliate link&quot; or &quot;Our affiliate code&quot;) and carry the <code>rel=&quot;sponsored&quot;</code> attribute, so search engines treat them as paid. Many go through a short redirect on our own domain, /go/&lt;casino&gt;, which we keep out of search results. A disclosure line runs at the foot of every page.</p>
          ),
        },
        {
          title: "What commission never changes",
          body: (
            <>
              <p style={{ margin: 0 }}>No figure, score or verdict on the site is shaped by commission. Every fact comes from the casino&apos;s, studio&apos;s or regulator&apos;s own pages and links to them, whether or not we earn from that casino, and casinos never see a review before it&apos;s published. Our comparisons say where a casino we earn from is weaker.</p>
              <p style={{ margin: 0 }}>Commission does decide placement where nothing measurable sorts a list: our featured order, which puts our partners first, is commercial and never described as a ranking. Lists that rank by something measured, such as withdrawal speed or wagering, sort by that measure alone. The full policy is in our <A href="/editorial-standards">editorial standards</A>.</p>
            </>
          ),
        },
        {
          title: `The ${partners.length} casinos we have affiliate links with`,
          body: (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {partners.map((o) => (
                <Link key={o.slug} href={`/casinos/${o.slug}`} style={{ padding: "6px 12px", borderRadius: 100, background: "#0C1013", border: "1px solid rgba(255,197,49,.3)", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0" }}>
                  {o.name}
                </Link>
              ))}
            </div>
          ),
        },
        {
          title: "Questions",
          body: <p style={{ margin: 0 }}>If you think a page doesn&apos;t make a commercial tie clear, tell us at <A href="mailto:hello@cryptoslotguide.com">hello@cryptoslotguide.com</A>.</p>,
        },
      ]}
    />
  );
}
