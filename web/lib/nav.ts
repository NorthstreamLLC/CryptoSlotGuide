/**
 * Mega-menu structure — ported directly from `megaDefs` / `navTabs` in
 * CryptoSlotGuide.dc.html (search that file for `const megaDefs =` to
 * cross-check). Labels that embed a count (e.g. "All 47 crypto casinos")
 * are built from live SiteCounts, exactly like the prototype's `C.casinos`
 * etc. — never hardcoded, so a data change updates the copy automatically.
 */
import type { SiteCounts } from "./derived";
import { siteData } from "./site-data";
import { topSlotEntries, slotArtBySlug } from "./slot-page";
import { sweepsSorted } from "./sweeps";
import { inHouseOrder } from "./house-order";
import { houseThumb } from "./house-thumbs";
import { venuesInOrder, venueHref, openCount, predCountryHref, countryNameOf } from "./prediction-markets";
import { raceSlugs, raceFor } from "./races";
import { countryPages, casinosForCountry } from "./landing";
import { TOP_STUDIOS } from "./top-studios";
import { US_STATES, EUROPE_SHAPES, toneOf } from "./legal";
import { fiatMarkets, fiatMarketFor, fiatHref, EUROPE_FIAT, regionMarkets } from "./fiat";

/** The countries the Europe map draws, for the Europe column. */
const EUROPE_CODES = new Set(EUROPE_SHAPES.map((sh) => sh.code).filter((c): c is string => !!c));

type Op = (typeof siteData.ops)[number];

/** Each coin's own mark, where we ship one (public/assets/coins). */
const COIN_MARKS: Record<string, string> = { BTC: "/assets/coins/btc.png", DOGE: "/assets/coins/doge.png", ETH: "/assets/coins/eth.svg", LTC: "/assets/coins/ltc.svg", SOL: "/assets/coins/sol.png", TRX: "/assets/coins/trx.svg", USDT: "/assets/coins/usdt.svg", XRP: "/assets/coins/xrp.svg" };

/** Our top casino, for sections whose reader is choosing where to play. */
const topCasinoFeature = (kicker: string): NavFeature | undefined => casinoFeature(inHouseOrder(siteData.ops)[0], kicker);

/** A casino as a menu pick: our recommendation for a country section. */
const casinoFeature = (o: Op | undefined, kicker: string): NavFeature | undefined =>
  o ? { brand: o.slug, kicker, title: o.name, name: o.name, sub: o.bonusShort ?? o.bonus, href: `/casinos/${o.slug}`, cta: "Read the review", visit: o.affiliate && o.signupUrl ? o.signupUrl : undefined } : undefined;

/** The first five, as a column of marks. */
const casinoLinks = (ops: Op[]): NavLink[] => ops.slice(0, 5).map((o) => ({ label: o.name, href: `/casinos/${o.slug}`, brand: o.slug }));

/** Casinos in house order that accept players from a country, by their own terms. */
const acceptingIn = (code: string): Op[] => inHouseOrder(casinosForCountry(code).accepts);

/**
 * Casinos for Europe as a whole: those whose terms accept at least half of the
 * European countries we cover, in house order. No single country stands in
 * for the continent, and most of the big names refuse the UK, France and the
 * Netherlands.
 */
const acceptingEurope = (): Op[] => {
  const codes = [...countryPages()].map(({ c }) => c.code).filter((c) => EUROPE_CODES.has(c));
  const n = new Map<string, number>();
  for (const code of codes) for (const o of casinosForCountry(code).accepts) n.set(o.slug, (n.get(o.slug) ?? 0) + 1);
  return inHouseOrder(siteData.ops.filter((o) => (n.get(o.slug) ?? 0) * 2 >= codes.length));
};

/** US players: no crypto casino on our list accepts them, so the pick is a sweepstakes casino. */
const sweepsFeature = (kicker: string): NavFeature | undefined => {
  const sw = sweepsSorted()[0];
  return sw ? { brand: sw.slug, kicker, title: sw.name, name: sw.name, sub: sw.offer, href: `/sweepstakes-casinos/${sw.slug}`, cta: "Read the review", visit: sw.affiliate && sw.signupUrl ? sw.signupUrl : undefined } : undefined;
};
const sweepsLinks = (): NavLink[] => sweepsSorted().slice(0, 5).map((x) => ({ label: x.name, href: `/sweepstakes-casinos/${x.slug}`, brand: x.slug }));
import { flagSrc } from "./flags";
import { coinHref } from "./coins";
import { sportsOffers, sportsOnlyRaces, sportsBoosts, sportsbookHref, sportsPick } from "./sports";
import { rankedBrands } from "./us-brands";
import { kevinLive, KEVIN_PATH } from "./kevin-promo";
import { promoHref } from "./promo-pages";

const slotCatLabels = siteData.slotCatDefs.map((d) => ({ tag: d.tag, label: d.label }));

/**
 * The slots the menu features.
 *
 * Ranking purely on how well-documented a page is put Reactoonz first — Play'n
 * GO publishes five RTP configurations for it — but it is a 2017 title nobody
 * is searching for, and a menu is a shop window rather than a completeness
 * exercise. So the picks are editorial, by slug, and the data ranking below is
 * only the fallback for anything not named here.
 *
 * Swap a name and the menu changes; a slug that no longer exists is skipped
 * rather than rendering a dead link.
 */
/**
 * The menu's slot column is the editorial top list, first five, in its order.
 *
 * It used to be a hardcoded five plus a fallback that sorted the review set on
 * how much RTP data we held — a factual sort standing in for a recommendation,
 * which is how a 2017 game ended up being pitched. lib/top-slots.ts is the one
 * place that list lives now.
 */
const featuredSlots = topSlotEntries().slice(0, 5);

export interface NavLink {
  label: string;
  href: string;
  dot?: string;
  /**
   * Brand slug, where the link points at a named operator. The menu then shows
   * its mark instead of a bare line of text — in a column of five casino names
   * the logo is what a reader actually recognises.
   */
  brand?: string;
  /**
   * Art for the link, where the thing linked is a game rather than a brand.
   * A slot has no mark; it has a tile, and the tile is what a reader
   * recognises in a column of five names.
   */
  image?: string;
  /** A short second line under the label, e.g. the race a casino runs. */
  note?: string;
}

export interface NavSection {
  mono: string;
  /** An image for the rail instead of the mono glyph — a flag, where the emoji would render as letters on Windows. */
  icon?: string;
  label: string;
  tint: string;
  href: string;
  columns: NavColumn[];
  /** A pick shown as a small card before the columns: our recommendation for this section. */
  feature?: NavFeature;
}

export interface NavFeature {
  /** Operator slug, for its mark. */
  brand: string;
  kicker: string;
  title: string;
  /** One line from the operator's own facts. */
  sub: string;
  href: string;
  cta: string;
  /** Affiliate sign-up link, where we hold one: the card's "Visit" button. */
  visit?: string;
  /** Brand name for the buttons ("Visit Roobet", "Full Roobet review"). */
  name?: string;
}

export interface NavColumn {
  title: string;
  links: NavLink[];
}

export interface NavTab {
  key: "gambling" | "where" | "licensed" | "casinos" | "bonuses" | "slots" | "countries" | "legal" | "sports" | "predict" | "crypto" | "more";
  label: string;
  sections: NavSection[];
  /** The tab's own page: clicking the label goes there; hovering opens the menu. */
  href?: string;
}

function rawNavTabs(c: SiteCounts): NavTab[] {
  return [
    {
      key: "gambling",
      label: "Gambling",
      sections: [
        {
          mono: "♠️",
          label: "Crypto casinos",
          tint: "#5FE3E8",
          href: "/crypto-casinos",
          feature: (() => {
            return casinoFeature(siteData.ops.find((x) => x.featured), "Our top casino");
          })(),
          columns: [
            {
              title: "Browse",
              links: [
                { label: `All ${c.casinos} crypto casinos`, href: "/crypto-casinos" },
                { label: "No-KYC casinos", href: "/crypto-casinos/no-kyc" },
                { label: "Fastest payouts", href: "/fastest-payouts" },
                { label: "Lowest wagering bonuses", href: "/lowest-wagering" },
                { label: "Compare side by side", href: "/compare" },
                { label: "Find my casino", href: "/find-my-casino" },
                { label: "Bonus Terms Decoder", href: "/bonus-terms-decoder" },
                { label: "Casino ChangeWatch", href: "/casino-changewatch" },
                { label: "VIP calculator", href: "/vip-calculator" },
              ],
            },
            {
              // Three columns of marks: the casinos, in house order, which is
              // the order every list on the site falls back to and the
              // disclosure strip covers. A column of five names is text; a
              // column of five marks is what a reader recognises.
              title: "Top casino profiles",
              links: inHouseOrder(siteData.ops)
                .slice(0, 5)
                .map((o) => ({ label: o.name, href: `/casinos/${o.slug}`, brand: o.slug })),
            },
            {
              title: "Best casino bonuses",
              links: inHouseOrder(siteData.ops)
                .slice(0, 5)
                .map((o) => ({ label: o.name, href: `/bonuses#${o.slug}`, brand: o.slug })),
            },
            {
              // Same order the races page uses: prize money a month, from each
              // casino's own promotions pages.
              title: "Biggest races",
              links: raceSlugs()
                .slice(0, 5)
                .map((slug) => siteData.ops.find((o) => o.slug === slug))
                .filter((o): o is NonNullable<typeof o> => !!o)
                .map((o) => ({ label: o.name, href: `/races#${o.slug}`, brand: o.slug, note: raceFor(o.slug)?.label })),
            },
          ],
        },
        {
          mono: "🎰",
          label: "Slots & RTP",
          feature: topCasinoFeature("Where we play slots"),
          tint: "#DA9877",
          href: "/slots",
          columns: [
            {
              title: "Slots",
              links: [
                { label: "Our top slots", href: "/slots" },
                { label: "Best crypto slot sites", href: "/slots/best-crypto-slot-sites" },
                { label: "Slot database", href: "/slots/database" },
                { label: "Slots by studio", href: "/providers" },
                { label: "How casino RTP versions work", href: "/guides/how-casino-rtp-versions-work" },
              ],
            },
            {
              title: "Our top slots",
              links: featuredSlots.map((s) => ({ label: s.name, href: s.href, image: slotArtBySlug(s.slug) ?? undefined })),
            },
            {
              title: "By mechanic",
              links: slotCatLabels.map(({ tag, label }) => ({
                label: `${label} slots`,
                href: `/slots/${tag}`,
              })),
            },
          ],
        },
        {
          mono: "🎮",
          label: "Game providers",
          feature: topCasinoFeature("Where we play slots"),
          tint: "#8FA5C9",
          href: "/providers",
          columns: [
            {
              title: "Studios",
              links: [
                { label: `All ${c.providers} provider reviews`, href: "/providers" },
                { label: "Studio licence map", href: "/providers/licences" },
                { label: "Slots by provider", href: "/slots" },
                { label: "How casino RTP versions work", href: "/guides/how-casino-rtp-versions-work" },
              ],
            },
            {
              title: "Studio profiles",
              links: TOP_STUDIOS.map((s) => siteData.providers.find((p) => p.slug === s))
                .filter((p): p is NonNullable<typeof p> => !!p)
                .map((p) => ({ label: p.name, href: `/providers/${p.slug}`, brand: p.slug })),
            },
          ],
        },
        {
          mono: "🎲",
          label: "House games",
          feature: topCasinoFeature("Our top casino"),
          tint: "#7BE0B8",
          href: "/house-games",
          columns: [
            {
              title: "How to play",
              links: ["Dice", "Crash", "Plinko", "Mines"].map((name) => ({
                label: name,
                href: `/house-games/${slug(name)}`,
                image: houseThumb(slug(name)),
              })),
            },
            {
              title: "More originals",
              links: ["Limbo", "Keno", "Hi-Lo", "Wheel"].map((name) => ({
                label: name,
                href: `/house-games/${slug(name)}`,
                image: houseThumb(slug(name)),
              })),
            },
          ],
        },
        {
          mono: "🎁",
          label: "Bonuses",
          feature: topCasinoFeature("Our top bonus"),
          tint: "#C7A45C",
          href: "/bonuses",
          columns: [
            {
              title: "Offers",
              links: [
                { label: "All tracked bonuses", href: "/bonuses" },
                { label: "Casinos by lowest wagering", href: "/lowest-wagering" },
                { label: "No-KYC casinos", href: "/crypto-casinos/no-kyc" },
              ],
            },
            {
              title: "Understand the terms",
              links: [
                { label: "Reading wagering requirements", href: "/guides/reading-wagering-requirements" },
                { label: "KYC thresholds, explained", href: "/guides/kyc-thresholds-explained" },
                { label: "How we review", href: "/how-we-rate" },
              ],
            },
          ],
        },
        {
          mono: "📘",
          label: "Guides",
          feature: topCasinoFeature("Our top casino"),
          tint: "#9AAE5E",
          href: "/guides",
          columns: [
            {
              title: "How to play",
              links: [
                { label: "How to play blackjack", href: "/how-to/blackjack" },
                { label: "How to play roulette", href: "/how-to/roulette" },
                { label: "How to play baccarat", href: "/how-to/baccarat" },
                { label: "Provably fair originals", href: "/house-games" },
              ],
            },
            {
              title: "Most read",
              links: siteData.guideRows.slice(0, 4).map((g) => ({ label: g.title, href: `/guides/${g.slug}` })),
            },
            {
              title: "More guides",
              links: siteData.guideRows.slice(4, 8).map((g) => ({ label: g.title, href: `/guides/${g.slug}` })),
            },
          ],
        },
      ],
    },
    {
      // Crypto only: which crypto casinos take players from each country, and
      // the law there. The licensed (fiat) side has its own tab below — the
      // two used to share this one, unlabelled, with the same law pages
      // linked from three sections.
      key: "where",
      label: "Crypto casinos by country",
      sections: [
        {
          mono: "🌍",
          label: "Worldwide",
          tint: "#7BE0B8",
          href: "/legal",
          feature: casinoFeature(inHouseOrder(siteData.ops)[0], "Our top casino"),
          columns: [
            { title: "Top crypto casinos", links: casinoLinks(inHouseOrder(siteData.ops)) },
            {
              // Countries where the most crypto casinos say, in their own
              // terms, that they will take you. Counted, not chosen — except
              // that a country whose law bans online casinos is left out,
              // whatever the operators' terms omit.
              title: "Most crypto casinos accept",
              links: [...countryPages()]
                .filter(({ c }) => !/not legal|banned|prohibit/i.test(c.onlineCasino ?? ""))
                .sort((a, b) => b.accepts.length - a.accepts.length || a.c.name.localeCompare(b.c.name))
                .slice(0, 7)
                .map(({ c, accepts }) => ({ label: `${c.name} · ${accepts.length}`, image: flagSrc(c.code) ?? undefined, href: `/crypto-casinos/in/${c.code.toLowerCase()}` })),
            },
            {
              title: "The law",
              links: [
                { label: "Gambling law, every country", href: "/legal" },
                { label: "All crypto casinos", href: "/crypto-casinos" },
                { label: "By coin", href: "/crypto-casinos/accepting/bitcoin" },
              ],
            },
          ],
        },
        {
          mono: "EU",
          icon: flagSrc("EU") ?? undefined,
          label: "Europe",
          tint: "#7BB8E0",
          href: "/legal/europe",
          feature: casinoFeature(acceptingEurope()[0], "Our top pick for Europe"),
          columns: [
            { title: "Top casinos for Europe", links: casinoLinks(acceptingEurope()) },
            {
              title: "Most crypto casinos accept",
              links: [...countryPages()]
                .filter(({ c }) => EUROPE_CODES.has(c.code) && !/not legal|banned|prohibit/i.test(c.onlineCasino ?? ""))
                .sort((a, b) => b.accepts.length - a.accepts.length || a.c.name.localeCompare(b.c.name))
                .slice(0, 7)
                .map(({ c, accepts }) => ({ label: `${c.name} · ${accepts.length}`, image: flagSrc(c.code) ?? undefined, href: `/crypto-casinos/in/${c.code.toLowerCase()}` })),
            },
            {
              title: "The law",
              links: [
                { label: "Europe, country by country", href: "/legal/europe" },
                { label: "UK gambling law", href: "/legal/gb" },
              ],
            },
          ],
        },
        {
          mono: "CA",
          icon: flagSrc("CA") ?? undefined,
          label: "Canada",
          tint: "#E07B7B",
          href: "/crypto-casinos/in/ca",
          feature: casinoFeature(acceptingIn("CA")[0], "Our top pick for Canada"),
          columns: [
            { title: "Top casinos for Canada", links: casinoLinks(acceptingIn("CA")) },
            {
              title: "Crypto casinos",
              links: [{ label: `${casinosForCountry("CA").accepts.length} accept Canada`, href: "/crypto-casinos/in/ca", image: flagSrc("CA") ?? undefined }],
            },
            {
              title: "The law",
              links: [
                { label: "Canada by province", href: "/legal/canada" },
                { label: "Canadian gambling law", href: "/legal/ca" },
              ],
            },
          ],
        },
        {
          mono: "US",
          icon: flagSrc("US") ?? undefined,
          label: "United States",
          tint: "#7BE0B8",
          href: "/legal/us",
          feature: sweepsFeature("Our top pick for the US"),
          columns: [
            { title: "Top sweepstakes casinos", links: sweepsLinks() },
            {
              // Most crypto casinos refuse US players in their own terms; the
              // count says so rather than leaving the section looking empty.
              title: "Crypto casinos",
              links: [
                { label: `${casinosForCountry("US").restricted} of ${casinosForCountry("US").total} restrict the US`, href: "/legal/us", image: flagSrc("US") ?? undefined },
                { label: "Sweepstakes casinos instead", href: "/sweepstakes-casinos" },
              ],
            },
            {
              title: "The law",
              links: [{ label: "US state by state", href: "/legal/us" }],
            },
          ],
        },
      ],
    },
    {
      key: "sports",
      label: "Sports betting",
      sections: [
        {
          mono: "🏆",
          label: "Sportsbooks",
          tint: "#57B98C",
          href: "/sportsbooks",
          feature: (() => {
            const p = sportsPick();
            return p
              ? { brand: p.slug, kicker: "Our sports pick", title: `${p.name} sportsbook`, name: p.name, sub: p.headline, href: sportsbookHref(p.slug), cta: "View sportsbook", visit: p.signupUrl }
              : undefined;
          })(),
          columns: [
            {
              title: "Browse",
              links: [
                { label: `All ${c.books} sportsbooks`, href: "/sportsbooks" },
                { label: "Compare side by side", href: "/compare" },
                { label: "Sportsbook margin, explained", href: "/guides/sportsbook-margin-explained" },
              ],
            },
            // Ranked, and each link goes to the book's sportsbook page rather
            // than its casino review (lib/sports.ts).
            {
              title: "Top welcome bonus",
              links: sportsOffers()
                .slice(0, 4)
                .map((o) => ({ label: o.name, href: sportsbookHref(o.slug), brand: o.slug })),
            },
            {
              // Sports-only races; the casino-wide ones sports bets count
              // toward are on /sportsbooks, labelled as what they are.
              title: "Sports races",
              links: sportsOnlyRaces()
                .slice(0, 4)
                .map((r) => {
                  // "$10,000 race", "$25,000 raffle": the prize and what kind it is.
                  const amount = (r.headline.match(/\$[\d,]+/) ?? [""])[0];
                  const kind = /raffle/i.test(r.headline) ? "raffle" : /tournament/i.test(r.headline) ? "tournament" : "race";
                  return { label: `${r.name} · ${amount} ${kind}`.trim(), href: sportsbookHref(r.slug), brand: r.slug };
                }),
            },
            {
              title: "Boosts & early payout",
              links: sportsBoosts()
                .slice(0, 4)
                .map((b) => ({ label: `${b.name} · ${b.headline}`, href: sportsbookHref(b.slug), brand: b.slug })),
            },
          ],
        },
        {
          mono: "🕹️",
          label: "Esports",
          tint: "#C4795A",
          href: "/sportsbooks?tab=2",
          columns: [
            {
              title: "By title",
              links: siteData.esportsTitles.slice(0, 4).map((t) => ({ label: t.name, href: `/betting/${slug(t.name)}` })),
            },
            {
              title: "Where to bet it",
              links: [
                { label: "All esports titles", href: "/sportsbooks?tab=2" },
                { label: "Casinos with esports", href: "/esports-casinos" },
                { label: "Sportsbook margin, explained", href: "/guides/sportsbook-margin-explained" },
                { label: "Compare books", href: "/compare" },
              ],
            },
          ],
        },
      ],
    },
    {
      key: "predict",
      label: "Prediction markets",
      sections: [
        {
          mono: "🔗",
          label: "Crypto-settled",
          tint: "#00C2CC",
          href: "/prediction-markets",
          columns: [
            {
              title: "Venues",
              links: venuesInOrder("crypto").map((v) => ({ label: v.name, href: venueHref(v.slug), brand: v.slug })),
            },
            {
              title: "By country",
              links: ["US", "GB", "CA", "DE", "AU", "BR"].map((code) => ({
                label: `${countryNameOf(code)} · ${openCount("crypto", code)}/${venuesInOrder("crypto").length}`,
                href: predCountryHref(code),
                image: flagSrc(code) ?? undefined,
              })),
            },
            {
              title: "What to know",
              links: [
                { label: "All crypto-settled venues", href: "/prediction-markets" },
                { label: "Every country", href: "/prediction-markets#by-country" },
                { label: "Wallets to trade from", href: "/wallets" },
                { label: "Coins and networks", href: "/coins" },
              ],
            },
          ],
        },
        {
          mono: "🏛️",
          label: "Regulated fiat",
          tint: "#6BC7FF",
          href: "/prediction-markets/regulated",
          columns: [
            {
              title: "Venues",
              links: venuesInOrder("fiat").map((v) => ({ label: v.name, href: venueHref(v.slug), brand: v.slug })),
            },
            {
              title: "What to know",
              links: [
                { label: "All regulated venues", href: "/prediction-markets/regulated" },
                { label: "Kalshi outside the US", href: `${venueHref("kalshi")}#availability` },
                { label: "Exchanges to fund with", href: "/exchanges" },
                { label: "How we source information", href: "/how-we-rate" },
              ],
            },
          ],
        },
        {
          mono: "⚖️",
          label: "Markets vs books",
          tint: "#57E39A",
          href: "/prediction-markets",
          columns: [
            {
              title: "Compare against",
              links: [
                { label: "Crypto sportsbooks", href: "/sportsbooks" },
                { label: "Sports markets", href: "/sportsbooks?tab=1" },
                { label: "Esports markets", href: "/sportsbooks?tab=2" },
              ],
            },
            {
              title: "Method",
              links: [
                { label: "How we source information", href: "/how-we-rate" },
                { label: "Sportsbook margin, explained", href: "/guides/sportsbook-margin-explained" },
                { label: "Compare operators", href: "/compare" },
              ],
            },
          ],
        },
      ],
    },
    {
      key: "crypto",
      label: "Cryptocurrency",
      sections: [
        {
          mono: "👛",
          label: "Wallets",
          tint: "#9B8FC4",
          href: "/wallets",
          columns: [
            {
              title: "Wallet profiles",
              links: siteData.walletRows.slice(0, 5).map((w) => ({ label: w.name, href: `/wallets/${w.slug}`, brand: w.slug })),
            },
            {
              title: "Read first",
              links: [
                { label: "Bankroll separation", href: "/guides/bankroll-separation" },
                { label: "Who pays the network fee", href: "/guides/who-pays-the-network-fee" },
                { label: "Depositing over Lightning", href: "/guides/depositing-over-lightning" },
              ],
            },
          ],
        },
        {
          mono: "💱",
          label: "Exchanges",
          tint: "#5FE3E8",
          href: "/exchanges",
          columns: [
            {
              title: "Exchange profiles",
              links: siteData.exchangeRows.slice(0, 5).map((x) => ({ label: x.name, href: `/exchanges/${x.slug}`, brand: x.slug })),
            },
            {
              title: "Getting on chain",
              links: [
                { label: "All exchange reviews", href: "/exchanges" },
                { label: "Depositing over Lightning", href: "/guides/depositing-over-lightning" },
                { label: "How we review", href: "/how-we-rate" },
              ],
            },
          ],
        },
        {
          mono: "🪙",
          label: "Coins",
          tint: "#C7A45C",
          href: "/coins",
          feature: topCasinoFeature("Our top crypto casino"),
          columns: [
            {
              title: "Casinos by coin",
              links: siteData.coinDefs.map((cd) => ({ label: `${cd.name} casinos`, href: coinHref(cd), image: COIN_MARKS[String(cd.ticker)] })),
            },
            {
              title: "Coin support",
              links: [
                { label: "Every coin we track", href: "/coins" },
                { label: "Depositing over Lightning", href: "/guides/depositing-over-lightning" },
                { label: "Who pays the network fee", href: "/guides/who-pays-the-network-fee" },
              ],
            },
            {
              title: "Tools",
              links: [
                { label: "Prediction markets", href: "/prediction-markets" },
                { label: "Compare operators", href: "/compare" },
                { label: "How we source information", href: "/how-we-rate" },
              ],
            },
          ],
        },
      ],
    },
    {
      // The licensed (fiat) side: every site each regulator lists, with its
      // own logo, region by region (lib/fiat.ts). Kept apart from the crypto
      // tab so a reader always knows which kind of list they are in.
      key: "licensed",
      label: "Licensed casinos",
      sections: [
        {
          mono: "🏛",
          label: "All markets",
          tint: "#5FE3E8",
          href: "/licensed-casinos",
          feature: casinoFeature(inHouseOrder(siteData.ops)[0], "Our top crypto casino"),
          columns: [
            {
              title: "North America",
              links: [
                { label: "US-regulated casinos", href: "/us-casinos", image: flagSrc("US") ?? undefined },
                { label: `US sweepstakes · ${sweepsSorted().length}`, href: "/sweepstakes-casinos", image: flagSrc("US") ?? undefined },
                ...regionMarkets("north-america")
                  .slice(0, 4)
                  .map((m) => ({ label: `${m.name} · ${m.brands.length}`, href: fiatHref(m.code), image: m.flag ?? undefined })),
              ],
            },
            {
              title: "Europe",
              links: [
                { label: `United Kingdom · ${fiatMarketFor("GB")?.brands.length ?? 0}`, href: fiatHref("GB"), image: flagSrc("GB") ?? undefined },
                ...EUROPE_FIAT.map((code) => fiatMarketFor(code))
                  .filter((m): m is NonNullable<typeof m> => !!m)
                  .slice(0, 5)
                  .map((m) => ({ label: `${m.name} · ${m.brands.length}`, href: fiatHref(m.code), image: m.flag ?? undefined })),
              ],
            },
            {
              title: "Latin America, Africa & Asia-Pacific",
              links: [
                ...[...regionMarkets("latin-america"), ...regionMarkets("africa"), ...regionMarkets("asia-pacific")].map((m) => ({ label: `${m.name} · ${m.brands.length}`, href: fiatHref(m.code), image: m.flag ?? undefined })),
                { label: `All ${fiatMarkets().length + 2} licensed markets`, href: "/licensed-casinos" },
              ],
            },
          ],
        },
        {
          mono: "US",
          icon: flagSrc("US") ?? undefined,
          label: "US regulated",
          tint: "#7BE0B8",
          href: "/us-casinos",
          feature: sweepsFeature("Our top pick for the US"),
          columns: [
            {
              title: "Browse",
              links: [
                { label: "US-regulated casinos", href: "/us-casinos" },
                { label: "US-regulated sportsbooks", href: "/us-sportsbooks" },
                { label: "Casinos by state", href: "/us-casinos#by-state" },
              ],
            },
            {
              // The states where a licensed online casino is live, from each
              // state's own law page.
              title: "Live states",
              links: US_STATES.filter((st) => toneOf(st.onlineCasino) === "legal").map((st) => ({ label: st.name, href: `/us-casinos/in/${st.code.toLowerCase()}` })),
            },
            {
              // Widest sportsbook footprint, by state count — we hold no deal
              // with any of them.
              title: "Biggest footprints",
              links: rankedBrands("sportsbook")
                .slice(0, 5)
                .map(({ brand }) => ({ label: brand.name, href: `/us-casinos/${brand.slug}`, brand: brand.slug })),
            },
          ],
        },
        {
          mono: "🎟️",
          label: "US sweepstakes",
          tint: "#C9A227",
          href: "/sweepstakes-casinos",
          feature: sweepsFeature("Our top sweepstakes casino"),
          columns: [
            {
              title: "Browse",
              links: [{ label: `All ${sweepsSorted().length} sweepstakes casinos`, href: "/sweepstakes-casinos" }],
            },
            {
              // The same house order the index uses.
              title: "Top sweepstakes",
              links: sweepsSorted()
                .slice(0, 5)
                .map((s) => ({ label: s.name, href: `/sweepstakes-casinos/${s.slug}`, brand: s.slug })),
            },
          ],
        },
        {
          mono: "CA",
          icon: flagSrc("CA") ?? undefined,
          label: "Ontario",
          tint: "#E07B7B",
          href: fiatHref("CA-ON"),
          // No crypto-casino pick here: Ontario allows only iGaming Ontario
          // operators to market to its residents.
          columns: [
            {
              title: "Licensed in Ontario",
              links: [
                { label: `All ${fiatMarketFor("CA-ON")?.brands.length ?? 0} iGaming Ontario brands`, href: fiatHref("CA-ON") },
                { label: "Casinos only", href: `${fiatHref("CA-ON")}?type=casino` },
                { label: "Sportsbooks only", href: `${fiatHref("CA-ON")}?type=sports` },
              ],
            },
            {
              title: "On the register",
              links: (fiatMarketFor("CA-ON")?.brands ?? [])
                .filter((x) => x.logo)
                .slice(0, 6)
                .map((x) => ({ label: x.name, href: `${fiatHref("CA-ON")}#${x.id}`, image: x.logo ?? undefined })),
            },
          ],
        },
        {
          mono: "GB",
          icon: flagSrc("GB") ?? undefined,
          label: "United Kingdom",
          tint: "#7BB8E0",
          href: fiatHref("GB"),
          columns: [
            {
              title: "Gambling Commission register",
              links: [
                { label: `All ${fiatMarketFor("GB")?.brands.length ?? 0} UK-licensed brands`, href: fiatHref("GB") },
                { label: "Casinos only", href: `${fiatHref("GB")}?type=casino` },
                { label: "Sportsbooks only", href: `${fiatHref("GB")}?type=sports` },
                { label: "UK gambling law", href: "/legal/gb" },
              ],
            },
            {
              title: "On the register",
              links: (fiatMarketFor("GB")?.brands ?? [])
                .filter((x) => x.logo)
                .slice(0, 6)
                .map((x) => ({ label: x.name, href: `${fiatHref("GB")}#${x.id}`, image: x.logo ?? undefined })),
            },
          ],
        },
        {
          mono: "EU",
          icon: flagSrc("EU") ?? undefined,
          label: "Europe",
          tint: "#7BB8E0",
          href: "/licensed-casinos#europe",
          feature: casinoFeature(acceptingEurope()[0], "Our top pick for Europe"),
          // Three columns of eight: the European registers on file, in region order.
          columns: [0, 8, 16].map((from, i) => ({
            title: i === 0 ? "Licensed brands by country" : " ",
            links: regionMarkets("europe")
              .slice(from, from + 8)
              .map((m) => ({ label: `${m.name} · ${m.brands.length}`, href: fiatHref(m.code), image: m.flag ?? undefined })),
          })).filter((c) => c.links.length),
        },
      ],
    },
  ];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * The menu follows the homepage's four paths, so a reader who picked a path
 * there finds the same words here:
 *   Casinos · Bonuses · Slots · Is it legal? · More
 * Sections are regrouped rather than rewritten, so every column keeps its data
 * and links; sports, prediction markets, crypto, guides and the tools sit
 * under More.
 */
/** The licensed-register entries, named for what they hold once they share a tab with the crypto-casino countries. */
const LICENSED_LABEL: Record<string, string> = {
  "All markets": "All licensed sites",
  "US regulated": "US state-licensed sites",
  "US sweepstakes": "US sweepstakes sites",
  Ontario: "Ontario-licensed sites",
  "United Kingdom": "UK-licensed sites",
  Europe: "Europe-licensed sites",
};

/** Links that are tools rather than lists; they live under More → Tools. */
const TOOL_HREFS = new Set(["/compare", "/find-my-casino", "/bonus-terms-decoder", "/casino-changewatch", "/vip-calculator"]);

export function buildNavTabs(c: SiteCounts): NavTab[] {
  const raw = rawNavTabs(c);
  const tab = (key: string) => raw.find((t) => t.key === key);
  const gambling = tab("gambling")?.sections ?? [];
  const sec = (label: string) => gambling.find((s) => s.label === label);
  const casinos = sec("Crypto casinos");
  const bonuses = sec("Bonuses");
  const col = (s: NavSection | undefined, title: string) => s?.columns.find((x) => x.title === title);

  // Casinos: the lists to browse and the top profiles; races and bonuses move to Bonuses, tools to More.
  const casinoSection: NavSection | undefined = casinos && {
    ...casinos,
    columns: [
      { title: "Browse", links: (col(casinos, "Browse")?.links ?? []).filter((l) => !TOOL_HREFS.has(l.href) && l.href !== "/lowest-wagering") },
      ...(col(casinos, "Top casino profiles") ? [col(casinos, "Top casino profiles")!] : []),
    ],
  };
  const toolsSection: NavSection = {
    mono: "🧰",
    label: "Tools",
    tint: "#6BC7FF",
    href: "/find-my-casino",
    columns: [{ title: "Tools", links: (col(casinos, "Browse")?.links ?? []).filter((l) => TOOL_HREFS.has(l.href)) }],
  };

  // Bonuses: offers, codes, races and live promotions in one place.
  // Only codes a reader can type: a referral hash like "97ecknzbtm" is a link parameter, not a promo code.
  const coded = inHouseOrder(siteData.ops.filter((o) => o.promoCode && o.signupUrl && /^[A-Za-z]{3,14}$/.test(o.promoCode))).slice(0, 6);
  const bonusSection: NavSection | undefined = bonuses && {
    ...bonuses,
    columns: [
      ...(col(casinos, "Best casino bonuses") ? [col(casinos, "Best casino bonuses")!] : []),
      ...bonuses.columns,
    ],
  };
  const codesSection: NavSection = {
    mono: "🏷️",
    label: "Promo codes",
    tint: "#FFC531",
    href: "/promo-codes/roobet",
    feature: bonuses?.feature,
    columns: [
      {
        title: "Codes we hold",
        links: coded.map((o) => ({ label: o.name, href: promoHref(o.slug), brand: o.slug, note: `Code ${o.promoCode}` })),
      },
    ],
  };
  const racesSection: NavSection = {
    mono: "🏁",
    label: "Races & raffles",
    tint: "#57E39A",
    href: "/races",
    feature: casinos?.feature,
    columns: [
      { title: "Biggest races", links: col(casinos, "Biggest races")?.links ?? [] },
      { title: "See them all", links: [{ label: "All races & raffles", href: "/races" }, { label: "Roo Jackpots, explained", href: "/guides/roo-jackpots-explained" }] },
    ],
  };
  const liveSection: NavSection | null = kevinLive()
    ? {
        mono: "🎤",
        label: "Live promos",
        tint: "#FF7EB6",
        href: KEVIN_PATH,
        feature: { brand: "pragmatic-play", kicker: "Live promo · until 7 Nov", title: "Play with Kevin Hart", sub: "$1.25M prize pool in Pragmatic Play games. Earn Free Chips, then play them on Kevin's Picks while he's live on 6–7 November.", href: KEVIN_PATH, cta: "How it works →" },
        columns: [{ title: "Running now", links: [{ label: "Play with Kevin Hart: $1.25M prize pool", href: KEVIN_PATH, note: "Pragmatic Play, until 7 November" }] }],
      }
    : null;

  const legal = [...(tab("where")?.sections ?? []), ...(tab("licensed")?.sections ?? []).map((s) => ({ ...s, label: LICENSED_LABEL[s.label] ?? `Licensed: ${s.label}` }))];
  const more = [
    ...(tab("sports")?.sections ?? []),
    ...(tab("predict")?.sections ?? []),
    ...(tab("crypto")?.sections ?? []),
    ...[sec("Guides")].filter((s): s is NavSection => !!s),
    toolsSection,
  ];

  const out: NavTab[] = [
    { key: "casinos", label: "Casinos", href: "/crypto-casinos", sections: [casinoSection, sec("House games")].filter((s): s is NavSection => !!s) },
    { key: "bonuses", label: "Bonuses", href: "/bonuses", sections: [bonusSection, codesSection, racesSection, liveSection].filter((s): s is NavSection => !!s) },
    { key: "slots", label: "Slots", href: "/slots", sections: [sec("Slots & RTP"), sec("Game providers")].filter((s): s is NavSection => !!s) },
    { key: "legal", label: "Is it legal?", href: "/legal", sections: legal },
    { key: "more", label: "More", sections: more },
  ];
  return out.filter((t) => t.sections.length);
}
