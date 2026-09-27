import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { getVerticalPage } from "@/lib/vertical-view";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const tabIdx = tab === "1" || tab === "2" ? 1 : 0;
  const vp = getVerticalPage("sportsbooks", tabIdx);
  return pageMetadata(vp.title, vp.sub, tabIdx === 0 ? "/sportsbooks" : "/sportsbooks?tab=2");
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const tabIdx = tab === "1" || tab === "2" ? 1 : 0;
  const vp = getVerticalPage("sportsbooks", tabIdx);
  const path = tabIdx === 0 ? "/sportsbooks" : "/sportsbooks?tab=2";
  // getVerticalPage returns the rows already in render order, so the schema
  // describes exactly what the tab shows.
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: vp.title, path }]),
          collectionPageSchema(vp.title, vp.sub, path),
          itemListSchema(vp.title, vp.rows.map((r) => ({ name: r.name, path: r.href }))),
        ]}
      />
      <VerticalIndexPage kind="sportsbooks" tabIdx={tabIdx} />
    </>
  );
}
