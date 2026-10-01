/**
 * Reads Push Gaming's published RTP configurations off their own game pages
 * into data/slot-rtp-overrides.json.
 *
 * Push licenses most titles at more than one return and says so on each game
 * page, under a heading that reads "RTP's may vary per casino. The RTP of the
 * game can be found in the user panel and on the game loading screen." Our
 * catalogue import carried only one number per title and none of the spread —
 * 93 Push slots, zero with variants — so the thing that makes a slot page
 * worth reading was missing for all of them.
 *
 * The studio's own page beats the third-party feed outright. It already
 * caught the feed being wrong: Big Bamboo arrived as a single 95.11%, and
 * Push publishes 96.13% and 94.13%, neither of which is 95.11%.
 *
 * THE HIGHER FIGURE IS THE HEADLINE, the rest are the spread. That matches
 * how the catalogue already stores `rtp` and how the slot pages read: best
 * published first, with the drop underneath.
 *
 * Extraction is scoped to the RTPs block, not the page. 3 Liberty Eagles has
 * a 92.10 elsewhere in its markup that is not one of its returns, and a
 * page-wide number grab would have published it as one.
 *
 *   node scripts/fetch-push-rtps.mjs --dry-run
 *   node scripts/fetch-push-rtps.mjs
 *   node scripts/fetch-push-rtps.mjs --only big-bamboo
 */
import fs from "node:fs";
import path from "node:path";

const CATALOGUE = path.join("data", "gameCatalogue.json");
const OUT = path.join("data", "slot-rtp-overrides.json");
const BASE = "https://www.pushgaming.com/games";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry-run");
const ONLY = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;

const slots = JSON.parse(fs.readFileSync(CATALOGUE, "utf8")).games.filter(
  (g) => g.kind === "slot" && g.provider === "Push Gaming" && g.slug && (!ONLY || g.slug === ONLY)
);

const flat = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#0?39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ");

/**
 * The returns Push publishes for one title, highest first.
 *
 * Bounded to the RTPs section: it starts at the "RTPs" heading and ends at
 * the next all-caps section label. Numbers outside it are not returns.
 */
function rtpsFrom(html) {
  const t = flat(html);
  // Anchor on the sentence, not the heading. Some pages label the section
  // "RTPs" and some "RTP", and keying off the plural lost 44 of 93 titles;
  // this line is identical on every one of them.
  const start = t.search(/RTP'?s? may vary per casino/i);
  if (start < 0) return null;
  const rest = t.slice(start, start + 700);
  const end = rest.search(/GAME CATEGORY|Push Actions|MAX WIN|VOLATILITY|Volatility|RELEASE|Highest|Discover/i);
  const block = end > 0 ? rest.slice(0, end) : rest;
  const nums = [...new Set([...block.matchAll(/(\d{2}\.\d{1,2})\s*%/g)].map((m) => Number(m[1])))]
    .filter((n) => n >= 80 && n <= 100)
    .sort((a, b) => b - a);
  return nums.length ? nums : null;
}

const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { note: "", overrides: {} };
const overrides = { ...existing.overrides };

let added = 0;
let single = 0;
let missing = 0;
const changed = [];

for (let i = 0; i < slots.length; i += 4) {
  await Promise.all(
    slots.slice(i, i + 4).map(async (g) => {
      const url = `${BASE}/${g.slug}.html`;
      let rtps = null;
      try {
        const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
        if (r.ok) rtps = rtpsFrom(await r.text());
      } catch {}
      if (!rtps) {
        // 40 of the 93 are 404 on Push's current site — delisted, renamed,
        // or carrying a slug the catalogue spells differently. Counted, not
        // guessed at: inventing a URL would attribute one game's returns to
        // another.
        missing++;
        return;
      }
      if (rtps.length === 1) single++;
      // Worth flagging: where the feed's figure is not one Push publishes,
      // the feed is wrong and the page would have shown a number no casino
      // can be running.
      if (typeof g.rtp === "number" && !rtps.includes(g.rtp)) changed.push({ name: g.name, feed: g.rtp, push: rtps });
      overrides[g.slug] = {
        // Every figure is the studio's own; nothing here comes from the catalogue feed.
        versionsFrom: "studio",
        versions: rtps,
        studio: "Push Gaming",
        sourceUrl: url,
        read: new Date().toISOString().slice(0, 10),
        reason:
          rtps.length > 1
            ? `Push Gaming publishes ${rtps.length} returns for this title on its own game page. The catalogue import carried one figure and no spread.`
            : "Push Gaming publishes a single return for this title on its own game page.",
      };
      added++;
    })
  );
  process.stderr.write(`  ${Math.min(i + 4, slots.length)}/${slots.length}\r`);
}

console.log(`\n  ${added} titles read · ${single} publish one return · ${missing} no RTPs block found`);
if (changed.length) {
  console.log(`\n  feed figure is NOT among Push's published returns (${changed.length}):`);
  for (const c of changed.slice(0, 12)) console.log(`     ${c.name.padEnd(28)} feed ${c.feed}  vs Push ${c.push.join(" / ")}`);
}

if (DRY) {
  console.log("\n  --dry-run: nothing written");
} else {
  fs.writeFileSync(OUT, JSON.stringify({ ...existing, overrides }, null, 2) + "\n");
  console.log(`\n  wrote ${OUT} — ${Object.keys(overrides).length} overrides total`);
}
