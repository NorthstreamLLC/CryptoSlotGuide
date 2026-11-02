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

import slots from "@/data/slots.json";
import providers from "@/data/providers.json";
import walletRows from "@/data/walletRows.json";
import exchangeRows from "@/data/exchangeRows.json";
import esportsTitles from "@/data/esportsTitles.json";
import guideRows from "@/data/guideRows.json";
import watchOps from "@/data/watchOps.json";
import predMarkets from "@/data/predMarkets.json";
import rtpWatch from "@/data/rtpWatch.json";
import houseGames from "@/data/houseGames.json";
import slotTags from "@/data/slotTags.json";
import type { SlotTags, HouseGame, RtpReading, EsportsTitle, GuideRow, PredictionMarkets, Provider, Slot, WalletOrExchangeRow, WatchOperator } from "./types";

/** Everything SearchPage, RtpWatchPage and PredictionMarketsPage read: none of it needs the spec sheets. */
export const liteData = {
  ops: liteOps,
  slots: slots as Slot[],
  providers: providers as Provider[],
  walletRows: walletRows as WalletOrExchangeRow[],
  exchangeRows: exchangeRows as WalletOrExchangeRow[],
  esportsTitles: esportsTitles as EsportsTitle[],
  guideRows: guideRows as GuideRow[],
  watchOps: watchOps as WatchOperator[],
  rtpWatch: rtpWatch as RtpReading[],
  houseGames: houseGames as HouseGame[],
  slotTags: slotTags as SlotTags,
  predMarkets: {
    crypto: (predMarkets as PredictionMarkets).crypto.map(viaGo),
    fiat: (predMarkets as PredictionMarkets).fiat.map(viaGo),
  } as PredictionMarkets,
};
