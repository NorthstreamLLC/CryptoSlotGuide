import type { NextRequest } from "next/server";
import { DEMO_STUDIOS, isKnownDemo } from "@/lib/demo-studios";

/**
 * /demo/<studio>/<id>: sends the demo player to the studio's own free demo
 * for that game (lib/demo-studios.ts builds each studio's URL). Only ids on
 * file are served, so this can't be used to open arbitrary URLs from our
 * domain. Hacksaw's URL carries the game's current build, read from its own
 * version.json (cached for six hours) rather than stored.
 */
const redirect = (to: string, cache: number) =>
  new Response(null, { status: 302, headers: { Location: to, "Cache-Control": `public, max-age=${cache}`, "X-Robots-Tag": "noindex, nofollow" } });

export async function GET(_req: NextRequest, ctx: { params: Promise<{ studio: string; id: string }> }) {
  const { studio, id } = await ctx.params;
  const cfg = DEMO_STUDIOS[studio];
  if (!cfg || !isKnownDemo(studio, id)) return new Response("Unknown demo", { status: 404 });
  if (cfg.url) return redirect(cfg.url(id), cfg.cache);

  if (studio === "microgaming") {
    try {
      const r = await fetch(`https://microgaming.io/wp-json/games/v1/game-demo-url?post_id=${id}&lang=en`, { next: { revalidate: 3600 } });
      const to = r.ok ? ((await r.json()) as { url?: string }).url : undefined;
      // Only ever on to the studio's own launcher.
      if (to && /^https:\/\/[a-z0-9-]+\.goplaylaunch\.com\//.test(to)) return redirect(to, cfg.cache);
    } catch {
      /* fall through */
    }
    return new Response("Demo unavailable right now", { status: 502 });
  }

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
  return redirect(`https://static-live.hacksawgaming.com/${id}/${version}/index.html?${query}`, cfg.cache);
}
