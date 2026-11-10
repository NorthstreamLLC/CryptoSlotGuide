import type { NextConfig } from "next";

/**
 * Permanent redirects for URLs from the old WordPress site that the new site
 * covers better elsewhere. Everything else keeps its original path (see
 * app/[legacy]) so nothing that ranks today is lost.
 */
const nextConfig: NextConfig = {
  // Standard security headers on every response. No full script/style CSP:
  // the site uses inline styles and remote slot art, so the policy only covers
  // framing, plugins and <base>, which nothing here relies on.
  async headers() {
    return [
      // Vercel Preview builds (branch drafts) stay out of search indexes. Vercel
      // already sends this on preview URLs; this is a backstop that never applies
      // to production, where VERCEL_ENV is "production". noindex does not make a
      // preview private: access protection is a Vercel project setting.
      ...(process.env.VERCEL_ENV === "preview" ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : []),
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/roobet-casino", destination: "/casinos/roobet", permanent: true },
      // Overlapping old posts consolidated into the strongest page on each topic
      // (no-KYC, anonymity, provably fair, volatility, bonuses, BTC vs ETH,
      // stablecoins, choosing a casino, high RTP), and the short "Official …
      // Review" slot posts into the full slot pages.
      { source: "/no-kyc-crypto-casinos-what-they-are-and-how-they-work", destination: "/no-kyc-crypto-casinos-what-they-are-how-they-work-and-what-youre-actually-risking", permanent: true },
      { source: "/stay-anonymous-crypto-casino", destination: "/how-to-stay-anonymous-while-gambling-online-with-crypto", permanent: true },
      { source: "/how-provably-fair-slots-work-and-why-it-matters", destination: "/what-provably-fair-actually-means-and-how-to-verify-it", permanent: true },
      { source: "/provably-fair-slots-how-blockchain-verification-actually-works", destination: "/what-provably-fair-actually-means-and-how-to-verify-it", permanent: true },
      { source: "/the-top-5-provably-fair-crypto-casinos-in-2026", destination: "/house-games", permanent: true },
      { source: "/slot-volatility-crypto-casinos", destination: "/crypto-slot-volatility-high-vs-low-variance-and-what-it-means-for-your-bankroll", permanent: true },
      { source: "/crypto-casino-bonuses-explained", destination: "/best-crypto-casino-welcome-bonuses-2026-what-to-look-for-and-avoid", permanent: true },
      { source: "/how-crypto-casino-bonuses-work-wagering-requirements-explained", destination: "/guides/reading-wagering-requirements", permanent: true },
      { source: "/how-to-read-crypto-casino-bonus-terms-before-you-deposit", destination: "/guides/reading-wagering-requirements", permanent: true },
      { source: "/bitcoin-vs-ethereum-for-casino-deposits-which-is-better-in-2026", destination: "/ethereum-vs-bitcoin-for-online-gambling-which-is-better", permanent: true },
      { source: "/bitcoin-vs-ethereum-vs-usdc-for-crypto-slots", destination: "/ethereum-vs-bitcoin-for-online-gambling-which-is-better", permanent: true },
      { source: "/usdt-usdc-crypto-gambling-stablecoins", destination: "/how-to-use-stablecoins-at-crypto-casinos-usdt-usdc-dai-explained", permanent: true },
      { source: "/how-to-pick-a-crypto-casino", destination: "/what-makes-a-great-crypto-casino-how-to-actually-compare-your-options", permanent: true },
      { source: "/high-rtp-crypto-slots-the-best-games-to-play-when-youre-playing-smart", destination: "/the-best-crypto-slots-with-high-rtp-in-2026", permanent: true },
      { source: "/official-bigg-bass-review", destination: "/slots/big-bass-bonanza-1000", permanent: true },
      { source: "/official-5-lions-megaways-2-review", destination: "/slots/5-lions-megaways-2", permanent: true },
      { source: "/official-fruit-party-review", destination: "/slots/fruit-party", permanent: true },
      { source: "/official-zeus-vs-hades-review", destination: "/slots/zeus-vs-hades-gods-of-war", permanent: true },
      { source: "/official-sweet-bonanza-1000-review", destination: "/slots/sweet-bonanza-1000", permanent: true },
      { source: "/official-big-bass-halloween-3-review", destination: "/slots/big-bass-halloween-3", permanent: true },
      { source: "/official-sugar-rush-1000-review", destination: "/slots/sugar-rush-1000", permanent: true },
      { source: "/official-gates-of-olympus-review", destination: "/slots/gates-of-olympus", permanent: true },
      // Three old posts whose bodies were CDL betting copy under casino titles:
      // retired, each pointing at the article that covers its topic.
      { source: "/anonymous-crypto-gambling-which-casinos-dont-require-kyc", destination: "/crypto-casinos/no-kyc", permanent: true },
      { source: "/crypto-casino-withdrawal-times-what-to-expect-and-how-to-speed-them-up", destination: "/crypto-casino-withdrawals-explained", permanent: true },
      { source: "/best-crypto-casino-welcome-bonuses-in-2026-what-to-actually-look-for", destination: "/best-crypto-casino-welcome-bonuses-2026-what-to-look-for-and-avoid", permanent: true },
      // The six hand-checked UK brands gave way to the whole Gambling
      // Commission register on the licensed-casinos page.
      { source: "/uk-casinos", destination: "/licensed-casinos/gb", permanent: true },
      // ESPN BET became theScore Bet on 1 December 2025.
      { source: "/us-casinos/espn-bet", destination: "/us-casinos/thescore-bet", permanent: true },
      // The regulated prediction markets were a tab on the crypto list; they
      // have their own page now.
      { source: "/prediction-markets", has: [{ type: "query", key: "tab", value: "fiat" }], destination: "/prediction-markets/regulated", permanent: true },
      { source: "/razed-casino", destination: "/casinos/razed", permanent: true },
      { source: "/top-crypto-casinos", destination: "/crypto-casinos", permanent: true },
      // /casinos/<slug> is a review; the list itself lives at /crypto-casinos.
      { source: "/casinos", destination: "/crypto-casinos", permanent: true },
      { source: "/casino-sign-up-bonuses", destination: "/bonuses", permanent: true },
      // A 2025 roundup written as "2025 is shaping up..."; the 2026 list replaces it.
      { source: "/the-best-crypto-slots-to-play-in-2025", destination: "/the-best-crypto-slots-with-high-rtp-in-2026", permanent: true },
      { source: "/sample-page", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/author/:name", destination: "/blog", permanent: true },
      { source: "/tag/:slug", destination: "/blog", permanent: true },
      // WordPress's default empty category. It held no posts but the URL is live
      // on the old site, so it gets a destination rather than a 404 at cutover.
      { source: "/category/uncategorized", destination: "/blog", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/post-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/category-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/author-sitemap.xml", destination: "/sitemap.xml", permanent: true },
    ];
  },
};

export default nextConfig;
