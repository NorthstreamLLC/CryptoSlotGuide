/**
 * Two questions: does the featured unit render where it should, and does it
 * correctly refuse where Roobet's own restricted list blocks the reader?
 */
const BASE = "http://localhost:3001";
const has = async (p) => {
  const html = await (await fetch(BASE + p)).text();
  const main = (html.match(/<main[\s\S]*?<\/main>/) ?? [html])[0];
  return /data-featured-partner/.test(main);
};

console.log("SHOULD RENDER");
for (const p of ["/slots/gates-of-olympus", "/providers/pragmatic-play", "/wallets/phantom",
                 "/exchanges/bybit", "/guides/how-casino-rtp-versions-work", "/house-games/crash",
                 "/slots/megaways", "/providers", "/wallets", "/how-to-pick-a-crypto-casino",
                 "/crypto-casinos/accepting/btc", "/crypto-casinos/in/br"])
  console.log(`  ${(await has(p)) ? "yes" : "NO "}  ${p}`);

console.log("\nMUST NOT RENDER (Roobet's own restricted list)");
for (const p of ["/crypto-casinos/in/us", "/crypto-casinos/in/gb", "/crypto-casinos/in/au",
                 "/crypto-casinos/in/nl", "/crypto-casinos/in/mt", "/legal/us/texas",
                 "/legal/us/maine", "/sweepstakes-casinos", "/sweepstakes-casinos/stake-us"])
  console.log(`  ${(await has(p)) ? "LEAK" : "ok  "}  ${p}`);
