/**
 * How many pages a visitor can land on without ever meeting Roobet.
 * Crawls the dev server from the sitemap and classifies each page by whether
 * it links to the Roobet profile, names Roobet in the body, or neither.
 */
const BASE = "http://localhost:3001";

const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, BASE));

const groups = new Map();
let done = 0;

async function check(u) {
  let html = "";
  try { html = await (await fetch(u)).text(); } catch { return null; }
  const path = new URL(u).pathname;
  // Only the <main> body counts — header nav and footer link Roobet on every
  // page, so counting those would report 100% coverage and mean nothing.
  const main = (html.match(/<main[\s\S]*?<\/main>/) ?? [html])[0];
  const linked = /href="\/casinos\/roobet"/.test(main);
  const named = /Roobet/.test(main);
  const seg = path === "/" ? "/" : "/" + path.split("/")[1];
  const g = groups.get(seg) ?? { total: 0, linked: 0, named: 0, examples: [] };
  g.total++;
  if (linked) g.linked++;
  if (named) g.named++;
  if (!named && g.examples.length < 2) g.examples.push(path);
  groups.set(seg, g);
  if (++done % 60 === 0) process.stderr.write(`${done}/${urls.length}\r`);
}

// Modest concurrency: the dev server compiles on demand and will drop requests.
for (let i = 0; i < urls.length; i += 6) await Promise.all(urls.slice(i, i + 6).map(check));

const rows = [...groups.entries()].sort((a, b) => b[1].total - a[1].total);
let T = 0, L = 0, N = 0;
console.log("section".padEnd(26), "pages".padStart(6), "linked".padStart(7), "named".padStart(6), "  no mention");
for (const [seg, g] of rows) {
  T += g.total; L += g.linked; N += g.named;
  const gap = g.total - g.named;
  console.log(seg.padEnd(26), String(g.total).padStart(6), String(g.linked).padStart(7), String(g.named).padStart(6), gap ? `  ${gap} — e.g. ${g.examples.join(", ")}` : "  —");
}
console.log("\n" + "TOTAL".padEnd(26), String(T).padStart(6), String(L).padStart(7), String(N).padStart(6));
console.log(`\n${T - N} of ${T} pages (${Math.round(((T - N) / T) * 100)}%) never mention Roobet in the body.`);
