import type { NextConfig } from "next";

/**
 * Permanent redirects for URLs from the old WordPress site that the new site
 * covers better elsewhere. Everything else keeps its original path (see
 * app/[legacy]) so nothing that ranks today is lost.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/roobet-casino", destination: "/casinos/roobet", permanent: true },
      { source: "/razed-casino", destination: "/casinos/razed", permanent: true },
      { source: "/top-crypto-casinos", destination: "/crypto-casinos", permanent: true },
      { source: "/casino-sign-up-bonuses", destination: "/bonuses", permanent: true },
      { source: "/sample-page", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/author/:name", destination: "/blog", permanent: true },
      { source: "/tag/:slug", destination: "/blog", permanent: true },
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
