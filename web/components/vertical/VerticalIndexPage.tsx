import type React from "react";
import type { VerticalKind } from "@/lib/vertical-view";
import { getVerticalPage } from "@/lib/vertical-view";
import { VerticalIndexPageClient } from "@/components/vertical/VerticalIndexPageClient";

/**
 * Server half of the section index (slots, studios, wallets, exchanges,
 * guides, sportsbooks): the page data is built here, from the full slot
 * catalogue, and only the finished rows go to the browser.
 */
export function VerticalIndexPage({ kind, tabIdx = 0, after }: { kind: VerticalKind; tabIdx?: number; after?: React.ReactNode }) {
  return <VerticalIndexPageClient kind={kind} tabIdx={tabIdx} vp={getVerticalPage(kind, tabIdx)} after={after} />;
}
