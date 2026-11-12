import type React from "react";
import type { EntityView } from "@/lib/entity-view";
import { backLink, ctaLabel, editorialTake, nextStepsFor } from "@/lib/entity-view";
import { EntityReviewPageClient } from "@/components/entity/EntityReviewPageClient";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { CasinoSpecSheet } from "@/components/entity/CasinoSpecSheet";
import { CasinoBonuses } from "@/components/entity/CasinoBonuses";
import { SlotHeroArt } from "@/components/slots/SlotHeroArt";
import { withDemos } from "@/lib/slot-demos";

/**
 * Server half of the review page. The labels and links it needs come from
 * lib/entity-view.ts, which also loads the slot catalogue and the art
 * sources; computing them here keeps that data out of the browser bundle,
 * where it had been shipping 7 MB to every review page.
 */
export function EntityReviewPage({ e, review, lead, heroExtra }: { e: EntityView; review?: React.ReactNode; /** Server-rendered sections shown right after the verdict. */ lead?: React.ReactNode; /** Server-rendered block under the hero byline. */ heroExtra?: React.ReactNode }) {
  // A slot's hero is its own art with its figures on it, not a casino card.
  const glance = (label: string) => e.glance.find((r) => r.label === label)?.value ?? "";
  const back = backLink(e.type);
  const heroAside =
    e.type === "slot" && e.heroArt ? (
      <SlotHeroArt
        art={e.heroArt}
        name={e.name}
        studio={e.stats.find((x) => x.label === "Provider")?.value}
        chips={[
          { label: "RTP", value: glance("Published RTP") },
          { label: "Max win", value: glance("Max win") },
          { label: "Volatility", value: glance("Volatility") },
        ]}
        seed={e.slug}
        tint={e.tint}
        back={back}
      />
    ) : undefined;
  return (
    <EntityReviewPageClient
      // A studio's titles carry each game's free demo where we can open one.
      e={e.type === "provider" ? { ...e, tableRows: withDemos(e.tableRows) } : e}
      review={review}
      lead={lead}
      heroExtra={heroExtra}
      heroAside={heroAside}
      bonuses={e.type === "casino" ? <CasinoBonuses slug={e.slug} /> : null}
      specSheet={e.type === "casino" || e.type === "wallet" || e.type === "exchange" ? <CasinoSpecSheet slug={e.slug} kind={e.type === "wallet" ? "wallet" : e.type === "exchange" ? "exchange" : "casino"} /> : null}
      partner={e.type === "casino" ? null : <FeaturedPartner context={e.type === "slot" ? { kind: "slots" } : e.type === "market" ? { kind: "sports" } : { kind: "wallet" }} seed={e.slug} />}
      chrome={{ back: backLink(e.type), take: editorialTake(e.type, e.slug), cta: ctaLabel(e.type, e.name), next: nextStepsFor(e.type) }}
    />
  );
}
