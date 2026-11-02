/**
 * The small slices of site data that client components need, imported from
 * the JSON directly. lib/site-data pulls in every slot, guide, provider and
 * the full spec sheets (~800KB), so a "use client" file importing it ships
 * all of that to the browser. Same shapes as siteData's fields.
 */
import ops from "@/data/ops.json";
import coinDefs from "@/data/coinDefs.json";
import coinsBy from "@/data/coinsBy.json";
import { viaGo } from "./outbound";
import type { CoinDef, CoinsByOperator, Operator } from "./types";

export const liteOps = (ops as Operator[]).map(viaGo);
export const liteCoinDefs = coinDefs as CoinDef[];
export const liteCoinsBy = coinsBy as CoinsByOperator;
