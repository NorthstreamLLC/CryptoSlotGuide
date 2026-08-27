import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(btcViews.all.h1, btcViews.all.p, "/crypto-casinos");

export default function Page() {
  return <CasinoIndexPage filter="all" />;
}
