import { LiveCasinoPage } from "@/components/live-casino/LiveCasinoPage";
import type { LiveGame } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Live casino: table limits, dealer latency, studio quality",
  "Live dealer operators and tables compared on seat limits, stream latency and which studio is behind the glass.",
  "/live-casino"
);

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <LiveCasinoPage initialType={type as LiveGame["type"] | undefined} />;
}
