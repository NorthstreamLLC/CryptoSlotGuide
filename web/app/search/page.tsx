import { SearchPage } from "@/components/search/SearchPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Search the index",
  "Search every casino, slot, provider, wallet, exchange and guide we track by name.",
  "/search"
);

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPage initialQuery={q ?? ""} />;
}
