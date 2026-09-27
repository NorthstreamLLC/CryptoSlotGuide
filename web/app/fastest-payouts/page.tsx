import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews, defaultIndexList } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";

const FILTER = "fast" as const;
const PATH = "/fastest-payouts";
const view = btcViews[FILTER];

export const metadata = pageMetadata(view.h1, view.p, PATH);

export default function Page() {
  // The list in the order the page first paints it. defaultIndexList shares
  // its sort with the component's initial state, so the schema cannot drift
  // from what a crawler actually sees.
  const list = defaultIndexList(FILTER).map((o) => ({ name: o.name, path: `/casinos/${o.slug}` }));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: view.crumb, path: PATH }]),
          collectionPageSchema(view.h1, view.p, PATH),
          itemListSchema(view.h1, list),
        ]}
      />
      <CasinoIndexPage filter={FILTER} />
    </>
  );
}
