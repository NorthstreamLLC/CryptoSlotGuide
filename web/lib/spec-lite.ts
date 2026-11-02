/**
 * The spec-sheet lookups client components need, from
 * data/generated/client-facts.json (scripts/build-client-facts.mjs, run in
 * prebuild) rather than the full ~690KB casinoSpecSheets.json.
 */
import facts from "@/data/generated/client-facts.json";
import type { SpecFact } from "./types";

const F = facts as unknown as Record<string, { labels: string[]; vals: Record<string, Pick<SpecFact, "label" | "value" | "chips">>; wagering?: string }>;

/** Whether the spec sheet holds this fact, without its value or source. */
export const hasSpecFact = (slug: string, group: string, label: string) => !!F[slug]?.labels.includes(`${group}|${label}`);

/** A casino-card fact's value and chips (no source), for the labels the generator keeps. */
export const cardFact = (slug: string, group: string, label: string) => F[slug]?.vals[`${group}|${label}`] as SpecFact | undefined;

/** The cited "Bonus terms › Wagering" value, if there is one. */
export const wageringFact = (slug: string) => F[slug]?.wagering ?? null;
