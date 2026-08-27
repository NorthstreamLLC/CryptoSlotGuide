import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(btcViews.lowwager.h1, btcViews.lowwager.p, "/lowest-wagering");

export default function Page() {
  return <CasinoIndexPage filter="lowwager" />;
}
