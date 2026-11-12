import demos from "@/data/slot-demos.json";

/**
 * The studios whose free demos we open, and how each one's demo URL is built
 * from the id on file (data/slot-demos.json, filled by the scripts named
 * below from each studio's own game pages). Shared by the slot pages
 * (lib/slot-demos.ts) and the redirect route (app/demo).
 */
export interface DemoStudio {
  /** The studio's name as the catalogue spells it. */
  name: string;
  /** What a valid id looks like, checked before anything is built from it. */
  idPattern: RegExp;
  /** The studio's own demo URL for an id; Hacksaw's needs its current build, looked up by the route. */
  url?: (id: string) => string;
  /** How long the redirect may be cached, in seconds. */
  cache: number;
}

export const DEMO_STUDIOS: Record<string, DemoStudio> = {
  // scripts/fetch-pragmatic-demos.mjs
  pragmatic: {
    name: "Pragmatic Play",
    idPattern: /^[a-z0-9]{3,40}$/,
    url: (id) => `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${id}&websiteUrl=https%3A%2F%2Fwww.pragmaticplay.com&jurisdiction=99&lobby_url=https%3A%2F%2Fwww.pragmaticplay.com&lang=EN&cur=USD`,
    cache: 86400,
  },
  // scripts/fetch-hacksaw-demos.mjs; the build comes from version.json (app/demo)
  hacksaw: { name: "Hacksaw Gaming", idPattern: /^\d{1,6}$/, cache: 3600 },
  // scripts/fetch-studio-demos.mjs
  playngo: {
    name: "Play'n GO",
    idPattern: /^[a-z0-9]{2,40}$/i,
    url: (id) => `https://released.playngonetwork.com/casino/ContainerLauncher?pid=2&gid=${id}&lang=en_GB&practice=1&channel=desktop&demo=2`,
    cache: 86400,
  },
  // Wazdan publishes demo links too, but its launcher sends every visitor back
  // to wazdan.com, so they cannot play on our page.
  bgaming: {
    name: "BGaming",
    idPattern: /^[A-Za-z0-9_]{2,60}$/,
    url: (id) => `https://demo.bgaming-network.com/play/${id}/FUN?server=demo`,
    cache: 86400,
  },
  elk: {
    name: "ELK Studios",
    idPattern: /^\d{1,8}$/,
    url: (id) => `https://gamelauncher-stage.contentmedia.eu/1.0/game/?gameid=${id}&operatorid=44&mode=demo&currency=EUR&device=desktop&token=EUR_1597926622061&language=en_gb`,
    cache: 86400,
  },
  habanero: {
    name: "Habanero",
    idPattern: /^SG[A-Za-z0-9]{2,60}$/,
    url: (id) => `https://app-test.insvr.com/games/?brandid=a9d542ac-c9bb-e311-93f6-80c16e0883f4&keyname=${id}&mode=fun&locale=en&nofunplaymessage=1&ifrm=1`,
    cache: 86400,
  },
  thunderkick: {
    name: "Thunderkick",
    idPattern: /^[A-Za-z0-9-]{3,60}$/,
    url: (id) => `https://forfun.thunderkick.com/gamelauncher/play/generic?device=desktop&gameId=${id}&operatorId=2&playMode=demo`,
    cache: 86400,
  },
  // Endorphina's /play page starts a fresh demo session each time, so it is never cached for long.
  endorphina: { name: "Endorphina", idPattern: /^[a-z0-9-]{2,80}$/, url: (id) => `https://endorphina.com/games/${id}/play`, cache: 300 },
  yggdrasil: {
    name: "Yggdrasil",
    idPattern: /^\d{3,8}$/,
    url: (id) => `https://staticdemo.yggdrasilgaming.com/init/launchClient.html?gameid=${id}&lang=en&currency=EUR&org=Demo&key=&fullscreen=yes`,
    cache: 86400,
  },
  quickspin: {
    name: "Quickspin",
    idPattern: /^[a-z0-9]{2,60}$/,
    url: (id) => `https://d1oij17g4yikkz.cloudfront.net/casino/quickspin/${id}/index.html?gameid=${id}&moneymode=fun&partnerid=quickspin`,
    cache: 86400,
  },
  kalamba: {
    name: "Kalamba Games",
    idPattern: /^[a-z0-9-]{2,80}$/,
    url: (id) => `https://kalamba-for-kl.integration.demo.kalambagames.com/games/url/?gameCode=${id}&cageCode=FUN&currency=EUR`,
    cache: 86400,
  },
};

/** slug -> id, per studio. */
export const DEMO_IDS = demos as unknown as Record<string, Record<string, string | number>>;

/** Is this id one we hold for that studio? Only those are ever redirected. */
const KNOWN = new Map(Object.entries(DEMO_IDS).map(([st, ids]) => [st, new Set(Object.values(ids).map(String))]));
export const isKnownDemo = (studio: string, id: string) => !!DEMO_STUDIOS[studio]?.idPattern.test(id) && !!KNOWN.get(studio)?.has(id);
