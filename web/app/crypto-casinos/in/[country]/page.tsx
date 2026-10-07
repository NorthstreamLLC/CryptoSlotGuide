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
  // "Best crypto casinos in India" is the wrong headline for a country whose
  // own Act bans them and bars banks from processing the payments. The page
  // still exists — the question gets asked, and the honest answer is worth
  // ranking for — but it leads with the law rather than a recommendation.
  const outlawed = /not legal|banned|prohibit/i.test(c.onlineCasino ?? "");
  const title = outlawed
    ? `Crypto casinos and ${c.name}: online casinos are not legal here`
    : shut
    ? `Crypto casinos in ${c.name}: ${restricted} of ${total} refuse players`
    : `Best crypto casinos in ${c.name} (${n} that accept ${c.name} players)`;
  const desc = outlawed
    ? `Online casinos are not legal in ${c.name}. ${n} of the ${total} crypto casinos we track do not name ${c.name} on their restricted lists, which is not the same as it being lawful for you. What the law says, and who the regulator is.`
    : shut
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
  // Nine countries ban online casinos and are still accepted by most
  // operators. An operator not blocking you is not permission — its terms
  // simply do not name your country, and the law that applies to you is a
  // separate thing. Said plainly rather than left for the reader to infer
  // from a page that lists thirty places to play.
  const banned = /not legal|banned|prohibit/i.test(c.onlineCasino ?? "");
  /**
   * In a licensed market (GB, DE, NL, ES, IT, SE ...) a casino needs that
   * country's own licence, and advertising one without it is an offence for
   * the affiliate too. The list still shows who accepts players there, with
   * the facts and a link to each review — but no affiliate button: no
   * crypto casino listed here holds those licences.
   */
  const licensedMarket = /licensed market/i.test(c.onlineCasino ?? "");
  const listed = (ops: typeof accepts) => (licensedMarket ? ops.map((o) => ({ ...o, affiliate: false, signupUrl: undefined })) : ops);
  const one = accepts.length === 1;
  const others = countryPages().filter((x) => x.c.code !== c.code).sort((a, b) => a.c.name.localeCompare(b.c.name));

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Crypto casinos", path: "/crypto-casinos" }, { name: c.name, path: `/crypto-casinos/in/${country}` }])} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Crypto casinos", href: "/crypto-casinos" }, { label: c.name }]}
        eyebrow={`Crypto casinos · ${c.name}`}
        title={banned ? `Online casinos and ${c.name}: what the law says` : `Best crypto casinos in ${c.name}`}
        intro={
          <>
            {banned ? (
              <>
                <strong style={{ color: "#fff" }}>Online casinos are not legal in {c.name}.</strong> {restricted > 0 ? `${restricted} of the ${total} operators we track name ${c.name} on their own restricted lists; the rest simply do not mention it. ` : ""}
                Neither fact makes playing lawful where you are, so this page sets out the law rather than listing places to play.{" "}
              </>
            ) : mostlyShut ? (
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
        chips={banned ? [
          "Online casinos not legal here",
          ...(c.regulator?.name ? [`Regulator: ${c.regulator.name}`] : []),
          ...(c.minAge ? [`Minimum age ${c.minAge}`] : []),
        ] : [
          `${accepts.length} accept ${c.name} player${accepts.length === 1 ? "" : "s"}`,
          ...(restricted > 0 ? [`${restricted} refuse`] : []),
          ...(c.minAge ? [`Minimum age ${c.minAge}`] : []),
          ...(c.regulator?.name ? [`Regulator: ${c.regulator.name}`] : []),
        ]}
      >
        {/* Where almost everything we track refuses this country, the useful
            next step is not another of our pages — it is the national
            regulator, who publishes who IS licensed there. Saying so costs a
            click and is the honest answer; the alternative is a page that
            tells a reader they are shut out and stops. */}
        {banned && (
          <div style={{ margin: "0 0 18px", padding: "14px 16px", borderRadius: 14, background: "rgba(196,101,58,.08)", border: "1px solid rgba(196,101,58,.3)" }}>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#E8DCD6" }}>
              <strong style={{ color: "#fff" }}>We do not list operators for {c.name}.</strong> Some of the casinos we track would accept a sign-up from
              here, because their terms do not name {c.name} — but online casinos are not legal in {c.name}, and putting a list of them in front of you
              with sign-up links would be promoting something the law here prohibits. The law is{" "}
              <Link href={`/legal/${country}`} style={{ color: "#E0A98C" }}>
                on the law page
              </Link>
              {c.regulator?.name ? <>, enforced by the {c.regulator.name}</> : null}.
            </p>
          </div>
        )}
        {mostlyShut && c.onlineCasino === "licensed market" && c.regulator?.url && (
          <div style={{ margin: "0 0 18px", padding: "14px 16px", borderRadius: 14, background: "rgba(47,182,122,.06)", border: "1px solid rgba(47,182,122,.24)" }}>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#DCE5E9" }}>
              Online casinos are legal in {c.name} and licensed by the{" "}
              <a href={c.regulator.url} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#7BE0B8" }}>
                {c.regulator.name}
              </a>
              . The operators on this site mostly hold offshore licences and do not serve {c.name} — the regulator publishes the ones that do.
              {country === "gb" && (
                <>
                  {" "}
                  Every site on that register is on{" "}
                  <Link href="/licensed-casinos/gb" style={{ color: "#7BE0B8" }}>
                    our UK-licensed casinos page
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
        )}
        {!banned && <CasinoOfferList ops={listed(accepts)} />}
        {!banned && Object.keys(except).length > 0 && (
          <p style={{ margin: "12px 0 0", fontSize: 13.5, color: "#8DA0AA" }}>
            Regional exceptions: {Object.entries(except).map(([slug, regions]) => `${accepts.find((o) => o.slug === slug)?.name} excludes ${regions.join(", ")}`).join("; ")}.
          </p>
        )}
        {!banned && partial.length > 0 && (
          <>
            <h2 style={{ margin: "36px 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Also not restricting {c.name}, but check their terms</h2>
            <p style={{ margin: "0 0 14px", fontSize: 14, color: "#8DA0AA" }}>These casinos don&apos;t name {c.name}, but say their restricted list isn&apos;t complete.</p>
            <CasinoOfferList ops={listed(partial)} />
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
