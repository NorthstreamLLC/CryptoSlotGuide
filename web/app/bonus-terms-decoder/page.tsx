import { LandingShell, LinkCloud } from "@/components/landing/LandingShell";
import { BonusDecoder } from "@/components/tools/BonusDecoder";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Bonus Terms Decoder", "Understand bonus wagering, expiry, maximum bets and withdrawal caps using your own offer terms.", "/bonus-terms-decoder");
export default function Page() { return <LandingShell crumbs={[{label:"Home",href:"/"},{label:"Bonus Terms Decoder"}]} eyebrow="Understand the terms" title="Bonus Terms Decoder" intro="Turn the small print into a transparent calculation. No casino connection, deposit or personal information required; inputs stay in this page’s memory."><BonusDecoder/><LinkCloud title="Check the offer in context" items={[{label:"Bonus comparisons",href:"/bonuses"},{label:"Casino reviews",href:"/crypto-casinos"},{label:"Casino ChangeWatch",href:"/casino-changewatch"}]}/></LandingShell>; }
