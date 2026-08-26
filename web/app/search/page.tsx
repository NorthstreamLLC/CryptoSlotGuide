import { SearchPage } from "@/components/search/SearchPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPage initialQuery={q ?? ""} />;
}
