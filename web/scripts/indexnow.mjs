#!/usr/bin/env node
/**
 * Tell Bing (and the other IndexNow engines: Yandex, Seznam, Naver; DuckDuckGo
 * reads Bing's index) that pages are new or changed, instead of waiting for a
 * crawl. Run after a deploy is live, never during the build: the engines fetch
 * the pages straight away.
 *
 *   node scripts/indexnow.mjs /guides/some-new-guide /casinos/thrill
 *   node scripts/indexnow.mjs --all     # every URL in the live sitemap
 *
 * The key is the file public/<key>.txt, which proves we own the host.
 */
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const HOST = "cryptoslotguide.com";
const SITE = `https://${HOST}`;
const pub = fileURLToPath(new URL("../public/", import.meta.url));
const keyFile = readdirSync(pub).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("No IndexNow key file in public/");
const key = keyFile.slice(0, -4);

const args = process.argv.slice(2);
let urls;
if (args.includes("--all")) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
} else {
  urls = args.map((p) => (p.startsWith("http") ? p : SITE + (p.startsWith("/") ? p : `/${p}`)));
}
if (!urls.length) {
  console.error("Usage: node scripts/indexnow.mjs <path>... | --all");
  process.exit(1);
}

// IndexNow takes up to 10,000 URLs per request.
for (let i = 0; i < urls.length; i += 10000) {
  const urlList = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList }),
  });
  console.log(`IndexNow: ${urlList.length} URLs -> HTTP ${res.status} ${res.statusText}`);
  if (res.status >= 400) console.log(await res.text());
}
