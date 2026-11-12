import type { NextRequest } from "next/server";
import demos from "@/data/slot-demos.json";

/**
 * /demo/hacksaw/<gameid>: sends the demo player to the studio's free demo
 * build for that game. The build number changes with each release, so it is
 * read from the studio's own version.json (cached for six hours) rather than
 * stored. Only game ids on file (data/slot-demos.json) are served, so this
 * can't be used to open arbitrary URLs from our domain.
 */
const KNOWN = new Set(Object.values((demos as { hacksaw?: Record<string, number> }).hacksaw ?? {}).map(String));

export async function GET(_req: NextRequest, ctx: { params: Promise<{ studio: string; id: string }> }) {
  const { studio, id } = await ctx.params;
  if (studio !== "hacksaw" || !/^\d{1,6}$/.test(id) || !KNOWN.has(id)) return new Response("Unknown demo", { status: 404 });

  let version: string | null = null;
  try {
    const r = await fetch(`https://static-live.hacksawgaming.com/${id}/version.json`, { next: { revalidate: 21600 } });
    version = r.ok ? ((await r.json()) as { version?: string }).version ?? null : null;
  } catch {
    version = null;
  }
  if (!version || !/^[\d.]+$/.test(version)) return new Response("Demo unavailable right now", { status: 502 });

  // The studio's own demo launch parameters, as its site uses them.
  const api = "https://rgs-demo.hacksawgaming.com/api";
  const query = `language=en&channel=desktop&gameid=${id}&mode=2&token=123131&lobbyurl=https%3A%2F%2Fwww.hacksawgaming.com&currency=EUR&partner=demo&env=${api}&realmoneyenv=${api}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://static-live.hacksawgaming.com/${id}/${version}/index.html?${query}`,
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
