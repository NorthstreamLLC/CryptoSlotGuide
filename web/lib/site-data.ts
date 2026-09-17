/**
 * Single import point for the seed datasets + the counts derived from them.
 * See data/README.md — these are a real subset, not the full prototype
 * dataset, but every count/claim below is still computed, never literal.
 */
import ops from "@/data/ops.json";
import slots from "@/data/slots.json";
import slotTags from "@/data/slotTags.json";
import slotCatDefs from "@/data/slotCatDefs.json";
import liveCasinos from "@/data/liveCasinos.json";
import liveGames from "@/data/liveGames.json";
import providers from "@/data/providers.json";
import walletRows from "@/data/walletRows.json";
import exchangeRows from "@/data/exchangeRows.json";
import esportsTitles from "@/data/esportsTitles.json";
import guideRows from "@/data/guideRows.json";
import guideBodies from "@/data/guideBodies.json";
import houseGames from "@/data/houseGames.json";
import houseCasinoWide from "@/data/houseCasinoWide.json";
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
import fieldTestedOperators from "@/data/fieldTestedOperators.json";
import editoriallyAuditedOperators from "@/data/editoriallyAuditedOperators.json";
import onChainVolume from "@/data/onChainVolume.json";
import casinoSpecSheets from "@/data/casinoSpecSheets.json";
import casinoBonuses from "@/data/casinoBonuses.json";

import type {
  CoinDef,
  CoinsByOperator,
  Criterion,
  Editorial,
  EsportsTitle,
  FiatCasino,
  GuideBodies,
  GuideRow,
  HouseGame,
  LiveCasino,
  LiveGame,
  CasinoSpecSheet,
  CasinoBonusSheet,
  MethodStep,
  OnChainVolumeEntry,
  Operator,
  PredictionMarkets,
  Provider,
  ReviewBasis,
  RtpReading,
  Slot,
  SlotCategoryDef,
  SlotTags,
  TickerFact,
  WalletOrExchangeRow,
  WatchOperator,
} from "./types";
import { counts } from "./derived";

export const siteData = {
  ops: ops as Operator[],
  slots: slots as Slot[],
  slotTags: slotTags as SlotTags,
  slotCatDefs: slotCatDefs as SlotCategoryDef[],
  liveCasinos: liveCasinos as LiveCasino[],
  liveGames: liveGames as LiveGame[],
  providers: providers as Provider[],
  walletRows: walletRows as WalletOrExchangeRow[],
  exchangeRows: exchangeRows as WalletOrExchangeRow[],
  esportsTitles: esportsTitles as EsportsTitle[],
  guideRows: guideRows as GuideRow[],
  guideBodies: guideBodies as GuideBodies,
  houseGames: houseGames as HouseGame[],
  houseCasinoWide: houseCasinoWide as { casino: string; text: string; url: string }[],
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
  /** See lib/field-tested.ts and scripts/import-rtp-readings.mjs. */
  fieldTestedOperators: fieldTestedOperators as string[],
  /** See lib/field-tested.ts's isEditoriallyAudited(). */
  editoriallyAuditedOperators: editoriallyAuditedOperators as string[],
  /** See lib/onchain-volume.ts and scripts/import-onchain-volume.mjs. */
  onChainVolume: onChainVolume as OnChainVolumeEntry[],
  /** See lib/spec-sheet.ts. */
  casinoSpecSheets: casinoSpecSheets as CasinoSpecSheet[],
  /** See lib/casino-bonuses.ts. */
  casinoBonuses: casinoBonuses as CasinoBonusSheet[],
};

export const siteCounts = counts(siteData);
