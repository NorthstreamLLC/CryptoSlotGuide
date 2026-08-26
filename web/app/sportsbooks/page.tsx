import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const tabIdx = tab === "1" ? 1 : tab === "2" ? 2 : 0;
  return <VerticalIndexPage kind="sportsbooks" tabIdx={tabIdx} />;
}
