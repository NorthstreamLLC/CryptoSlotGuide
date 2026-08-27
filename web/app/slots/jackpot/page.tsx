import { SlotCategoryPage } from "@/components/slots/SlotCategoryPage";
import { siteData } from "@/lib/site-data";
import { pageMetadata } from "@/lib/seo";

const cat = siteData.slotCatDefs.find((d) => d.tag === "jackpot")!;
export const metadata = pageMetadata(`${cat.label} slots`, cat.standfirst, "/slots/jackpot");

export default function Page() {
  return <SlotCategoryPage tag="jackpot" />;
}
