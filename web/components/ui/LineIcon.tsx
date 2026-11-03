/**
 * Small line icons drawn in currentColor, used in place of emoji on hub tiles
 * and quick links (the tile sets the colour).
 */
const PATHS = {
  casino: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 3v4M12 17v4M3 12h4M17 12h4",
  gift: "M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3-5-1s3 1 5 1Zm0 0c1.5-3 5-3 5-1s-3 1-5 1Z",
  slots: "M4 5h16v14H4zM9.3 5v14M14.7 5v14M5.8 10.5h1.8l-1.2 3M11.1 10.5h1.8l-1.2 3M16.4 10.5h1.8l-1.2 3",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  book: "M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4ZM5 16a4 4 0 0 1 4-4h9",
  bolt: "M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z",
  eyeOff: "M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4.5 9.5 6-.5.8-1.6 2.3-3.2 3.6M6.3 7.8C4.4 9.1 3.1 10.9 2.5 12c1 1.5 4.5 6 9.5 6 1.5 0 2.9-.4 4.1-1M9.9 10a3 3 0 0 0 4.1 4.1",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 3.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z",
  ball: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5 3.8 2.8-1.5 4.5H9.7L8.2 10.8 12 8Zm0 0V3.5M15.8 10.8l4.6-1.5M14.3 15.3l2.8 3.9M9.7 15.3l-2.8 3.9M8.2 10.8 3.6 9.3",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM9.5 7.5v9M9.5 7.5h3.8a2.2 2.2 0 0 1 0 4.5H9.5h4.3a2.2 2.2 0 0 1 0 4.5H9.5M11 6v1.5M11 16.5V18M13 6v1.5M13 16.5V18",
  scale: "M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0L5 8Zm14 0-2.5 6a3 3 0 0 0 5 0L19 8ZM12 4l-1.5 1.5M12 4l1.5 1.5",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
} as const;

export type IconName = keyof typeof PATHS;

export function LineIcon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
