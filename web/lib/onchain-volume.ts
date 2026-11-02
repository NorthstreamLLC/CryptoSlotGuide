/**
 * Third-party on-chain deposit-volume citations — see lib/types.ts's
 * OnChainVolumeEntry and scripts/import-onchain-volume.mjs. This is a
 * fourth, distinct kind of sourcing alongside the field-tested /
 * community-reported / editorial tiers in data/criteria.json: a named
 * platform's own attribution of wallet activity to an operator, not
 * something CryptoSlotGuide measured or verified itself. Backed by
 * data/onChainVolume.json, which only ever holds an operator once real
 * figures have actually been checked against a live source — never
 * placeholder numbers, per the same discipline as fieldTestedOperators.json.
 */
// The JSON directly, not siteData: this runs in the review page's client bundle.
import onChainVolume from "@/data/onChainVolume.json";
import type { OnChainVolumeEntry } from "./types";

export function getOnChainVolume(slug: string) {
  return (onChainVolume as OnChainVolumeEntry[]).find((e) => e.operatorSlug === slug);
}
