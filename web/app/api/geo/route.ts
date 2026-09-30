import { headers } from "next/headers";
import { availabilityFor } from "@/lib/geo-availability";

/**
 * Where the visitor appears to be, and what that means for them.
 *
 * Vercel attaches these headers at the edge on every request, so there is no
 * third-party lookup, no key, and nothing leaves the request. The summary is
 * built here rather than in the browser so the restriction tables stay on the
 * server and the client receives a few numbers.
 *
 * Deliberately its own endpoint rather than something the pages read:
 * /crypto-casinos and its 948 siblings are statically generated, and reading
 * a request header inside them would make every one dynamic. It would also
 * mean the HTML varied by IP, which for a crawler that reaches us almost
 * entirely from US addresses is both an SEO risk and a lie about what the
 * page says.
 *
 * no-store because the answer is per-visitor: a cached copy would tell the
 * next reader they are in someone else's country.
 */
export const dynamic = "force-dynamic";

/** "GB", or "CA-ON" / "US-TX" for somewhere with a region. */
const OVERRIDE = /^([A-Za-z]{2})(?:-([A-Za-z0-9]{1,3}))?$/;

export async function GET(req: Request) {
  const h = await headers();

  /**
   * An explicit ?geo= wins over the edge's guess. IP geolocation is good at
   * country level, unreliable at state or province, and a VPN defeats it —
   * so a reader who is told the wrong thing needs a way to correct it. It is
   * also how this gets tested: no Vercel headers exist on localhost.
   *
   * Safe to honour because nothing here is a gate. The parameter changes
   * which numbers a band displays, not what anyone is allowed to see, and
   * the endpoint is uncached and unindexed.
   */
  const q = new URL(req.url).searchParams.get("geo");
  const m = q?.match(OVERRIDE);
  const country = m ? m[1] : h.get("x-vercel-ip-country");
  const region = m ? m[2] ?? null : h.get("x-vercel-ip-country-region");

  if (!country) {
    // Local development, or an edge that did not resolve the address. Say so
    // rather than guessing a country and marking rows on the strength of it.
    return Response.json({ detected: false }, { headers: { "cache-control": "no-store" } });
  }

  return Response.json(
    { detected: true, overridden: !!m, ...availabilityFor(country, region) },
    { headers: { "cache-control": "no-store" } }
  );
}
