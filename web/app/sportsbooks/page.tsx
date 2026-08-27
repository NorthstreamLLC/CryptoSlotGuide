import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { getVerticalPage } from "@/lib/vertical-view";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const tabIdx = tab === "1" ? 1 : tab === "2" ? 2 : 0;
  const vp = getVerticalPage("sportsbooks", tabIdx);
  return pageMetadata(vp.title, vp.sub, tabIdx === 0 ? "/sportsbooks" : `/sportsbooks?tab=${tabIdx}`);
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const tabIdx = tab === "1" ? 1 : tab === "2" ? 2 : 0;
  return <VerticalIndexPage kind="sportsbooks" tabIdx={tabIdx} />;
}
