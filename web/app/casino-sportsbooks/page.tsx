import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(btcViews.sports.h1, btcViews.sports.p, "/casino-sportsbooks");

export default function Page() {
  return <CasinoIndexPage filter="sports" />;
}
