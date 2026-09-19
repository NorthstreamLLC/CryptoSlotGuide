// Builds data/changelog.json: per casino, which cited facts changed and when, by walking the git
// history of the spec sheets and offer data. Run from web/: `node scripts/build-changelog.mjs`.
// Only real value changes are kept (not reformatting), and the first time a fact appears is skipped
// so the log reads as "what changed at the casino", not "when we first recorded it".
import { execSync } from "node:child_process";
import fs from "node:fs";

const FILES = ["data/casinoSpecSheets.json", "data/ops.json"];
const sh = (c) => execSync(c, { encoding: "utf8", maxBuffer: 1 << 28 });
const commits = sh(`git log --reverse "--format=%H %ad" --date=short -- ${FILES.join(" ")}`).trim().split("\n").map((l) => l.split(" "));

const norm = (v) => (v == null ? null : Array.isArray(v) ? v.join(", ") : String(v)).replace(/\s+/g, " ").trim();
function snapshot(hash) {
  const out = {};
  try {
    for (const e of JSON.parse(sh(`git show ${hash}:web/data/casinoSpecSheets.json`)))
      for (const g of e.groups) for (const f of g.facts) out[`${e.operatorSlug}|${g.title}|${f.label}`] = norm(f.value ?? f.chips);
  } catch {}
  try {
    for (const o of JSON.parse(sh(`git show ${hash}:web/data/ops.json`))) out[`${o.slug}|Offer|Headline offer`] = norm(o.bonusShort ?? o.bonus);
  } catch {}
  return out;
}

const WATCH = /Standing offer|Headline offer|Wagering|Rakeback|Cashback|Reload|Leaderboards|Weekly raffle|Prize draws|VIP|Withdrawal limits|Stated withdrawal time|Minimum deposit|Minimum withdrawal|Partners|Prediction markets|Max cashout|Expiry/;
const log = {};
let prev = null;
for (const [hash, date] of commits) {
  const cur = snapshot(hash);
  if (prev) {
    for (const [k, v] of Object.entries(cur)) {
      const before = prev[k];
      if (before == null || v == null || before === v) continue;
      const [slug, group, label] = k.split("|");
      if (!WATCH.test(label)) continue;
      // Keep only real changes at the casino: a figure (amount, %, multiplier, count) differs, not just wording.
      const nums = (t) => [...new Set((t.match(/\$?\d[\d,.]*\s?(?:%|x|×|k|K|M|million|BTC|USDT|SC)?/g) ?? []).map((n) => n.replace(/[,\s]/g, "").toLowerCase()))].sort().join("|");
      if (nums(before) === nums(v)) continue;
      (log[slug] ??= []).push({ date, group, label, from: before.slice(0, 240), to: v.slice(0, 240) });
    }
  }
  prev = cur;
}
for (const s of Object.keys(log)) log[s] = log[s].reverse().slice(0, 25);
fs.writeFileSync("data/changelog.json", JSON.stringify(log, null, 1) + "\n");
console.log(Object.keys(log).length, "casinos,", Object.values(log).reduce((n, l) => n + l.length, 0), "changes");
