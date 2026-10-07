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
// Widths a page may ask for (?w=); anything else gets the original, so the
// route cannot be used to mint arbitrary renditions.
const WIDTHS = new Set([128]);

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const src = proxiedArtSource(slug);
  if (!src) return new NextResponse(null, { status: 404 });
  const upstream = await fetch(src, { redirect: "follow", next: { revalidate: 2592000 } });
  if (!upstream.ok) return new NextResponse(null, { status: 404 });
  const type = upstream.headers.get("content-type") ?? "image/webp";
  if (!type.startsWith("image/")) return new NextResponse(null, { status: 404 });
  let body: ArrayBuffer | Buffer = await upstream.arrayBuffer();
  let outType = type;
  const w = Number(new URL(req.url).searchParams.get("w"));
  if (WIDTHS.has(w)) {
    // A list row's thumbnail: ~4KB instead of the ~190KB original.
    try {
      const sharp = (await import("sharp")).default;
      body = await sharp(Buffer.from(body)).resize({ width: w, withoutEnlargement: true }).webp({ quality: 68 }).toBuffer();
      outType = "image/webp";
    } catch {
      /* no image library at runtime: serve the original */
    }
  }
  return new NextResponse(body as BodyInit, {
    status: 200,
    headers: {
      "content-type": outType,
      "cache-control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800",
    },
  });
}
