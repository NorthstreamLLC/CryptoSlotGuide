import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { LegalHub } from "@/components/legal/LegalHub";

export const metadata = pageMetadata(
  "Is online gambling legal in your country? World map",
  "Click any country to see whether online casinos and sports betting are legal there, who regulates them, the minimum age and which casinos restrict players from it. Every status comes from the regulator's own pages.",
  "/legal"
);

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gambling laws", path: "/legal" }])} />
      <LegalHub />
    </>
  );
}
