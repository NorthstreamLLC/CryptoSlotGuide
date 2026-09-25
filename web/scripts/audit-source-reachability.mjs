/**
 * Can a scheduled job actually re-read our sources, or do they block bots?
 * This decides whether re-checking can be automated or has to be human work,
 * so it is worth measuring rather than assuming either way.
 */
import fs from "node:fs";
const spec = JSON.parse(fs.readFileSync("data/casinoSpecSheets.json", "utf8"));
const urls = new Map();
for (const op of spec) for (const g of op.groups) for (const f of g.facts) {
  if (!f.sourceUrl) continue;
  const host = new URL(f.sourceUrl).hostname.replace(/^www\./, "");
  if (!urls.has(host)) urls.set(host, f.sourceUrl);
}
const hosts = [...urls.entries()];
console.log(`${hosts.length} distinct source domains\n`);

let ok = 0, blocked = 0, dead = 0;
const rows = [];
for (let i = 0; i < hosts.length; i += 8) {
  await Promise.all(hosts.slice(i, i + 8).map(async ([host, url]) => {
    const ctl = AbortSignal.timeout(12000);
    try {
      const r = await fetch(url, { signal: ctl, redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 (compatible; CryptoSlotGuide-freshness/1.0)" } });
      const body = await r.text();
      // A 200 that returns a JS shell or a challenge page is not usable content.
      const challenge = /just a moment|cf-browser-verification|enable javascript and cookies|attention required/i.test(body);
      const thin = body.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").trim().length < 800;
      const verdict = !r.ok ? `HTTP ${r.status}` : challenge ? "challenge" : thin ? "thin/JS-only" : "readable";
      if (verdict === "readable") ok++; else if (verdict === "challenge" || verdict === "thin/JS-only") blocked++; else dead++;
      rows.push([verdict, host]);
    } catch (e) {
      dead++; rows.push([e.name === "TimeoutError" ? "timeout" : "error", host]);
    }
  }));
}
rows.sort();
for (const [v, h] of rows) console.log(`  ${v.padEnd(13)} ${h}`);
console.log(`\nreadable ${ok} · blocked ${blocked} · unreachable ${dead}  (of ${hosts.length})`);
