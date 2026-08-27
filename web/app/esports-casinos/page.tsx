import { CasinoIndexPage } from "@/components/casino-index/CasinoIndexPage";
import { btcViews } from "@/lib/casino-index";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(btcViews.esports.h1, btcViews.esports.p, "/esports-casinos");

export default function Page() {
  return <CasinoIndexPage filter="esports" />;
}
