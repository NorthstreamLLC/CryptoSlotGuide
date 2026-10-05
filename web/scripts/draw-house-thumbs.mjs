#!/usr/bin/env node
/**
 * Draws a thumbnail for each house game into public/assets/house/thumbs.
 *
 * House games have no studio art: every casino draws its own Dice and Crash,
 * and a screenshot of one is that casino's artwork. So each game gets an
 * illustration of its own mechanic, drawn here — the dice faces, the crash
 * curve, the plinko pegs — on a ground tinted with the game's colour from
 * data/houseGames.json. Plain SVG files, so the same thumbnail serves the
 * index cards, the game pages and the menu; a PNG copy serves link previews.
 *
 * Usage, from web/: node scripts/draw-house-thumbs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join("public", "assets", "house", "thumbs");
fs.mkdirSync(OUT, { recursive: true });
const games = JSON.parse(fs.readFileSync(path.join("data", "houseGames.json"), "utf8"));

const W = 320, H = 200;

/** The shared frame: tinted ground, a soft light, a faint grid. */
const frame = (tint, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="72%" cy="22%" r="85%">
      <stop offset="0" stop-color="${tint}" stop-opacity=".55"/>
      <stop offset=".55" stop-color="${tint}" stop-opacity=".14"/>
      <stop offset="1" stop-color="#0A0E11" stop-opacity="0"/>
    </radialGradient>
    <pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M16 0H0V16" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#0C1114"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#p)"/>
  ${body}
</svg>
`;

const pip = (cx, cy, r = 6.5) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#0C1114"/>`;

const DRAW = {
  dice: (t) => `
  <g transform="translate(92 52) rotate(-12 48 48)">
    <rect width="96" height="96" rx="20" fill="#fff"/>
    ${pip(26, 26)}${pip(70, 26)}${pip(48, 48)}${pip(26, 70)}${pip(70, 70)}
  </g>
  <g transform="translate(176 72) rotate(14 40 40)">
    <rect width="80" height="80" rx="17" fill="${t}"/>
    ${pip(22, 22, 6)}${pip(58, 22, 6)}${pip(22, 58, 6)}${pip(58, 58, 6)}
  </g>`,

  crash: (t) => `
  <path d="M28 172 C 120 168, 180 140, 230 70" fill="none" stroke="${t}" stroke-width="6" stroke-linecap="round"/>
  <path d="M28 172 C 120 168, 180 140, 230 70 L 230 172 Z" fill="${t}" fill-opacity=".18"/>
  <g transform="translate(230 70) rotate(-48)">
    <path d="M0 -20 C 10 -8, 10 8, 6 18 L -6 18 C -10 8, -10 -8, 0 -20 Z" fill="#fff"/>
    <circle cy="-2" r="4" fill="${t}"/>
    <path d="M-6 18 L -12 26 L -4 22 Z M6 18 L 12 26 L 4 22 Z" fill="#fff"/>
    <path d="M-3 20 L 0 34 L 3 20 Z" fill="#FFC531"/>
  </g>
  <text x="304" y="150" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#fff">4.20×</text>`,

  plinko: (t) => {
    let pegs = "";
    for (let r = 0; r < 7; r++) for (let i = 0; i <= r + 2; i++) pegs += `<circle cx="${160 - (r + 2) * 13 + i * 26}" cy="${28 + r * 19}" r="3.6" fill="#fff" fill-opacity=".85"/>`;
    const slots = [5.6, 2.1, 1.1, 0.5, 1.1, 2.1, 5.6]
      .map((_m, i) => `<rect x="${76 + i * 24}" y="166" width="21" height="20" rx="4" fill="${i === 0 || i === 6 ? "#FFC531" : t}" fill-opacity="${i === 3 ? 0.45 : 0.9}"/>`)
      .join("");
    return `${pegs}${slots}<circle cx="173" cy="84" r="8" fill="#FFC531"/>`;
  },

  mines: (t) => {
    let cells = "";
    const gem = new Set([1, 6, 8, 12]), mine = new Set([13]);
    for (let i = 0; i < 20; i++) {
      const x = 80 + (i % 5) * 34, y = 22 + Math.floor(i / 5) * 40;
      const open = gem.has(i) || mine.has(i);
      cells += `<rect x="${x}" y="${y}" width="28" height="34" rx="6" fill="${open ? "#0A0E11" : "#fff"}" fill-opacity="${open ? 0.7 : 0.14}" stroke="${open ? t : "#fff"}" stroke-opacity="${open ? 0.9 : 0.12}"/>`;
      if (gem.has(i)) cells += `<path d="M${x + 14} ${y + 8} l9 9 -9 11 -9 -11 z" fill="${t}"/>`;
      if (mine.has(i)) cells += `<circle cx="${x + 14}" cy="${y + 18}" r="8" fill="#E5484D"/><path d="M${x + 14} ${y + 6} v4 M${x + 14} ${y + 26} v4 M${x + 2} ${y + 18} h4 M${x + 22} ${y + 18} h4" stroke="#E5484D" stroke-width="2.5"/>`;
    }
    return cells;
  },

  limbo: (t) => `
  <circle cx="160" cy="100" r="66" fill="none" stroke="${t}" stroke-opacity=".35" stroke-width="2"/>
  <circle cx="160" cy="100" r="48" fill="none" stroke="${t}" stroke-opacity=".6" stroke-width="2"/>
  <circle cx="160" cy="100" r="30" fill="${t}" fill-opacity=".22" stroke="${t}" stroke-width="2"/>
  <text x="160" y="112" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="#fff">2.00×</text>
  <path d="M40 160 L 110 120" stroke="#FFC531" stroke-width="4" stroke-linecap="round"/>
  <path d="M110 120 l-14 1 8 11 z" fill="#FFC531"/>`,

  keno: (t) => {
    let g = "";
    const picked = new Set([3, 9, 14, 20, 27, 31]), hit = new Set([9, 20, 31]);
    for (let i = 0; i < 40; i++) {
      const x = 52 + (i % 8) * 28, y = 22 + Math.floor(i / 8) * 32;
      const p = picked.has(i), h = hit.has(i);
      g += `<rect x="${x}" y="${y}" width="24" height="26" rx="5" fill="${h ? "#FFC531" : p ? t : "#fff"}" fill-opacity="${h ? 1 : p ? 0.85 : 0.1}"/>`;
      g += `<text x="${x + 12}" y="${y + 17}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="${h || p ? "#0C1114" : "#fff"}" fill-opacity="${h || p ? 1 : 0.45}">${i + 1}</text>`;
    }
    return g;
  },

  "hi-lo": (t) => `
  <g transform="translate(96 40) rotate(-9 44 62)">
    <rect width="88" height="124" rx="12" fill="#fff"/>
    <text x="14" y="34" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="#C62F3B">7</text>
    <text x="44" y="86" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="44" fill="#C62F3B">♥</text>
  </g>
  <g transform="translate(150 46) rotate(8 44 62)">
    <rect width="88" height="124" rx="12" fill="${t}"/>
    <rect x="8" y="8" width="72" height="108" rx="8" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
    <text x="44" y="78" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800" fill="#fff">?</text>
  </g>
  <path d="M268 74 l12 -16 12 16 z" fill="#57B98C"/>
  <path d="M268 132 l12 16 12 -16 z" fill="#E5484D"/>`,

  wheel: (t) => {
    const n = 12, cx = 160, cy = 104, r = 78;
    let seg = "";
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const fill = i % 4 === 0 ? "#FFC531" : i % 2 === 0 ? t : "#fff";
      const op = i % 2 === 0 ? 0.95 : 0.16;
      seg += `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${fill}" fill-opacity="${op}" stroke="#0C1114" stroke-width="2"/>`;
    }
    return `${seg}<circle cx="${cx}" cy="${cy}" r="16" fill="#0C1114" stroke="#fff" stroke-opacity=".6" stroke-width="2"/><path d="M${cx} 14 l-10 -10 h20 z" fill="#fff"/>`;
  },
};

let n = 0;
for (const g of games) {
  const draw = DRAW[g.slug];
  if (!draw) {
    console.log(`  no drawing for ${g.slug}`);
    continue;
  }
  const svg = frame(g.tint, draw(g.tint));
  fs.writeFileSync(path.join(OUT, `${g.slug}.svg`), svg);
  // Link previews (Open Graph, X) don't take SVG: a PNG at preview size.
  await sharp(Buffer.from(svg), { density: 360 }).resize(1200, 750).png({ compressionLevel: 9 }).toFile(path.join(OUT, `${g.slug}.png`));
  n++;
}
console.log(`drew ${n} thumbnails into ${OUT}`);
