/**
 * Famous titles that get a page of their own because we can let the reader
 * play them: each has a free demo from the studio (data/slot-demos.json) and
 * a published return. Curated, not every demo: 3,500 near-identical pages
 * would be the doorway pattern lib/slot-page.ts guards against; these are the
 * titles people search for by name. Catalogue slugs; where the catalogue
 * suffixed one ("starburst-1"), data/slug-renames.json sends the plain address
 * there.
 */
export const DEMO_PAGE_PICKS: string[] = [
  // NetEnt
  "starburst-1", "starburst-xxxtreme-1", "starburst-galaxy", "gonzo-s-quest", "gonzos-quest-ii-return-to-el-dorado",
  "dead-or-alive-1", "dead-or-alive-2-1", "dead-or-alive-3-want", "divine-fortune-megaways", "divine-fortune-black",
  "twin-spin", "twin-spin-megaways-1", "twin-spin-xxxtreme-1", "blood-suckers", "jack-hammer", "jack-hammer-3", "jumanji", "narcos",
  // Nolimit City
  "tombstone-1", "tombstone-no-mercy-1", "tombstone-begins", "san-quentin-2-death-row", "san-quentin-manhunt", "das-xboot", "das-xboot-2wei",
  "deadwood-r-i-p-1", "punk-rocker", "punk-rocker-2", "punk-rocker-3", "book-of-shadows",
  // Quickspin
  "big-bad-wolf", "big-bad-wolf-megaways", "big-bad-wolf-pigs-of-steel", "sakura-fortune", "sakura-fortune-2", "joker-strike",
  // Thunderkick
  "esqueleto-explosivo", "esqueleto-explosivo-3", "pink-elephants", "pink-elephants-2-reborn",
  // ELK Studios
  "nitropolis", "nitropolis-4", "nitropolis-5", "wild-toro-1", "wild-toro-3",
  // BGaming
  "elvis-frog-in-vegas", "bonanza-billion", "wild-cash", "aztec-magic-deluxe",
  // Play'n GO, Pragmatic Play
  "tome-of-madness", "sweet-bonanza-pop",
];
