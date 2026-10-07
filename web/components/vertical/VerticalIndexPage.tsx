import type React from "react";
import type { VerticalKind } from "@/lib/vertical-view";
import { getVerticalPage } from "@/lib/vertical-view";
import { VerticalIndexPageClient } from "@/components/vertical/VerticalIndexPageClient";
import { HeroDrift } from "@/components/ui/HeroDrift";
import { heroArtTiles } from "@/lib/slot-page";
import { siteData } from "@/lib/site-data";
import { logoFor } from "@/lib/logo";

/** The hero's drifting backdrop for each index: slot art, or the brands the page lists. */
function heroVisual(kind: VerticalKind): React.ReactNode {
  const logos = (slugs: string[]) => slugs.filter((s) => logoFor(s));
  switch (kind) {
    case "slots":
      return <HeroDrift art={heroArtTiles(48)} />;
    case "providers":
      return <HeroDrift logos={logos(siteData.providers.map((p) => p.slug))} />;
    case "wallets":
    case "exchanges":
      return <HeroDrift logos={logos([...siteData.walletRows, ...siteData.exchangeRows].map((r) => r.slug))} />;
    default:
      return null;
  }
}

/**
 * Server half of the section index (slots, studios, wallets, exchanges,
 * guides, sportsbooks): the page data is built here, from the full slot
 * catalogue, and only the finished rows go to the browser.
 */
export function VerticalIndexPage({ kind, tabIdx = 0, after }: { kind: VerticalKind; tabIdx?: number; after?: React.ReactNode }) {
  return <VerticalIndexPageClient kind={kind} tabIdx={tabIdx} vp={getVerticalPage(kind, tabIdx)} after={after} heroVisual={heroVisual(kind)} />;
}
