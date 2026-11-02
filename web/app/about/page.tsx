import author from "@/data/author.json";
import vip from "@/data/vip.json";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { siteCounts } from "@/lib/site-data";
import { PROMO_PAGES } from "@/lib/promo-pages";
import { InfoPage, A } from "@/components/info/InfoPage";

export const metadata = pageMetadata(
  `About ${SITE_NAME}`,
  `Who runs ${SITE_NAME}, what it covers, how every figure is sourced and checked, and how the site makes money.`,
  "/about"
);

export default function Page() {
  const c = siteCounts;
  return (
    <InfoPage
      kicker="About"
      title={`About ${SITE_NAME}`}
      path="/about"
      intro={<p style={{ margin: 0 }}>{SITE_NAME} is an independent guide to crypto casinos, slots and sportsbooks. Every figure on it, from a withdrawal time to a slot&apos;s RTP, comes from the casino&apos;s, studio&apos;s or regulator&apos;s own pages and links to its source.</p>}
      sections={[
        {
          title: "Who runs it",
          body: (
            <>
              <p style={{ margin: 0 }}>The site is run and edited by its founder, who writes as <A href={`/authors/${author.slug}`}>{author.name}</A>, a pen name for a real person that keeps private life apart from the work. Before this, {author.name} worked inside the casino industry and on the affiliate-network side. Every review, guide and slot page passes through {author.name} before it goes live.</p>
            </>
          ),
        },
        {
          title: "What we cover",
          body: (
            <p style={{ margin: 0 }}>
              {c.casinos} crypto casinos, {c.slots.toLocaleString("en-US")} slots and their studios&apos; published figures, {c.books} sportsbooks, prediction markets, wallets and exchanges, and where each is legal. For the {PROMO_PAGES.length} casinos we hold a promo code for, we also publish what the code gets you, <A href="/casinos/facts">ten facts about each</A>, <A href="/compare">head-to-head comparisons</A> and a <A href="/news">monthly round-up</A> of what changed.
            </p>
          ),
        },
        {
          title: "How we check what we publish",
          body: (
            <>
              <p style={{ margin: 0 }}>Each fact is stored with the page it came from and the date we last read it, and the page shows both. We don&apos;t publish a figure we can&apos;t trace to the casino, the studio, a regulator&apos;s register or on-chain data; where we have no reliable figure, the page says so.</p>
              <p style={{ margin: 0 }}>Every month we re-read the sources behind the casinos we hold codes for, update what moved and publish the changes in our <A href="/news">news</A>. A weekly check watches for source pages that have changed. The full method is in <A href="/how-we-rate">how we source information</A>.</p>
            </>
          ),
        },
        {
          title: "How the site makes money",
          body: (
            <p style={{ margin: 0 }}>
              We earn affiliate commission when a reader signs up at some of the casinos we list, and we partner with {vip.name}, a VIP team, for Roobet players. Those ties decide which casinos we feature, never what a review reports. The details are in our <A href="/affiliate-disclosure">affiliate disclosure</A> and <A href="/editorial-standards">editorial standards</A>.
            </p>
          ),
        },
        {
          title: "Getting in touch",
          body: (
            <p style={{ margin: 0 }}>
              Spotted a wrong figure? Tell us at <A href="mailto:hello@cryptoslotguide.com">hello@cryptoslotguide.com</A> with the page and what you found; we re-check reproducible reports and log what we fix on our <A href="/corrections">corrections</A> page. Everything else goes through the <A href="/contact">contact page</A>.
            </p>
          ),
        },
      ]}
    />
  );
}
