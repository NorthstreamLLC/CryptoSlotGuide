/**
 * Mega-menu structure — see design/README.md "Navigation": four top-level
 * tabs, each with a left rail of sections; each rail item shows two columns
 * of links plus a "See all" footer. Route paths follow the "Routing map"
 * table in the same doc.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavSection {
  emoji: string;
  label: string;
  href: string;
  seeAllLabel: string;
  columns: [NavLink[], NavLink[]];
}

export interface NavTab {
  label: string;
  sections: NavSection[];
}

export const navTabs: NavTab[] = [
  {
    label: "Gambling",
    sections: [
      {
        emoji: "🎰",
        label: "Crypto casinos",
        href: "/crypto-casinos",
        seeAllLabel: "See all 47 reviews",
        columns: [
          [
            { label: "All crypto casinos", href: "/crypto-casinos" },
            { label: "No-KYC", href: "/crypto-casinos/no-kyc" },
            { label: "Fastest payouts", href: "/fastest-payouts" },
          ],
          [
            { label: "Lowest wagering", href: "/lowest-wagering" },
            { label: "Casino + sportsbook", href: "/casino-sportsbooks" },
            { label: "Esports casinos", href: "/esports-casinos" },
          ],
        ],
      },
      {
        emoji: "🎥",
        label: "Live casino",
        href: "/live-casino",
        seeAllLabel: "See all live tables",
        columns: [
          [{ label: "Live casino index", href: "/live-casino" }],
          [{ label: "Blackjack tables", href: "/live-casino" }],
        ],
      },
      {
        emoji: "🎯",
        label: "Slots & RTP",
        href: "/slots",
        seeAllLabel: "See all 16 slots",
        columns: [
          [
            { label: "All slots", href: "/slots" },
            { label: "RTP Watch", href: "/rtp-watch" },
            { label: "Bonus buy", href: "/slots/bonus-buy" },
          ],
          [
            { label: "Megaways", href: "/slots/megaways" },
            { label: "Jackpot", href: "/slots/jackpot" },
            { label: "High volatility", href: "/slots/high-volatility" },
          ],
        ],
      },
      {
        emoji: "🛠️",
        label: "Game providers",
        href: "/providers",
        seeAllLabel: "See all providers",
        columns: [[{ label: "All providers", href: "/providers" }], []],
      },
      {
        emoji: "🎲",
        label: "House games",
        href: "/house-games",
        seeAllLabel: "See all house games",
        columns: [[{ label: "All house games", href: "/house-games" }], []],
      },
      {
        emoji: "🎁",
        label: "Bonuses",
        href: "/bonuses",
        seeAllLabel: "See the bonus tracker",
        columns: [[{ label: "Bonus tracker", href: "/bonuses" }], []],
      },
      {
        emoji: "📘",
        label: "Guides",
        href: "/guides",
        seeAllLabel: "See all guides",
        columns: [[{ label: "All guides", href: "/guides" }], []],
      },
    ],
  },
  {
    label: "Sports betting",
    sections: [
      {
        emoji: "🏟️",
        label: "Sportsbooks",
        href: "/sportsbooks",
        seeAllLabel: "See all sportsbooks",
        columns: [[{ label: "All sportsbooks", href: "/sportsbooks" }], []],
      },
      {
        emoji: "🏈",
        label: "Sports betting",
        href: "/casino-sportsbooks",
        seeAllLabel: "See casino + sportsbook combos",
        columns: [[{ label: "Casino + sportsbook", href: "/casino-sportsbooks" }], []],
      },
      {
        emoji: "🎮",
        label: "Esports",
        href: "/esports-casinos",
        seeAllLabel: "See esports casinos",
        columns: [[{ label: "Esports casinos", href: "/esports-casinos" }], []],
      },
    ],
  },
  {
    label: "Prediction markets",
    sections: [
      {
        emoji: "🔮",
        label: "Crypto-settled",
        href: "/prediction-markets",
        seeAllLabel: "See crypto-settled markets",
        columns: [[{ label: "Crypto-settled markets", href: "/prediction-markets" }], []],
      },
      {
        emoji: "🏛️",
        label: "Regulated fiat",
        href: "/prediction-markets",
        seeAllLabel: "See regulated fiat markets",
        columns: [[{ label: "Regulated fiat markets", href: "/prediction-markets" }], []],
      },
      {
        emoji: "⚖️",
        label: "Markets vs books",
        href: "/prediction-markets",
        seeAllLabel: "Read the comparison",
        columns: [[{ label: "Markets vs. sportsbooks", href: "/prediction-markets" }], []],
      },
    ],
  },
  {
    label: "Cryptocurrency",
    sections: [
      {
        emoji: "👛",
        label: "Wallets",
        href: "/wallets",
        seeAllLabel: "See all wallets",
        columns: [[{ label: "All wallets", href: "/wallets" }], []],
      },
      {
        emoji: "🔁",
        label: "Exchanges",
        href: "/exchanges",
        seeAllLabel: "See all exchanges",
        columns: [[{ label: "All exchanges", href: "/exchanges" }], []],
      },
      {
        emoji: "🪙",
        label: "Coins",
        href: "/coins",
        seeAllLabel: "See all coins",
        columns: [[{ label: "All coins", href: "/coins" }], []],
      },
    ],
  },
];

export const footerLinks: NavLink[] = [
  { label: "Compare", href: "/compare" },
  { label: "How we rate", href: "/how-we-rate" },
  { label: "RTP Watch", href: "/rtp-watch" },
  { label: "Guides", href: "/guides" },
];
