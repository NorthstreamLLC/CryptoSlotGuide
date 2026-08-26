/**
 * Single import point for the seed datasets + the counts derived from them.
 * See data/README.md — these are a real subset, not the full prototype
 * dataset, but every count/claim below is still computed, never literal.
 */
import ops from "@/data/ops.json";
import slots from "@/data/slots.json";
import liveCasinos from "@/data/liveCasinos.json";
import liveGames from "@/data/liveGames.json";
import providers from "@/data/providers.json";
import walletRows from "@/data/walletRows.json";
import exchangeRows from "@/data/exchangeRows.json";
import sportsMarkets from "@/data/sportsMarkets.json";
import esportsTitles from "@/data/esportsTitles.json";
import guideRows from "@/data/guideRows.json";
import houseGames from "@/data/houseGames.json";
import fiatCasinos from "@/data/fiatCasinos.json";
import predMarkets from "@/data/predMarkets.json";
import tickerFacts from "@/data/tickerFacts.json";
import coinDefs from "@/data/coinDefs.json";
import coinsBy from "@/data/coinsBy.json";
import rtpWatch from "@/data/rtpWatch.json";
import watchOps from "@/data/watchOps.json";
import editorial from "@/data/editorial.json";
import methodSteps from "@/data/methodSteps.json";
import criteria from "@/data/criteria.json";
import reviewBasis from "@/data/reviewBasis.json";

import type {
  CoinDef,
  CoinsByOperator,
  Criterion,
  Editorial,
  EsportsTitle,
  FiatCasino,
  GuideRow,
  HouseGame,
  LiveCasino,
  LiveGame,
  MethodStep,
  Operator,
  PredictionMarkets,
  Provider,
  ReviewBasis,
  RtpReading,
  Slot,
  SportsMarket,
  TickerFact,
  WalletOrExchangeRow,
  WatchOperator,
} from "./types";
import { counts } from "./derived";

export const siteData = {
  ops: ops as Operator[],
  slots: slots as Slot[],
  liveCasinos: liveCasinos as LiveCasino[],
  liveGames: liveGames as LiveGame[],
  providers: providers as Provider[],
  walletRows: walletRows as WalletOrExchangeRow[],
  exchangeRows: exchangeRows as WalletOrExchangeRow[],
  sportsMarkets: sportsMarkets as SportsMarket[],
  esportsTitles: esportsTitles as EsportsTitle[],
  guideRows: guideRows as GuideRow[],
  houseGames: houseGames as HouseGame[],
  fiatCasinos: fiatCasinos as FiatCasino[],
  predMarkets: predMarkets as PredictionMarkets,
  tickerFacts: tickerFacts as TickerFact[],
  coinDefs: coinDefs as CoinDef[],
  coinsBy: coinsBy as CoinsByOperator,
  rtpWatch: rtpWatch as RtpReading[],
  watchOps: watchOps as WatchOperator[],
  editorial: editorial as Editorial,
  methodSteps: methodSteps as MethodStep[],
  criteria: criteria as Criterion[],
  reviewBasis: reviewBasis as ReviewBasis[],
};

export const siteCounts = counts(siteData);
