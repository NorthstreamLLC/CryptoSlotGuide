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
/**
 * Each brand's own square site icon (apple-touch-icon, app icon or press mark), taken from its own
 * domain — casinos and studios on 18 Sep 2026, wallets, exchanges and the remainder on 22 Sep 2026.
 * data/logo-sources.json records the exact URL and size behind every file. Swap in affiliate
 * brand-kit files as they arrive.
 */
const LOGOS: Record<string, string> = {
  "1win": "/assets/logos/1win.png",
  "3-oaks-gaming": "/assets/logos/3-oaks-gaming.png",
  "500-casino": "/assets/logos/500-casino.png",
  "7bit": "/assets/logos/7bit.png",
  "acebet": "/assets/logos/acebet.png",
  "american-luck": "/assets/logos/american-luck.png",
  "avatarux": "/assets/logos/avatarux.png",
  "bc-game": "/assets/logos/bc-game.png",
  "betfury": "/assets/logos/betfury.png",
  "betplay": "/assets/logos/betplay.png",
  "bgaming": "/assets/logos/bgaming.png",
  "big-time-gaming": "/assets/logos/big-time-gaming.png",
  "bitcasino-io": "/assets/logos/bitcasino-io.png",
  "bitstarz": "/assets/logos/bitstarz.png",
  "blueprint-gaming": "/assets/logos/blueprint-gaming.png",
  "bluff": "/assets/logos/bluff.png",
  "booming-games": "/assets/logos/booming-games.png",
  "bybit": "/assets/logos/bybit.png",
  "chumba-casino": "/assets/logos/chumba-casino.png",
  "cloudbet": "/assets/logos/cloudbet.png",
  "coinbase": "/assets/logos/coinbase.png",
  "polymarket": "/assets/logos/polymarket.png",
  "coincasino": "/assets/logos/coincasino.png",
  "crown-coins-casino": "/assets/logos/crown-coins-casino.png",
  "cybet": "/assets/logos/cybet.png",
  "dara-casino": "/assets/logos/dara-casino.png",
  "degen": "/assets/logos/degen.png",
  "degencity": "/assets/logos/degencity.png",
  "dicey": "/assets/logos/dicey.png",
  "duel": "/assets/logos/duel.png",
  "duelbits": "/assets/logos/duelbits.png",
  "dustbit": "/assets/logos/dustbit.png",
  "elk-studios": "/assets/logos/elk-studios.png",
  "endorphina": "/assets/logos/endorphina.png",
  "evolution": "/assets/logos/evolution.png",
  "flush": "/assets/logos/flush.png",
  "fortune-wins": "/assets/logos/fortune-wins.png",
  "fortunejack": "/assets/logos/fortunejack.svg",
  "funrize": "/assets/logos/funrize.png",
  "gamba": "/assets/logos/gamba.png",
  "gamdom": "/assets/logos/gamdom.png",
  "games-global": "/assets/logos/games-global.png",
  "global-poker": "/assets/logos/global-poker.png",
  "goated": "/assets/logos/goated.png",
  "hacksaw-gaming": "/assets/logos/hacksaw-gaming.png",
  "hello-millions": "/assets/logos/hello-millions.png",
  "high-5-casino": "/assets/logos/high-5-casino.png",
  "housebets": "/assets/logos/housebets.png",
  "igt": "/assets/logos/igt.png",
  "jackpotbet": "/assets/logos/jackpotbet.png",
  "kraken": "/assets/logos/kraken.png",
  "kucoin": "/assets/logos/kucoin.png",
  "ledger": "/assets/logos/ledger.png",
  "legendz": "/assets/logos/legendz.png",
  "light-and-wonder": "/assets/logos/light-and-wonder.png",
  "lonestar": "/assets/logos/lonestar.png",
  "luckyland-casino": "/assets/logos/luckyland-casino.png",
  "mbit": "/assets/logos/mbit.png",
  "mcluck": "/assets/logos/mcluck.png",
  "metamask": "/assets/logos/metamask.png",
  "metawin": "/assets/logos/metawin.png",
  "modo": "/assets/logos/modo.webp",
  "moonspin": "/assets/logos/moonspin.png",
  "netent": "/assets/logos/netent.png",
  "nolimit-city": "/assets/logos/nolimit-city.svg",
  "nolimitcoins": "/assets/logos/nolimitcoins.webp",
  "octoplay": "/assets/logos/octoplay.png",
  "okx": "/assets/logos/okx.png",
  "phantom": "/assets/logos/phantom.png",
  "play-n-go": "/assets/logos/play-n-go.png",
  "playson": "/assets/logos/playson.png",
  "playtech": "/assets/logos/playtech.png",
  "pragmatic-play": "/assets/logos/pragmatic-play.png",
  "print-studios": "/assets/logos/print-studios.png",
  "pulsz": "/assets/logos/pulsz.png",
  "punt": "/assets/logos/punt.png",
  "push-gaming": "/assets/logos/push-gaming.png",
  "quickspin": "/assets/logos/quickspin.png",
  "qzino": "/assets/logos/qzino.png",
  "rabby": "/assets/logos/rabby.png",
  "rainbet": "/assets/logos/rainbet.png",
  "razed": "/assets/logos/razed.png",
  "realprize": "/assets/logos/realprize.webp",
  "red-tiger": "/assets/logos/red-tiger.png",
  "relax-gaming": "/assets/logos/relax-gaming.png",
  "rolla": "/assets/logos/rolla.png",
  "rollbit": "/assets/logos/rollbit.png",
  "roobet": "/assets/logos/roobet.png",
  "shock": "/assets/logos/shock.png",
  "shuffle": "/assets/logos/shuffle.png",
  "shuffle-us": "/assets/logos/shuffle-us.png",
  "sixty6": "/assets/logos/sixty6.png",
  "solcasino": "/assets/logos/solcasino.png",
  "spartans": "/assets/logos/spartans.png",
  "sportsbet-io": "/assets/logos/sportsbet-io.png",
  "sportzino": "/assets/logos/sportzino.png",
  "spree": "/assets/logos/spree.png",
  "spribe": "/assets/logos/spribe.png",
  "stake": "/assets/logos/stake.png",
  "stake-us": "/assets/logos/stake-us.png",
  "thrill": "/assets/logos/thrill.png",
  "thrillzz": "/assets/logos/thrillzz.png",
  "thunderkick": "/assets/logos/thunderkick.png",
  "toshibet": "/assets/logos/toshibet.png",
  "trust-wallet": "/assets/logos/trust-wallet.svg",
  "vave": "/assets/logos/vave.png",
  "wager-com": "/assets/logos/wager-com.png",
  "wazdan": "/assets/logos/wazdan.png",
  "whale-io": "/assets/logos/whale-io.webp",
  "winna": "/assets/logos/winna.png",
  "wow-vegas": "/assets/logos/wow-vegas.png",
  "yeet": "/assets/logos/yeet.png",
  "yggdrasil": "/assets/logos/yggdrasil.png",
  "zula-casino": "/assets/logos/zula-casino.png",
};

/**
 * Marks drawn in black or near-black on a transparent ground. On the site's
 * dark tile they were all but invisible (measured: mean luminance under 50
 * across the opaque pixels, with the art covering less than half the square),
 * so these render on a light plate, contained rather than cropped.
 */
const LIGHT_PLATE = new Set([
  "ledger",
  "hacksaw-gaming",
  "relax-gaming",
  "spribe",
  "thunderkick",
  "playtech",
  "wazdan",
  "flush",
]);

export function needsLightPlate(slug: string): boolean {
  return LIGHT_PLATE.has(slug);
}

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
