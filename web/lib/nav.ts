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
import { raceSlugs } from "./races";
import { countryPages, casinosForCountry } from "./landing";
import { TOP_STUDIOS } from "./top-studios";
import { US_STATES, EUROPE_SHAPES, toneOf } from "./legal";
import { fiatMarkets, fiatMarketFor, fiatHref, EUROPE_FIAT, regionMarkets } from "./fiat";

/** The countries the Europe map draws, for the Europe column. */
const EUROPE_CODES = new Set(EUROPE_SHAPES.map((sh) => sh.code).filter((c): c is string => !!c));
import { flagSrc } from "./flags";
import { sportsOffers, sportsOnlyRaces, sportsBoosts, sportsbookHref } from "./sports";
import { rankedBrands } from "./us-brands";

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
}

export interface NavSection {
  mono: string;
  /** An image for the rail instead of the mono glyph — a flag, where the emoji would render as letters on Windows. */
  icon?: string;
  label: string;
  tint: string;
  href: string;
  columns: NavColumn[];
}

export interface NavColumn {
  title: string;
  links: NavLink[];
}

export interface NavTab {
  key: "gambling" | "where" | "licensed" | "casinos" | "slots" | "countries" | "sports" | "predict" | "crypto";
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
          columns: [
            {
              title: "Browse",
              links: [
                { label: `All ${c.casinos} crypto casinos`, href: "/crypto-casinos" },
                { label: "No-KYC casinos", href: "/crypto-casinos/no-kyc" },
                { label: "Fastest payouts", href: "/fastest-payouts" },
                { label: "Easiest bonuses to cash out", href: "/lowest-wagering" },
                { label: "Compare side by side", href: "/compare" },
                { label: "Find my casino", href: "/find-my-casino" },
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
                .map((o) => ({ label: o.name, href: `/races#${o.slug}`, brand: o.slug })),
            },
          ],
        },
        {
          mono: "🎰",
          label: "Slots & RTP",
          tint: "#DA9877",
          href: "/slots",
          columns: [
            {
              title: "Slots",
              links: [
                { label: "Our top slots", href: "/slots" },
                { label: "Slot database · every game we hold", href: "/slots/database" },
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
          tint: "#9AAE5E",
          href: "/guides",
          columns: [
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
          columns: [
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
                { label: "Crypto casinos, all of them", href: "/crypto-casinos" },
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
          columns: [
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
          columns: [
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
          columns: [
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
          columns: [
            {
              title: "Browse",
              links: [
                { label: "Roobet sportsbook · our pick", href: sportsbookHref("roobet"), brand: "roobet" },
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
          columns: [
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
 * The menu as readers use it. "Gambling" held casinos, slots, studios, house
 * games, bonuses and guides — slots, the biggest section of the site, sat one
 * level down under a label that names none of it — and countries were split
 * across "Crypto casinos by country" and "Licensed casinos". Regrouped here
 * rather than rewritten above, so every column keeps its data and links:
 *   Casinos · Slots · Countries · Sports · Predictions · Crypto
 */
/** The licensed-register entries, named for what they hold once they share a tab with the crypto-casino countries. */
const LICENSED_LABEL: Record<string, string> = {
  "All markets": "Licensed sites, every market",
  "US regulated": "US state-licensed sites",
  "US sweepstakes": "US sweepstakes sites",
  Ontario: "Ontario-licensed sites",
  "United Kingdom": "UK-licensed sites",
  Europe: "Europe-licensed sites",
};

export function buildNavTabs(c: SiteCounts): NavTab[] {
  const raw = rawNavTabs(c);
  const tab = (key: string) => raw.find((t) => t.key === key);
  const gambling = tab("gambling")?.sections ?? [];
  const pick = (labels: string[]) => labels.map((l) => gambling.find((s) => s.label === l)).filter((s): s is NavSection => !!s);
  const out: NavTab[] = [
    { key: "casinos", label: "Casinos", href: "/crypto-casinos", sections: pick(["Crypto casinos", "Bonuses", "House games", "Guides"]) },
    { key: "slots", label: "Slots", href: "/slots", sections: pick(["Slots & RTP", "Game providers"]) },
    { key: "countries", label: "Countries", href: "/legal", sections: [...(tab("where")?.sections ?? []), ...(tab("licensed")?.sections ?? []).map((s) => ({ ...s, label: LICENSED_LABEL[s.label] ?? `Licensed: ${s.label}` }))] },
    { ...(tab("sports") as NavTab), label: "Sports", href: "/sportsbooks" },
    { ...(tab("predict") as NavTab), label: "Predictions", href: "/prediction-markets" },
    { ...(tab("crypto") as NavTab), label: "Crypto", href: "/coins" },
  ];
  return out.filter((t) => t && t.sections.length);
}
