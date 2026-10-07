import type { NextRequest } from "next/server";
import { track } from "@vercel/analytics/server";
import { affiliateTarget, reviewPath } from "@/lib/outbound";

/**
 * /go/<slug>: every affiliate button on the site lands here (lib/outbound.ts)
 * and is sent on to the operator's tracking URL.
 *
 * Each click is counted twice, so it is never lost: as an `affiliate_click`
 * event in Vercel Web Analytics (Analytics → Events, on plans that record
 * custom events) and as one JSON line in the function log (Logs, search
 * "affiliate_click"). Both carry the operator, the page the click came from
 * and the visitor's country — never an IP address or anything that names
 * the person.
 *
 * An unknown slug, or one without a live affiliate link, goes to our own
 * review page rather than a 404: an old link in someone's bookmarks should
 * still lead somewhere useful. The response is never cached, so a changed
 * link takes effect on the next click, and the route is kept out of search
 * results (X-Robots-Tag here, Disallow in app/robots.ts).
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const target = affiliateTarget(slug);

  const ref = req.headers.get("referer");
  let from = "";
  try {
    if (ref && new URL(ref).host === req.nextUrl.host) from = new URL(ref).pathname;
  } catch {
    /* no usable referrer */
  }
  const click = {
    slug,
    from: from || "(direct)",
    country: req.headers.get("x-vercel-ip-country") ?? "",
    live: Boolean(target),
  };

  console.log(JSON.stringify({ event: "affiliate_click", at: new Date().toISOString(), ...click }));
  try {
    await track("affiliate_click", click, { request: req });
  } catch {
    /* analytics off or unavailable: the log line above still has it */
  }

  const to = target ?? new URL(reviewPath(slug), req.nextUrl.origin).href;
  return new Response(null, {
    status: 302,
    headers: {
      Location: to,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer-when-downgrade",
    },
  });
}
