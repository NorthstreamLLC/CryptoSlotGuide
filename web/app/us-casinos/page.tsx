import { UsIndexPage, type UsIndexCopy } from "@/components/us/UsIndexPage";
import { rankedBrands } from "@/lib/us-brands";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const COPY: UsIndexCopy = {
  kind: "casino",
  title: "US-regulated online casinos",
  sub: "Which state regulators license which casino brand, read off each regulator's own published list.",
  path: "/us-casinos",
  sibling: { label: "US-regulated sportsbooks", href: "/us-sportsbooks", hint: "The same brands ranked on sports betting, where the footprints are far wider." },
};

export const metadata = pageMetadata(COPY.title, COPY.sub, COPY.path);

export default function Page() {
  const ranked = rankedBrands("casino");
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "US-regulated casinos", path: COPY.path }]),
          collectionPageSchema(COPY.title, COPY.sub, COPY.path),
          itemListSchema(COPY.title, ranked.map(({ brand }) => ({ name: brand.name, path: `/us-casinos/${brand.slug}` }))),
        ]}
      />
      <UsIndexPage copy={COPY} />
    </>
  );
}
