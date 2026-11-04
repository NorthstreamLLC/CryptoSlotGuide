/**
 * Country law data on its own, for code that only needs country names and
 * statuses (prediction markets, the quiz). lib/legal.ts re-exports this and
 * adds the US, Europe and map-shape data; importing that from a client
 * component shipped ~460KB of JSON it never used.
 */
import legalWorld from "@/data/legal-world.json";
import type { Country } from "./legal-types";

export const COUNTRIES = legalWorld as Country[];
export const countryBy = (code: string) => COUNTRIES.find((c) => c.code.toLowerCase() === code.toLowerCase()) ?? null;
