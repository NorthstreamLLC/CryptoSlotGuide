import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(btcViews.nokyc.h1, btcViews.nokyc.p, "/crypto-casinos/no-kyc");

export default function Page() {
  return <CasinoIndexPage filter="nokyc" />;
}
