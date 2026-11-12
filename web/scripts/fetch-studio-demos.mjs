/**
 * Adds free demos from studios that publish them on their own game pages to
 * data/slot-demos.json: Play'n GO, BGaming, ELK Studios, Habanero, Thunderkick,
 * Endorphina, Yggdrasil, Quickspin, Kalamba Games, Betsoft and Microgaming. (Wazdan's demo
 * launcher redirects every visitor to wazdan.com, so it cannot be played here.) For each
 * studio, its own sitemap lists the game pages; each page carries the id its
 * "play demo" button opens. Only titles we hold a catalogue entry for are
 * kept, under our slug, matched by name.
 *
 * Run: node scripts/fetch-studio-demos.mjs [studio ...]
 * (Pragmatic Play and Hacksaw Gaming have their own scripts.)
 *
 * /demo/<studio>/<id> (app/demo) turns the id into the studio's demo URL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(web, "data/slot-demos.json");
const cat = JSON.parse(fs.readFileSync(path.join(web, "data/gameCatalogue.json"), "utf8"));
const games = Array.isArray(cat) ? cat : cat.games ?? Object.values(cat).find(Array.isArray);
const key = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const UA = { headers: { "User-Agent": "Mozilla/5.0 (compatible; CryptoSlotGuide demo index)" } };
const get = async (u) => (await fetch(u, UA)).text();

const STUDIOS = {
  betsoft: {
    provider: /^betsoft/i,
    sitemaps: ["https://betsoft.com/games-sitemap1.xml", "https://betsoft.com/games-sitemap2.xml"],
    page: /^https:\/\/betsoft\.com\/games\/[^/]+\/?$/,
    // Two steps: the game page names its demo page, whose frame carries the game id.
    id: async (html) => {
      const demoPage = html.match(/play-demo\/?\?id=(\d+)/)?.[1];
      if (!demoPage) return undefined;
      return (await get(`https://betsoft.com/play-demo/?id=${demoPage}`)).match(/cwguestlogin\.do\?bankId=675(?:&amp;|&)(?:amp;)?CDN=AUTO(?:&amp;|&)(?:amp;)?gameId=(\d+)/)?.[1];
    },
  },
  microgaming: {
    provider: /^microgaming/i,
    sitemaps: ["https://microgaming.io/game-sitemap1.xml", "https://microgaming.io/game-sitemap2.xml"],
    page: /^https:\/\/microgaming\.io\/game\/[^/]+\/?$/,
    // The page's post id; /demo/microgaming asks microgaming.io's own API for
    // the demo link at play time, because its launch host changes.
    id: (html) => html.match(/postId:\s*(\d+)/)?.[1],
  },
  habanero: {
    provider: /^habanero$/i,
    sitemaps: ["https://habanerosystems.com/sitemap.xml"],
    page: /^https:\/\/(www\.)?habanerosystems\.com\/games\/SG[A-Za-z0-9]+\/?$/,
    // The page's own key is the game name after "SG": SGBattleTheBeast.
    name: (url) => url.replace(/\/$/, "").split("/").at(-1).replace(/^SG/, ""),
    id: (html) => html.match(/data-game-launch="(SG[A-Za-z0-9]+)"/)?.[1],
  },
  thunderkick: {
    provider: /^thunderkick$/i,
    sitemaps: ["https://www.thunderkick.com/games-sitemap.xml"],
    page: /^https:\/\/www\.thunderkick\.com\/games\/[^/]+\/?$/,
    id: (html) => html.match(/gamelauncher\\?\/play\\?\/generic\?device=desktop(?:&amp;|&|\\u0026)(?:#038;|amp;)?gameId=([A-Za-z0-9-]+)/)?.[1],
  },
  endorphina: {
    provider: /^endorphina$/i,
    sitemaps: ["https://endorphina.com/sitemap.xml"],
    page: /^https:\/\/endorphina\.com\/games\/[a-z0-9-]+\/?$/,
    // The demo is the page's own /play address; keep the slug where the page links it.
    id: (html) => html.match(/href="\/games\/([a-z0-9-]+)\/play"/)?.[1],
  },
  yggdrasil: {
    provider: /^yggdrasil/i,
    sitemaps: ["https://yggdrasilgaming.com/games-sitemap.xml"],
    page: /^https:\/\/(www\.)?yggdrasilgaming\.com\/games\/[^/]+\/?$/,
    id: (html) => html.match(/data-iframe-src="[^"]*gameid=(\d+)/)?.[1] ?? html.match(/data-iframe-src="[^"]*staticdemo[^"]*\/(\d+)\/index\.html/)?.[1],
  },
  quickspin: {
    provider: /^quickspin$/i,
    sitemaps: ["https://quickspin.com/games-sitemap.xml"],
    page: /^https:\/\/(www\.)?quickspin\.com\/slots\/[^/]+\/?$/,
    id: (html) => html.match(/cloudfront\.net\/casino\/quickspin\/([a-z0-9]+)\/index\.html/)?.[1],
  },
  kalamba: {
    provider: /^kalamba/i,
    sitemaps: ["https://kalambagames.com/project-sitemap.xml"],
    page: /^https:\/\/kalambagames\.com\/[a-z0-9-]+_?\/?$/,
    id: (html) => html.match(/demo\.kalambagames\.com\/games\/url\/\?gameCode=([a-z0-9-]+)/)?.[1],
  },
  playngo: {
    provider: /^play'?n ?go$/i,
    sitemaps: ["https://www.playngo.com/sitemap.xml"],
    page: /^https:\/\/www\.playngo\.com\/games\/[^/]+$/,
    id: (html) => html.match(/ContainerLauncher\?pid=2(?:&amp;|&|\\u0026)gid=([a-z0-9]+)/i)?.[1],
  },
  bgaming: {
    provider: /^bgaming$/i,
    sitemaps: ["https://bgaming.com/game-sitemap.xml"],
    page: /^https:\/\/bgaming\.com\/games\/[^/]+\/?$/,
    // A page can carry another game's demo link; keep it only if the id names this game.
    id: (html, slugKey) => {
      const id = html.match(/demo\.bgaming-network\.com\/play\/([A-Za-z0-9_]+)\/FUN/)?.[1];
      return id && key(id).slice(0, 5) === slugKey.slice(0, 5) ? id : undefined;
    },
  },
  elk: {
    provider: /^elk/i,
    sitemaps: ["https://www.elk-studios.com/game-sitemap.xml"],
    page: /^https:\/\/www\.elk-studios\.com\/games\/[^/]+\/?$/,
    // ELK's pages also launch other games' demos, so each candidate is opened
    // and kept only if the launcher names this game.
    id: async (html, slugKey) => {
      for (const id of [...new Set([...html.matchAll(/gameid=(\d+)(?:&amp;|&|&#038;)operatorid=44/g)].map((m) => m[1]))]) {
        const r = await fetch(`https://gamelauncher-stage.contentmedia.eu/1.0/game/?gameid=${id}&operatorid=44&mode=demo&currency=EUR&device=desktop&token=EUR_1597926622061&language=en_gb`, { ...UA, redirect: "manual" });
        const name = new URL(r.headers.get("location") ?? "https://x/?").searchParams.get("gamename");
        if (name && key(name) === slugKey) return id;
      }
      return undefined;
    },
  },
};

const want = process.argv.slice(2);
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
for (const [studio, cfg] of Object.entries(STUDIOS)) {
  if (want.length && !want.includes(studio)) continue;
  const ours = new Map(games.filter((g) => cfg.provider.test(g.provider ?? "")).map((g) => [key(g.name), g.slug]));
  const pages = new Set();
  for (const m of cfg.sitemaps) for (const u of (await get(m)).match(/<loc>[^<]+<\/loc>/g) ?? []) {
    const url = u.replace(/<\/?loc>/g, "").trim();
    if (cfg.page.test(url)) pages.add(url);
  }
  const todo = [...pages]
    .map((url) => {
      const last = (cfg.name ? cfg.name(url) : url.replace(/\/$/, "").split("/").at(-1)).replace(/-(slot|demo)$/, "");
      return { url, k: key(last), slug: ours.get(key(last)) };
    })
    .filter((x) => x.slug);
  const found = {};
  for (let i = 0; i < todo.length; i += 6) {
    await Promise.all(
      todo.slice(i, i + 6).map(async ({ url, k, slug }) => {
        try {
          const id = await cfg.id(await get(url), k);
          if (id) found[slug] ??= id;
        } catch {
          /* a page that fails is picked up by the next run */
        }
      })
    );
  }
  prev[studio] = Object.fromEntries(Object.entries({ ...(prev[studio] ?? {}), ...found }).sort(([a], [b]) => a.localeCompare(b)));
  console.log(`${studio}: ${pages.size} game pages, ${todo.length} match our catalogue (${ours.size} titles), ${Object.keys(found).length} demos found`);
}
fs.writeFileSync(out, JSON.stringify(prev, null, 2) + "\n");
