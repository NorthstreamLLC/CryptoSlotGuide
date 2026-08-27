import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { getVerticalPage } from "@/lib/vertical-view";
import { pageMetadata } from "@/lib/seo";

const vp = getVerticalPage("providers");
export const metadata = pageMetadata(vp.title, vp.sub, "/providers");

export default function Page() {
  return <VerticalIndexPage kind="providers" />;
}
