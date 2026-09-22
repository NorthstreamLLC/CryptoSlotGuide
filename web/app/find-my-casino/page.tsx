import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { quizCasinos, quizCountries, quizCoins } from "@/lib/quiz";
import { CasinoQuiz } from "@/components/quiz/CasinoQuiz";
import { LandingShell } from "@/components/landing/LandingShell";
import { NextSteps } from "@/components/layout/NextSteps";

export const metadata = pageMetadata(
  "Find your crypto casino in 3 questions",
  "Answer three questions — where you play from, which coin you use and what matters most — and see the crypto casinos whose own terms fit, with the reasons they matched.",
  "/find-my-casino"
);

export default function Page() {
  const casinos = quizCasinos();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Find my casino", path: "/find-my-casino" }])} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Find my casino" }]}
        eyebrow="Casino finder"
        title="Find your casino in 3 questions"
        intro={`Where you play from, the coin you want to use, and the one thing that matters most. We check those answers against ${casinos.length} casinos' own published terms — restricted countries, accepted coins, withdrawal times, wagering, rakeback and races — and show what fits.`}
      >
        <CasinoQuiz casinos={casinos} countries={quizCountries()} coins={quizCoins()} />
        <NextSteps
          steps={[
            { href: "/crypto-casinos", label: "Browse every casino", hint: "The full index, filterable by payout speed, KYC and wagering." },
            { href: "/legal", label: "Is it legal where you live?", hint: "45 countries and all 50 US states, from their own regulators." },
            { href: "/bonuses", label: "Compare the offers", hint: "Welcome bonuses and ongoing rewards with the wagering attached." },
          ]}
        />
      </LandingShell>
    </>
  );
}
