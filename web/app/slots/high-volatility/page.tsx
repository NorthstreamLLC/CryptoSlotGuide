import { SlotCategoryPage } from "@/components/slots/SlotCategoryPage";
import { siteData } from "@/lib/site-data";
import { slotsByMechanic } from "@/lib/slot-facts";
import { catalogueByMechanic } from "@/lib/slot-page";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";

const TAG = "high-volatility" as const;
const PATH = "/slots/high-volatility";
const cat = siteData.slotCatDefs.find((d) => d.tag === TAG)!;
const TITLE = `${cat.label} slots`;

export const metadata = pageMetadata(TITLE, cat.standfirst, PATH);

export default function Page() {
  // Reviews first, then every catalogue title with this mechanic and a page —
  // the order the page renders, so the ItemList describes what is on screen.
  const reviews = slotsByMechanic(TAG);
  const list = [...reviews, ...catalogueByMechanic(TAG, new Set(reviews.map((s) => s.slug)))].map((s) => ({ name: s.name, path: `/slots/${s.slug}` }));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Slots", path: "/slots" },
            { name: cat.label, path: PATH },
          ]),
          collectionPageSchema(TITLE, cat.standfirst, PATH),
          itemListSchema(TITLE, list),
        ]}
      />
      <SlotCategoryPage tag={TAG} />
    </>
  );
}
