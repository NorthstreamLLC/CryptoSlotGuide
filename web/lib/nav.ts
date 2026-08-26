/**
 * Mega-menu structure — ported directly from `megaDefs` / `navTabs` in
 * CryptoSlotGuide.dc.html (search that file for `const megaDefs =` to
 * cross-check). Labels that embed a count (e.g. "All 47 crypto casinos")
 * are built from live SiteCounts, exactly like the prototype's `C.casinos`
 * etc. — never hardcoded, so a data change updates the copy automatically.
 */
import type { SiteCounts } from "./derived";
import { siteData } from "./site-data";

const slotCatLabels = siteData.slotCatDefs.map((d) => ({ tag: d.tag, label: d.label }));

export interface NavLink {
  label: string;
  href: string;
  dot?: string;
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
              title: "Browse casinos by",
              links: [
                { label: `All ${c.casinos} crypto casinos`, href: "/crypto-casinos" },
                { label: "No-KYC casinos", href: "/crypto-casinos/no-kyc" },
                { label: "Fastest payouts", href: "/fastest-payouts" },
                { label: "Lowest wagering", href: "/lowest-wagering" },
                { label: "Compare side by side", href: "/compare" },
                { label: "Fiat casinos (separate list)", href: "/fiat-casinos" },
              ],
            },
            {
              title: "Top casino reviews",
              links: ["Roobet", "Stake", "BC.Game", "Shuffle", "Rollbit"].map((name) => ({
                label: name,
                href: `/casinos/${slug(name)}`,
              })),
            },
          ],
        },
        {
          mono: "🃏",
          label: "Live casino",
          tint: "#FF7EB6",
          href: "/live-casino",
          columns: [
            {
              title: "Live tables",
              links: [
                { label: "All live casinos", href: "/live-casino", dot: "#FF5A78" },
                { label: "Blackjack tables", href: "/live-casino?type=Blackjack" },
                { label: "Roulette tables", href: "/live-casino?type=Roulette" },
                { label: "Baccarat tables", href: "/live-casino?type=Baccarat" },
                { label: "Game shows", href: "/live-casino?type=Game+show" },
              ],
            },
            {
              title: "Popular tables",
              links: [
                "Crazy Time",
                "Lightning Roulette",
                "Infinite Blackjack",
                "Speed Baccarat A",
                "Monopoly Big Baller",
              ].map((name) => ({ label: name, href: `/live-casino/${slug(name)}` })),
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
              title: "RTP tools",
              links: [
                { label: "RTP Watch · live board", href: "/rtp-watch", dot: "#DA9877" },
                { label: `All ${c.slots} slot reviews`, href: "/slots" },
                { label: "How casino RTP versions work", href: "/guides/how-casino-rtp-versions-work" },
                { label: "How we rate", href: "/how-we-rate" },
              ],
            },
            {
              title: "By mechanic",
              links: slotCatLabels.map(({ tag, label }) => ({
                label: `${label} slots`,
                href: `/slots/${tag}`,
              })),
            },
            {
              title: "Top slot reviews",
              links: ["Money Train 4", "Sweet Bonanza", "Razor Shark", "Gates of Olympus"].map((name) => ({
                label: name,
                href: `/slots/${slug(name)}`,
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
                { label: "Slots by provider", href: "/slots" },
                { label: "How casino RTP versions work", href: "/guides/how-casino-rtp-versions-work" },
              ],
            },
            {
              title: "Top studios",
              links: ["Hacksaw Gaming", "Push Gaming", "Nolimit City", "Pragmatic Play", "Relax Gaming"].map(
                (name) => ({ label: name, href: `/providers/${slug(name)}` })
              ),
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
                { label: "Our scoring sheet", href: "/how-we-rate" },
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
              title: "Rankings",
              links: [
                { label: `All ${c.books} sportsbooks`, href: "/sportsbooks" },
                { label: "Compare side by side", href: "/compare" },
                { label: "Sportsbook margin, measured", href: "/guides/sportsbook-margin-measured" },
              ],
            },
            {
              title: "Top book reviews",
              links: ["Cloudbet", "Stake", "Roobet", "BC.Game"].map((name) => ({
                label: name,
                href: `/casinos/${slug(name)}`,
              })),
            },
          ],
        },
        {
          mono: "⚽",
          label: "Sports betting",
          tint: "#9FB6E0",
          href: "/sportsbooks?tab=1",
          columns: [
            {
              title: "By sport",
              links: siteData.sportsMarkets.slice(0, 3).map((m) => ({ label: m.name, href: `/betting/${slug(m.name)}` })),
            },
            {
              title: "More markets",
              links: siteData.sportsMarkets.slice(3, 6).map((m) => ({ label: m.name, href: `/betting/${slug(m.name)}` })),
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
              links: siteData.esportsTitles.slice(0, 3).map((t) => ({ label: t.name, href: `/betting/${slug(t.name)}` })),
            },
            {
              title: "Where to bet it",
              links: [
                { label: "All esports markets", href: "/sportsbooks?tab=2" },
                { label: "Sportsbook margin, measured", href: "/guides/sportsbook-margin-measured" },
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
              links: ["Polymarket", "Limitless", "Drift BET", "Overtime", "Myriad"].map((name) => ({
                label: name,
                href: "/prediction-markets",
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
              links: ["Kalshi", "Polymarket US", "Robinhood Prediction", "IBKR ForecastEx", "PredictIt"].map(
                (name) => ({ label: name, href: "/prediction-markets?tab=fiat" })
              ),
            },
            {
              title: "What to know",
              links: [
                { label: "All regulated venues", href: "/prediction-markets?tab=fiat" },
                { label: "Exchanges to fund with", href: "/exchanges" },
                { label: "How we rate", href: "/how-we-rate" },
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
                { label: "How we rate", href: "/how-we-rate" },
                { label: "Sportsbook margin, measured", href: "/guides/sportsbook-margin-measured" },
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
              title: "Wallet reviews",
              links: siteData.walletRows.slice(0, 5).map((w) => ({ label: w.name, href: `/wallets/${w.slug}` })),
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
              title: "Exchange reviews",
              links: siteData.exchangeRows.slice(0, 5).map((x) => ({ label: x.name, href: `/exchanges/${x.slug}` })),
            },
            {
              title: "Getting on chain",
              links: [
                { label: "All exchange reviews", href: "/exchanges" },
                { label: "Depositing over Lightning", href: "/guides/depositing-over-lightning" },
                { label: "Our scoring sheet", href: "/how-we-rate" },
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
                { label: "RTP Watch · live board", href: "/rtp-watch", dot: "#DA9877" },
                { label: "Prediction markets", href: "/prediction-markets" },
                { label: "Compare operators", href: "/compare" },
                { label: "How we rate", href: "/how-we-rate" },
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
