import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { getVerticalPage } from "@/lib/vertical-view";
import { pageMetadata } from "@/lib/seo";

const vp = getVerticalPage("slots");
export const metadata = pageMetadata(vp.title, vp.sub, "/slots");

export default function Page() {
  return <VerticalIndexPage kind="slots" />;
}
