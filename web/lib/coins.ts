import { siteData } from "./site-data";
import type { CoinDef } from "./types";

/** A coin's page: /coins/bitcoin, /coins/tether, /coins/xrp — the name, which is what people search for. */
export const coinSlug = (c: Pick<CoinDef, "name">) => c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
export const coinHref = (c: Pick<CoinDef, "name">) => `/coins/${coinSlug(c)}`;
export const coinBySlug = (slug: string): CoinDef | undefined => siteData.coinDefs.find((c) => coinSlug(c) === slug);
