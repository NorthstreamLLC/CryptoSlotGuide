import { NextResponse } from "next/server";
import { proxiedArtSource } from "@/lib/art-proxy";

/**
 * Game tiles for catalogue titles whose art lives on our sister site, served
 * through this origin — see lib/art-proxy.ts for why they cannot be
 * hotlinked and why they are not copied into the repo instead.
 *
 * Only slugs in the catalogue, and only the allow-listed host, so this is not
 * an open proxy. The first request for a tile goes upstream; the cache
 * headers let Vercel's CDN serve it for a month after that.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const src = proxiedArtSource(slug);
  if (!src) return new NextResponse(null, { status: 404 });
  const upstream = await fetch(src, { redirect: "follow", next: { revalidate: 2592000 } });
  if (!upstream.ok) return new NextResponse(null, { status: 404 });
  const type = upstream.headers.get("content-type") ?? "image/webp";
  if (!type.startsWith("image/")) return new NextResponse(null, { status: 404 });
  const body = await upstream.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
    },
  });
}
