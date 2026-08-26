/**
 * Mega-menu structure — ported directly from `megaDefs` / `navTabs` in
 * CryptoSlotGuide.dc.html (search that file for `const megaDefs =` to
 * cross-check). Labels that embed a count (e.g. "All 47 crypto casinos")
 * are built from live SiteCounts, exactly like the prototype's `C.casinos`
 * etc. — never hardcoded, so a data change updates the copy automatically.
 */
import type { SiteCounts } from "./derived";

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
              links: ["bonus-buy", "megaways", "jackpot", "cluster-pays", "high-volatility"].map((tag) => ({
                label: `${tag} slots`,
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
            { title: "Most read", links: [{ label: "How to buy crypto for gambling", href: "/guides/how-to-buy-crypto-for-gambling" }] },
            { title: "More guides", links: [{ label: "All guides", href: "/guides" }] },
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
          href: "/casino-sportsbooks",
          columns: [{ title: "By sport", links: [{ label: "All sports markets", href: "/casino-sportsbooks" }] }],
        },
        {
          mono: "🕹️",
          label: "Esports",
          tint: "#C4795A",
          href: "/esports-casinos",
          columns: [{ title: "By title", links: [{ label: "All esports markets", href: "/esports-casinos" }] }],
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
          ],
        },
        {
          mono: "🏛️",
          label: "Regulated fiat",
          tint: "#6BC7FF",
          href: "/prediction-markets",
          columns: [
            {
              title: "Venues",
              links: ["Kalshi", "Polymarket US", "Robinhood Prediction", "IBKR ForecastEx", "PredictIt"].map(
                (name) => ({ label: name, href: "/prediction-markets" })
              ),
            },
          ],
        },
        {
          mono: "⚖️",
          label: "Markets vs books",
          tint: "#57E39A",
          href: "/prediction-markets",
          columns: [{ title: "Compare against", links: [{ label: "Crypto sportsbooks", href: "/sportsbooks" }] }],
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
          columns: [{ title: "Wallet reviews", links: [{ label: `All ${c.wallets} wallets`, href: "/wallets" }] }],
        },
        {
          mono: "💱",
          label: "Exchanges",
          tint: "#5FE3E8",
          href: "/exchanges",
          columns: [{ title: "Exchange reviews", links: [{ label: `All ${c.exchanges} exchanges`, href: "/exchanges" }] }],
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
              ],
            },
            {
              title: "Tools",
              links: [
                { label: "RTP Watch · live board", href: "/rtp-watch", dot: "#DA9877" },
                { label: "Prediction markets", href: "/prediction-markets" },
                { label: "Compare operators", href: "/compare" },
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
