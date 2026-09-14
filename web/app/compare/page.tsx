import { ComparePage } from "@/components/compare/ComparePage";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMetadata(
  "Compare operators side by side",
  "Pick any two or three operators — casinos, wallets, exchanges, sportsbooks — and compare their listed figures column by column.",
  "/compare"
);

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }])} />
      <ComparePage />
    </>
  );
}
