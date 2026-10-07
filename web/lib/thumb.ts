/**
 * The list-row (128px) copy of a game tile path: public/assets/games/t for our
 * own art (scripts/make-art-thumbs.mjs), ?w=128 on the sister-site proxy.
 * Anything else comes back unchanged. Safe in client components: string work only.
 */
export function thumbOf(src: string): string {
  if (src.startsWith("/assets/games/") && !src.startsWith("/assets/games/t/")) return src.replace("/assets/games/", "/assets/games/t/");
  if (src.startsWith("/api/art/") && !src.includes("?")) return `${src}?w=128`;
  return src;
}
