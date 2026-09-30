import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { countryBy } from "@/lib/legal";
import { countryPages, casinosForCountry } from "@/lib/landing";
import { CasinoOfferList } from "@/components/casino/CasinoOfferList";
import { LandingShell, LinkCloud } from "@/components/landing/LandingShell";
import { NextSteps } from "@/components/layout/NextSteps";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";

export function generateStaticParams() {
  return countryPages().map(({ c }) => ({ country: c.code.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = countryBy(country);
  if (!c) return {};
  const { accepts, restricted, total } = casinosForCountry(c.code);
  const n = accepts.length;
  // Where most operators refuse the country, the title and description say so
  // — "1 that accept United Kingdom players" is both bad grammar and the
  // least useful sentence we could put in a search result for that query.
  const shut = restricted > n;
  const title = shut
    ? `Crypto casinos in ${c.name}: ${restricted} of ${total} refuse players`
    : `Best crypto casinos in ${c.name} (${n} that accept ${c.name} players)`;
  const desc = shut
    ? `${restricted} of the ${total} crypto casinos we track name ${c.name} on their own restricted list. ${n === 1 ? "One accepts" : `${n} accept`} players from ${c.name} — which, on what terms, and what ${c.name}'s gambling law says.`
    : `${n} crypto casinos whose own terms accept players from ${c.name}, compared on bonuses, withdrawal speed and wagering, plus what ${c.name}'s gambling law says.`;
  return pageMetadata(title, desc, `/crypto-casinos/in/${country}`);
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = countryBy(country);
  const page = countryPages().find((x) => x.c.code.toLowerCase() === country);
  if (!c || !page) notFound();
  const { accepts, partial, restricted, total, except } = casinosForCountry(c.code);
  // Where most operators turn this country away, that is the story, and
  // burying it under "3 casinos accept you" would waste the page. The
  // United Kingdom is the extreme: one of 46 accepts, 39 refuse by name.
  const mostlyShut = restricted > accepts.length;
  const one = accepts.length === 1;
  const others = countryPages().filter((x) => x.c.code !== c.code).sort((a, b) => a.c.name.localeCompare(b.c.name));

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Crypto casinos", path: "/crypto-casinos" }, { name: c.name, path: `/crypto-casinos/in/${country}` }])} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Crypto casinos", href: "/crypto-casinos" }, { label: c.name }]}
        eyebrow={`Crypto casinos · ${c.name}`}
        title={`Best crypto casinos in ${c.name}`}
        intro={
          <>
            {mostlyShut ? (
              <>
                <strong style={{ color: "#fff" }}>
                  {restricted} of the {total} crypto casinos we track name {c.name} on their own restricted list.
                </strong>{" "}
                {one ? "One accepts" : `${accepts.length} accept`} players from {c.name} — {one ? "it is" : "they are"} below, with the terms{" "}
                {one ? "it is" : "they are"} offering. Online casinos in {c.name}: <strong style={{ color: "#fff" }}>{c.onlineCasino}</strong>.{" "}
              </>
            ) : (
              <>
                {accepts.length} crypto casinos whose own terms accept players from {c.name}, compared on bonuses, withdrawal speed and wagering. Online
                casinos in {c.name}: <strong style={{ color: "#fff" }}>{c.onlineCasino}</strong>.{" "}
              </>
            )}
            <Link href={`/legal/${country}`} style={{ color: "#5FE3E8" }}>What {c.name}&apos;s gambling law says →</Link>
          </>
        }
        chips={[
          `${accepts.length} accept ${c.name} player${accepts.length === 1 ? "" : "s"}`,
          ...(restricted > 0 ? [`${restricted} refuse`] : []),
          ...(c.minAge ? [`Minimum age ${c.minAge}`] : []),
          ...(c.regulator?.name ? [`Regulator: ${c.regulator.name}`] : []),
        ]}
      >
        <CasinoOfferList ops={accepts} />
        {Object.keys(except).length > 0 && (
          <p style={{ margin: "12px 0 0", fontSize: 13.5, color: "#8DA0AA" }}>
            Regional exceptions: {Object.entries(except).map(([slug, regions]) => `${accepts.find((o) => o.slug === slug)?.name} excludes ${regions.join(", ")}`).join("; ")}.
          </p>
        )}
        {partial.length > 0 && (
          <>
            <h2 style={{ margin: "36px 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Also not restricting {c.name}, but check their terms</h2>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "#8DA0AA" }}>These casinos don&apos;t name {c.name}, but say their restricted list isn&apos;t complete.</p>
            <CasinoOfferList ops={partial} />
          </>
        )}
        <p style={{ margin: "22px 0 0", maxWidth: "86ch", fontSize: 12.5, lineHeight: 1.6, color: "#8E9CA5" }}>
          Based on each casino&apos;s own restricted-countries list, not legal advice. Gambling law in {c.name} applies to you as a player; check it before you sign up.
        </p>
        <LinkCloud title="Crypto casinos in other countries" items={others.map((x) => ({ href: `/crypto-casinos/in/${x.c.code.toLowerCase()}`, label: x.c.name }))} />
        <FeaturedPartner context={{ kind: "general" }} country={c.code} />
        <NextSteps
          steps={[
            { href: `/legal/${c.code.toLowerCase()}`, label: `Is it legal in ${c.name}?`, hint: "The regulator, the licensing model and the minimum age." },
            { href: "/bonuses", label: "Every bonus", hint: "Welcome offers and rewards with the wagering each one carries." },
            { href: "/find-my-casino", label: "Find my casino", hint: "Three questions, matched against each casino's own terms." },
          ]}
        />
      </LandingShell>
    </>
  );
}
