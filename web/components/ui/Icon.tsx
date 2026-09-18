/**
 * Small line icons (24px grid, stroke = currentColor).
 */
const PATHS: Record<string, string> = {
  bolt: "M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z",
  gift: "M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Zm0 0h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z",
  ticket: "M3 8a2 2 0 0 0 0 4 2 2 0 0 1 0 4v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2ZM14 5v14",
  coins: "M9 14c3.9 0 7-1.3 7-3s-3.1-3-7-3-7 1.3-7 3 3.1 3 7 3ZM2 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4M8.5 8.1C9 6.3 11.8 5 15 5c3.9 0 7 1.3 7 3s-2.3 2.7-5.5 3M22 8v4c0 1.5-2.3 2.7-5.5 3",
  percent: "M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm11 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  ball: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15 4.2 3-1.6 5H9.4l-1.6-5L12 7Zm0 0V2.5M16.2 10l5.3-1.8M14.6 15l3.3 4.4M9.4 15l-3.3 4.4M7.8 10 2.5 8.2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4",
  id: "M3 5h18v14H3zM7 15c.5-1.5 1.6-2 2.5-2s2 .5 2.5 2M9.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15 9h3M15 13h3",
  arrow: "M5 12h14M13 6l6 6-6 6",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  handshake: "M11 17l2 2a1.5 1.5 0 0 0 2-2M14 16l2.5 2.5a1.5 1.5 0 0 0 2-2L15 13M3 11l5-5 4 2 2-1 7 5-3 3M3 11l4 4M8 16l1.5 1.5a1.5 1.5 0 0 0 2-2",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, color = "currentColor", stroke = 1.8 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: "none" }}>
      <path d={PATHS[name]} />
    </svg>
  );
}
