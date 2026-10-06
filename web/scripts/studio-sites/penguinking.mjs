import { fetchText, fetchBinary } from "../lib/studio-fetch.mjs";

/**
 * Penguin King (penguinking.com). A Framer site with no page per game: the
 * home page's "Our Games" grid is drawn from a Framer CMS collection, which
 * the page's own module loads from framerusercontent.com/cms/<…>-chunk-
 * default-0.framercms (a binary record file; the module names it as
 * new URL("./<id>-chunk-default-0.framercms", "<module url>") with /modules/
 * turned into /cms/). The reader finds that file through the home page's
 * modules and reads each record's fields, which are length-prefixed
 * (u32 key length, key, one type byte, u32 value length, value):
 *   - xHJqjHcsT: the game's title;
 *   - u55yF2JnN: the game's own title image (logo over the game's art,
 *     472x354 or 960x520 JPEG);
 *   - vEk9nzGhO, zONZstY3C, Sh0CAc2DE: the three layers the card stacks on
 *     hover (a bare backdrop, a character cut-out, a logo on transparency),
 *     none of which is key art on its own.
 * Only the title image is taken, and only a JPEG: three records share one
 * PNG there (ejckL81….png, a placeholder), and older records have none, so
 * those games are left without art rather than given a layer.
 * The item URL is the home page, where the grid sits.
 */
const HOME = "https://www.penguinking.com/";
const CDN = /^https:\/\/framerusercontent\.com\/images\/[A-Za-z0-9]+\.jpe?g(\?|$)/;

function field(buf, key, from, to) {
  const k = Buffer.concat([Buffer.from([0, 0, 0, key.length]), Buffer.from(key)]);
  const i = buf.indexOf(k, from);
  if (i < 0 || i >= to) return null;
  const p = i + k.length + 1;
  if (p + 4 > to) return null;
  const len = buf.readUInt32BE(p);
  return buf.slice(p + 4, p + 4 + len).toString("utf8");
}

async function chunkUrl() {
  const html = (await fetchText(HOME)) ?? "";
  const mods = [...new Set(html.match(/https:\/\/framerusercontent\.com\/sites\/[A-Za-z0-9]+\/[A-Za-z0-9_.-]+\.mjs/g) ?? [])];
  for (const m of mods) {
    const js = (await fetchText(m)) ?? "";
    const hit = js.match(/new URL\(`\.\/([A-Za-z0-9_-]+-chunk-default-0\.framercms)`,`(https:\/\/framerusercontent\.com\/modules\/[^`]+)`\)/);
    if (hit) return new URL(`./${hit[1]}`, hit[2]).href.replace("/modules/", "/cms/");
  }
  return null;
}

export default {
  studio: "Penguin King",
  host: "penguinking.com",
  async list() {
    const url = await chunkUrl();
    const buf = url ? await fetchBinary(url) : null;
    if (!buf) return [];
    // Each record opens with its "id" string field.
    const marker = Buffer.from([0, 0, 0, 2, 0x69, 0x64, 0x0c]);
    const starts = [];
    for (let i = buf.indexOf(marker); i >= 0; i = buf.indexOf(marker, i + 1)) starts.push(i);
    starts.push(buf.length);
    const recs = [];
    for (let r = 0; r < starts.length - 1; r++) {
      const name = field(buf, "xHJqjHcsT", starts[r], starts[r + 1]);
      let image = null;
      try {
        image = JSON.parse(field(buf, "u55yF2JnN", starts[r], starts[r + 1]) ?? "null")?.src ?? null;
      } catch {}
      if (name) recs.push({ url: HOME, name, image });
    }
    const uses = new Map();
    for (const r of recs) if (r.image) uses.set(r.image, (uses.get(r.image) ?? 0) + 1);
    return recs.map((r) => ({ ...r, image: r.image && CDN.test(r.image) && uses.get(r.image) === 1 ? r.image : null }));
  },
  art(_html, item) {
    return { name: item.name, image: item.image };
  },
};
