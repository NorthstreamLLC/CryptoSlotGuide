import { VerticalIndexPage } from "@/components/vertical/VerticalIndexPage";
import { getVerticalPage } from "@/lib/vertical-view";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const vp = getVerticalPage("guides");
export const metadata = pageMetadata(vp.title, vp.sub, "/guides");

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: vp.title, path: "/guides" }])} />
      <VerticalIndexPage kind="guides" />
    </>
  );
}
