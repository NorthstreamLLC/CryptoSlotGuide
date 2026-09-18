/**
 * Single source of truth for "does this slug have a real logo file."
 * Was two duplicated `logoFor()` functions (lib/casino-index.ts,
 * lib/vertical-view.ts) that both pointed at public/assets/logos/*.png
 * — 34 files that turned out to ALL be auto-generated 2-letter
 * monogram placeholders (flat grey-blue "ST", "KR", "LG"...), not real
 * acquired brand assets, discovered and removed 10 Sep 2026. Real icons now come
 * from each casino's own domain (below); anything without one still
 * renders the tinted-monogram fallback via BrandMark.
 */
/** Each casino's own square site icon (apple-touch-icon or favicon), taken from its own domain on 18 Sep 2026. Swap in affiliate brand-kit files as they arrive. */
const LOGOS: Record<string, string> = {
  "1win": "/assets/logos/1win.png",
  "500-casino": "/assets/logos/500-casino.png",
  "7bit": "/assets/logos/7bit.png",
  "acebet": "/assets/logos/acebet.png",
  "american-luck": "/assets/logos/american-luck.png",
  "bc-game": "/assets/logos/bc-game.png",
  "betfury": "/assets/logos/betfury.png",
  "betplay": "/assets/logos/betplay.png",
  "bitcasino-io": "/assets/logos/bitcasino-io.png",
  "bitstarz": "/assets/logos/bitstarz.png",
  "bluff": "/assets/logos/bluff.png",
  "chumba-casino": "/assets/logos/chumba-casino.png",
  "cloudbet": "/assets/logos/cloudbet.png",
  "coincasino": "/assets/logos/coincasino.png",
  "crown-coins-casino": "/assets/logos/crown-coins-casino.png",
  "cybet": "/assets/logos/cybet.png",
  "degen": "/assets/logos/degen.png",
  "degencity": "/assets/logos/degencity.png",
  "dicey": "/assets/logos/dicey.png",
  "duel": "/assets/logos/duel.png",
  "duelbits": "/assets/logos/duelbits.png",
  "dustbit": "/assets/logos/dustbit.png",
  "flush": "/assets/logos/flush.png",
  "fortune-wins": "/assets/logos/fortune-wins.png",
  "fortunejack": "/assets/logos/fortunejack.svg",
  "funrize": "/assets/logos/funrize.png",
  "gamba": "/assets/logos/gamba.png",
  "gamdom": "/assets/logos/gamdom.png",
  "global-poker": "/assets/logos/global-poker.png",
  "goated": "/assets/logos/goated.png",
  "hello-millions": "/assets/logos/hello-millions.png",
  "high-5-casino": "/assets/logos/high-5-casino.png",
  "housebets": "/assets/logos/housebets.png",
  "jackpotbet": "/assets/logos/jackpotbet.png",
  "legendz": "/assets/logos/legendz.png",
  "lonestar": "/assets/logos/lonestar.png",
  "luckyland-casino": "/assets/logos/luckyland-casino.png",
  "mbit": "/assets/logos/mbit.png",
  "mcluck": "/assets/logos/mcluck.png",
  "metawin": "/assets/logos/metawin.png",
  "modo": "/assets/logos/modo.png",
  "moonspin": "/assets/logos/moonspin.png",
  "nolimitcoins": "/assets/logos/nolimitcoins.png",
  "pulsz": "/assets/logos/pulsz.png",
  "punt": "/assets/logos/punt.png",
  "qzino": "/assets/logos/qzino.png",
  "rainbet": "/assets/logos/rainbet.png",
  "razed": "/assets/logos/razed.png",
  "realprize": "/assets/logos/realprize.png",
  "rolla": "/assets/logos/rolla.png",
  "rollbit": "/assets/logos/rollbit.png",
  "roobet": "/assets/logos/roobet.png",
  "shock": "/assets/logos/shock.png",
  "shuffle-us": "/assets/logos/shuffle-us.png",
  "shuffle": "/assets/logos/shuffle.png",
  "sixty6": "/assets/logos/sixty6.png",
  "solcasino": "/assets/logos/solcasino.png",
  "spartans": "/assets/logos/spartans.png",
  "sportsbet-io": "/assets/logos/sportsbet-io.png",
  "sportzino": "/assets/logos/sportzino.png",
  "spree": "/assets/logos/spree.png",
  "stake-us": "/assets/logos/stake-us.png",
  "stake": "/assets/logos/stake.png",
  "thrill": "/assets/logos/thrill.png",
  "thrillzz": "/assets/logos/thrillzz.png",
  "toshibet": "/assets/logos/toshibet.png",
  "vave": "/assets/logos/vave.png",
  "wager-com": "/assets/logos/wager-com.png",
  "whale-io": "/assets/logos/whale-io.webp",
  "winna": "/assets/logos/winna.png",
  "wow-vegas": "/assets/logos/wow-vegas.png",
  "yeet": "/assets/logos/yeet.png",
  "zula-casino": "/assets/logos/zula-casino.png",
};

export function logoFor(slug: string): string | null {
  return LOGOS[slug] ?? null;
}

/**
 * Deterministic fallback tint for entities with no per-item brand color
 * of their own (casinos, wallets, exchanges — providers and slots
 * already carry a real `tint` field in their data and should pass that
 * instead). Picks from colors already used elsewhere on the site rather
 * than inventing new ones, varied per slug so a grid of monogram tiles
 * doesn't read as one flat, monotonous block.
 */
const FALLBACK_TINTS = ["#00C2CC", "#9B8FC4", "#C7A45C", "#2FA8B0", "#DA9877", "#7BE0B8", "#6BC7FF", "#FF7EB6"];

export function tintFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return FALLBACK_TINTS[h % FALLBACK_TINTS.length];
}
