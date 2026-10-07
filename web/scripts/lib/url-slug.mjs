/**
 * A catalogue slug made safe for a URL. The feed's slugs are mostly clean,
 * but a few carry the title's punctuation ("blade-&-fangs", "caishen's-gold",
 * "plinko+", "Macarons"): an "&" left raw in sitemap.xml makes the whole file
 * invalid XML, and a page at such an address fails to resolve. Same rule the
 * titles use: "&" is "and", "+" is "plus", other punctuation goes, lower case throughout.
 */
export function urlSlug(slug) {
  return String(slug)
    .toLowerCase()
    .replace(/&/g, "-and-")
    // "Plinko+" is not "Plinko": the plus is part of the name.
    .replace(/\+/g, "-plus-")
    .replace(/['‘’`´:!?,.()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
