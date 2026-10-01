import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { getVerticalPage } from "@/lib/vertical-view";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { topSlotRows } from "@/lib/slot-page";

const vp = getVerticalPage("slots");
export const metadata = pageMetadata(vp.title, vp.sub, "/slots");

export default function Page() {
  // The picks, in the page's own order. ItemList is the type that matters on
  // a page whose whole point is a ranked list — it tells Google the page IS
  // the list rather than an article that mentions some slots. The order here
  // must be the order the reader sees, so it comes from the same helper the
  // table does rather than a re-sorted copy.
  const picks = topSlotRows();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: vp.title, path: "/slots" }]),
          collectionPageSchema(vp.title, vp.sub, "/slots"),
          itemListSchema(
            "Our top slots",
            picks.map((p) => ({ name: p.name, path: `/slots/${p.slug}` }))
          ),
        ]}
      />
      <VerticalIndexPage kind="slots" />
    </>
  );
}
