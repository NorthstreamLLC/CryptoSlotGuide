import { UsIndexPage, type UsIndexCopy } from "@/components/us/UsIndexPage";
import { rankedBrands } from "@/lib/us-brands";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Sportsbooks get their own page rather than a column on the casino one.
 * The rankings genuinely differ — DraftKings leads sports on 27 states and
 * ties third on casino with five — and the two are different searches.
 * Brand pages stay shared at /us-casinos/<brand>, since a brand is one
 * company whichever product brought you.
 */
const COPY: UsIndexCopy = {
  kind: "sportsbook",
  title: "US-regulated sportsbooks",
  sub: "Which state regulators license which sportsbook, read off each regulator's own published list.",
  path: "/us-sportsbooks",
  sibling: { label: "US-regulated online casinos", href: "/us-casinos", hint: "The same brands ranked on casino, which only seven states permit at all." },
};

export const metadata = pageMetadata(COPY.title, COPY.sub, COPY.path);

export default function Page() {
  const ranked = rankedBrands("sportsbook");
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "US-regulated sportsbooks", path: COPY.path }]),
          collectionPageSchema(COPY.title, COPY.sub, COPY.path),
          itemListSchema(COPY.title, ranked.map(({ brand }) => ({ name: brand.name, path: `/us-casinos/${brand.slug}` }))),
        ]}
      />
      <UsIndexPage copy={COPY} />
    </>
  );
}
