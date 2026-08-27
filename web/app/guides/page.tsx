import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { getVerticalPage } from "@/lib/vertical-view";
import { pageMetadata } from "@/lib/seo";

const vp = getVerticalPage("guides");
export const metadata = pageMetadata(vp.title, vp.sub, "/guides");

export default function Page() {
  return <VerticalIndexPage kind="guides" />;
}
