import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { SportsbooksIndex } from "@/components/sports/SportsbooksIndex";
import { getVerticalPage } from "@/lib/vertical-view";
import { sportsbookOrder } from "@/lib/sports";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";

const TITLE = "Crypto sportsbooks: best welcome bonuses, races and boosts";
const SUB = "Every crypto sportsbook we track, ranked on the standing welcome offer, the races sports bets enter and the boosts each runs — from each book's own terms.";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  if (tab === "1" || tab === "2") {
    const vp = getVerticalPage("sportsbooks", 1);
    return pageMetadata(vp.title, vp.sub, "/sportsbooks?tab=2");
  }
  return pageMetadata(TITLE, SUB, "/sportsbooks");
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  // The esports tab keeps the list template; the sportsbooks view is its own page.
  if (tab === "1" || tab === "2") {
    const vp = getVerticalPage("sportsbooks", 1);
    return (
      <>
        <JsonLd
          data={[
            breadcrumbSchema([{ name: "Home", path: "/" }, { name: vp.title, path: "/sportsbooks?tab=2" }]),
            collectionPageSchema(vp.title, vp.sub, "/sportsbooks?tab=2"),
            itemListSchema(vp.title, vp.rows.map((r) => ({ name: r.name, path: r.href }))),
          ]}
        />
        <VerticalIndexPage kind="sportsbooks" tabIdx={1} />
      </>
    );
  }
  const books = sportsbookOrder();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Sportsbooks", path: "/sportsbooks" }]),
          collectionPageSchema(TITLE, SUB, "/sportsbooks"),
          itemListSchema(TITLE, books.map((o) => ({ name: `${o.name} sportsbook`, path: `/sportsbooks/${o.slug}` }))),
        ]}
      />
      <SportsbooksIndex />
    </>
  );
}
