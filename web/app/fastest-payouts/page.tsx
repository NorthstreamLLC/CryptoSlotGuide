import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(btcViews.fast.h1, btcViews.fast.p, "/fastest-payouts");

export default function Page() {
  return <CasinoIndexPage filter="fast" />;
}
