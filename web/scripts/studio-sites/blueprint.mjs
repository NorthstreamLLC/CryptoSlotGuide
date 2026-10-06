import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { UA, meta, h1 } from "../lib/studio-fetch.mjs";

/**
 * Blueprint Gaming (blueprintgaming.com, Laravel). There is no sitemap; the
 * /games page fills its grid by POSTing its own search form (with the
 * session's CSRF token) to /games-list, which returns every public game as
 * an <a href="/games/<slug>"> tile. That one listing call is made here with
 * curl and a cookie jar, as the page itself does; the game pages are then
 * plain GETs. (The site's 18+ prompt is a localStorage modal only; the HTML
 * is served to everyone.)
 *
 * Each game page's og:image is the game's own key art (logo + characters)
 * at 1200px wide, on Blueprint's own S3 bucket (bpgwebsite.s3...), the same
 * file the listing shows as a 530x530 tile. The 0x550 gallery files on the
 * page are in-game screenshots, not key art.
 */
const BASE = "https://blueprintgaming.com";
const JAR = path.join(process.env.TEMP || process.env.TMP || ".", "csg-studio-art", "blueprint-cookies.txt");

function curl(args) {
  return new Promise((resolve) => {
    execFile(
      "curl",
      ["-sL", "-A", UA, "-c", JAR, "-b", JAR, "--connect-timeout", "10", "-m", "90", ...args],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
      (_e, out) => resolve(out ?? "")
    );
  });
}

export default {
  studio: "Blueprint Gaming",
  host: "blueprintgaming.com",
  async list() {
    fs.mkdirSync(path.dirname(JAR), { recursive: true });
    const page = await curl([`${BASE}/games`]);
    const token = (page.match(/name="_token" value="([^"]+)"/) ?? [])[1];
    if (!token) return [];
    const body = `_token=${encodeURIComponent(token)}&display_option=PUBLIC&section=ALL&q=`;
    const list = await curl(["-X", "POST", "-H", "X-Requested-With: XMLHttpRequest", "--data", body, `${BASE}/games-list`]);
    const slugs = [...new Set([...list.matchAll(/href="(?:https:\/\/blueprintgaming\.com)?\/games\/([^"?#/]+)"/g)].map((m) => m[1]))];
    return slugs.map((s) => ({ url: `${BASE}/games/${s}` }));
  },
  art(html) {
    const name = h1(html) || meta(html, "og:title") || "";
    const og = meta(html, "og:image");
    const image = og && /bpgwebsite\.s3[^/]*\/public\/games\//.test(og) ? og : null;
    return { name, image };
  },
};
