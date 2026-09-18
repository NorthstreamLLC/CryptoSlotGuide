import { BonusesPage } from "@/components/bonuses/BonusesPage";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMetadata(
  "Compare the best crypto casino bonuses",
  "Compare welcome bonuses, rakeback and cashback from every crypto casino we track: the headline offer, the wagering, the time limit and the max cashout, all from each casino's own bonus terms.",
  "/bonuses"
);

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Bonuses", path: "/bonuses" }])} />
      <BonusesPage />
    </>
  );
}
