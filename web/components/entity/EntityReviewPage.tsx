import type React from "react";
import type { EntityView } from "@/lib/entity-view";
import { backLink, ctaLabel, editorialTake, nextStepsFor } from "@/lib/entity-view";
import { EntityReviewPageClient } from "@/components/entity/EntityReviewPageClient";

/**
 * Server half of the review page. The labels and links it needs come from
 * lib/entity-view.ts, which also loads the slot catalogue and the art
 * sources; computing them here keeps that data out of the browser bundle,
 * where it had been shipping 7 MB to every review page.
 */
export function EntityReviewPage({ e, review }: { e: EntityView; review?: React.ReactNode }) {
  return (
    <EntityReviewPageClient
      e={e}
      review={review}
      chrome={{ back: backLink(e.type), take: editorialTake(e.type, e.slug), cta: ctaLabel(e.type, e.name), next: nextStepsFor(e.type) }}
    />
  );
}
