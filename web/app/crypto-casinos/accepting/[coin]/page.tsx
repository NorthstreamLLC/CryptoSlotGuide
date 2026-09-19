import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { COIN_PAGES, coinPage, casinosForCoin } from "@/lib/landing";
import { CasinoOfferList } from "@/components/casino/CasinoOfferList";
import { LandingShell, LinkCloud } from "@/components/landing/LandingShell";

export function generateStaticParams() {
  return COIN_PAGES.filter((c) => casinosForCoin(c.ticker).length >= 3).map((c) => ({ coin: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ coin: string }> }) {
  const { coin } = await params;
  const c = coinPage(coin);
  if (!c) return {};
  const n = casinosForCoin(c.ticker).length;
  return pageMetadata(`Best ${c.name} casinos (${n} that accept ${c.ticker})`, `${n} crypto casinos that accept ${c.name} deposits and withdrawals, compared on bonuses, withdrawal speed, wagering and minimum deposit. Coins taken from each casino's own cashier and terms.`, `/crypto-casinos/accepting/${coin}`);
}

export default async function Page({ params }: { params: Promise<{ coin: string }> }) {
  const { coin } = await params;
  const c = coinPage(coin);
  if (!c) notFound();
  const list = casinosForCoin(c.ticker);
  if (list.length < 3) notFound();
  const others = COIN_PAGES.filter((x) => x.slug !== c.slug && casinosForCoin(x.ticker).length >= 3);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Crypto casinos", path: "/crypto-casinos" }, { name: `${c.name} casinos`, path: `/crypto-casinos/accepting/${coin}` }])} />
      <LandingShell
        crumbs={[{ label: "Home", href: "/" }, { label: "Crypto casinos", href: "/crypto-casinos" }, { label: `${c.name} casinos` }]}
        eyebrow={`Casinos accepting ${c.ticker}`}
        title={`Best ${c.name} casinos`}
        intro={`${list.length} crypto casinos that take ${c.name} (${c.ticker}), compared on bonuses, withdrawal speed, wagering and minimum deposit. Accepted coins come from each casino's own cashier and terms.`}
        chips={[`${list.length} casinos accept ${c.ticker}`]}
      >
        <CasinoOfferList ops={list} />
        <LinkCloud title="Casinos by coin" items={others.map((x) => ({ href: `/crypto-casinos/accepting/${x.slug}`, label: `${x.name} casinos` }))} />
      </LandingShell>
    </>
  );
}
