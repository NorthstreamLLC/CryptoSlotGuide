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
import { raceSlugs } from "./races";
import { countryPages } from "./landing";
import { TOP_STUDIOS } from "./top-studios";
import { US_STATES, toneOf } from "./legal";
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
  key: "gambling" | "sports" | "predict" | "crypto";
  label: string;
  sections: NavSection[];
}

export function buildNavTabs(c: SiteCounts): NavTab[] {
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
          mono: "🌍",
          label: "Where you can play",
          tint: "#7BE0B8",
          href: "/legal",
          columns: [
            {
              title: "Maps",
              links: [
                { label: "Gambling laws, every country", href: "/legal" },
                { label: "US state by state", href: "/legal/us" },
                { label: "Canada by province", href: "/legal/canada" },
                { label: "Europe", href: "/legal/europe" },
                { label: "UK-licensed casinos", href: "/uk-casinos" },
              ],
            },
            {
              // Countries where the most of our casinos say, in their own
              // terms, that they will take you. Counted, not chosen — except
              // that a country whose law bans online casinos is left out,
              // whatever the operators' terms omit: India scored 30 here while
              // its own page shows the law and no list, and a menu that sells
              // what the page refuses is the contradiction that page exists
              // to prevent.
              title: "Most casinos accept",
              links: [...countryPages()]
                .filter(({ c }) => !/not legal|banned|prohibit/i.test(c.onlineCasino ?? ""))
                .sort((a, b) => b.accepts.length - a.accepts.length || a.c.name.localeCompare(b.c.name))
                .slice(0, 6)
                .map(({ c, accepts }) => ({ label: `${c.name} · ${accepts.length}`, href: `/crypto-casinos/in/${c.code.toLowerCase()}` })),
            },
          ],
        },
        {
          mono: "🇺🇸",
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
                { label: "State-by-state law", href: "/legal/us" },
                { label: "US sweepstakes casinos", href: "/sweepstakes-casinos" },
              ],
            },
            {
              // Widest sportsbook footprint, by state count, not by anything
              // commercial — we hold no deal with any of them. Sportsbook
              // rather than casino because the spread is far wider there:
              // 27 states against 5.
              // The states where a licensed online casino is live, from each
              // state's own law page.
              title: "Live states",
              links: US_STATES.filter((st) => toneOf(st.onlineCasino) === "legal").map((st) => ({ label: st.name, href: `/us-casinos/in/${st.code.toLowerCase()}` })),
            },
            {
              title: "Biggest footprints",
              links: rankedBrands("sportsbook")
                .slice(0, 5)
                .map(({ brand }) => ({ label: brand.name, href: `/us-casinos/${brand.slug}`, brand: brand.slug })),
            },
          ],
        },
        {
          mono: "🎟️",
          label: "Sweepstakes",
          tint: "#C9A227",
          href: "/sweepstakes-casinos",
          columns: [
            {
              title: "Browse",
              links: [
                { label: `All ${sweepsSorted().length} sweepstakes casinos`, href: "/sweepstakes-casinos" },
                { label: "US state by state", href: "/legal/us" },
                { label: "US-regulated casinos", href: "/us-casinos" },
              ],
            },
            {
              // The same house order the index uses, so the menu and the page
              // never disagree about who comes first.
              title: "Top sweepstakes",
              links: sweepsSorted()
                .slice(0, 5)
                .map((s) => ({ label: s.name, href: `/sweepstakes-casinos/${s.slug}`, brand: s.slug })),
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
              })),
            },
            {
              title: "More originals",
              links: ["Limbo", "Keno", "Hi-Lo", "Wheel"].map((name) => ({
                label: name,
                href: `/house-games/${slug(name)}`,
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
                { label: `All ${c.books} sportsbooks`, href: "/sportsbooks" },
                { label: "Compare side by side", href: "/compare" },
                { label: "Sportsbook margin, explained", href: "/guides/sportsbook-margin-explained" },
              ],
            },
            {
              title: "Book profiles",
              links: ["BC.Game", "Cloudbet", "Roobet", "Stake"].map((name) => ({
                label: name,
                href: `/casinos/${slug(name)}`,
                brand: slug(name),
              })),
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
              links: ["Polymarket", "Limitless", "Overtime", "Myriad"].map((name) => ({
                label: name,
                href: "/prediction-markets",
                brand: slug(name),
              })),
            },
            {
              title: "What to know",
              links: [
                { label: "All crypto-settled venues", href: "/prediction-markets" },
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
          href: "/prediction-markets?tab=fiat",
          columns: [
            {
              title: "Venues",
              links: ["Kalshi", "Polymarket US", "Robinhood Prediction Markets", "ForecastEx", "PredictIt"].map(
                (name) => ({
                  label: name,
                  href: "/prediction-markets?tab=fiat",
                  brand: name.startsWith("Robinhood") ? "robinhood" : slug(name),
                })
              ),
            },
            {
              title: "What to know",
              links: [
                { label: "All regulated venues", href: "/prediction-markets?tab=fiat" },
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
  ];
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
