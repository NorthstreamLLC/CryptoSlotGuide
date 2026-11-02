import { CoinsPage } from "@/components/coins/CoinsPage";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMetadata(
  "Deposit and withdraw, coin by coin",
  "Which coins the operators on our index accept, credit time and confirmations as published, and what the network typically charges to move it.",
  "/coins"
);

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Coins", path: "/coins" }])} />
      <CoinsPage  partner={<FeaturedPartner context={{ kind: "general" }} />} />
    </>
  );
}
