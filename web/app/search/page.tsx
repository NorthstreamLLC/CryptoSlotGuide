import { SearchPage } from "@/components/search/SearchPage";
import { pageMetadata } from "@/lib/seo";

/**
 * Noindex, follow. A search-results page generates a near-infinite set of
 * thin URLs off one template, which is the case Google's own guidance calls
 * out for exclusion — and every result on it is a page we already want
 * indexed on its own. `follow` keeps the internal links working as links.
 */
export const metadata = {
  ...pageMetadata(
    "Search the index",
    "Search every casino, slot, provider, wallet, exchange and guide we track by name.",
    "/search"
  ),
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPage initialQuery={q ?? ""} />;
}
