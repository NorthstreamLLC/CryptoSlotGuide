import { LiveCasinoPage } from "@/components/live-casino/LiveCasinoPage";
import type { LiveGame } from "@/lib/types";

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <LiveCasinoPage initialType={type as LiveGame["type"] | undefined} />;
}
