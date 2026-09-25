/**
 * Reader-reported inaccuracies, emailed to the inbox.
 *
 * Deliberately has no database. /editorial-standards promises that a
 * reproducible report triggers a re-check, and an email does that — a table of
 * unread rows does not. No storage also means no moderation queue, no personal
 * data at rest, and nothing to breach.
 *
 * Needs SENDGRID_API_KEY and SENDGRID_FROM, both already set for the
 * newsletter. Reports go to REPORTS_EMAIL_TO if set, otherwise to SENDGRID_FROM
 * itself, which is hello@ — so this works with no new configuration.
 */

const API = process.env.SENDGRID_API_BASE ?? "https://api.sendgrid.com/v3";

/** Same shape as the newsletter's, so one regex governs both. */
const VALID_EMAIL = /^[^\s@.][^\s@]*@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

const LIMITS = { detail: 4000, url: 500, source: 500, email: 254 };

/**
 * Best-effort per-IP throttle. Serverless instances are not shared, so this
 * stops a single client hammering one instance rather than a distributed
 * flood; the real protection is that the endpoint only ever sends one email to
 * one fixed address and stores nothing.
 */
const seen = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (seen.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  seen.set(ip, hits);
  // Keep the map from growing without bound on a long-lived instance.
  if (seen.size > 500) for (const [k, v] of seen) if (!v.some((t) => now - t < WINDOW_MS)) seen.delete(k);
  return hits.length > MAX_PER_WINDOW;
}

const clean = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: { detail?: unknown; url?: unknown; source?: unknown; email?: unknown; csg_hp?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  // Honeypot. Named csg_hp rather than anything a password manager recognises —
  // a field called "company" gets autofilled by real browsers and silently
  // discards genuine submissions.
  if (typeof body.csg_hp === "string" && body.csg_hp.trim() !== "") {
    return Response.json({ ok: true });
  }

  const detail = clean(body.detail, LIMITS.detail);
  const url = clean(body.url, LIMITS.url);
  const source = clean(body.source, LIMITS.source);
  const email = clean(body.email, LIMITS.email);

  if (detail.length < 10) {
    return Response.json({ ok: false, error: "Tell us a little more about what's wrong." }, { status: 400 });
  }
  // The reply address is optional, but a wrong one is worth catching now rather
  // than discovering when the reply bounces.
  if (email && !VALID_EMAIL.test(email)) {
    return Response.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  }

  // Config is checked AFTER validation and the honeypot, so a probe cannot
  // learn whether the mailer is configured, and so the validation paths stay
  // testable in a local environment that has no SendGrid key.
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM;
  const to = process.env.REPORTS_EMAIL_TO ?? from;
  if (!key || !from || !to) {
    console.error("report: SENDGRID_API_KEY and SENDGRID_FROM are required");
    return Response.json({ ok: false, error: "Reporting isn't configured yet." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many reports just now — try again in a minute." }, { status: 429 });
  }

  const lines = [
    `Page:   ${url || "(not supplied)"}`,
    `Reply:  ${email || "(none given)"}`,
    source ? `Source: ${source}` : null,
    "",
    detail,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const res = await fetch(`${API}/mail/send`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: { email: from, name: "CryptoSlotGuide corrections" },
        // Reply goes straight back to the reader where they left an address.
        ...(email ? { reply_to: { email } } : {}),
        personalizations: [{ to: [{ email: to }] }],
        subject: `Correction: ${url ? new URL(url, "https://cryptoslotguide.com").pathname : "site"}`,
        content: [{ type: "text/plain", value: lines }],
      }),
    });
    // 202 is SendGrid's accepted-for-delivery response; anything else failed.
    if (res.status !== 202) {
      console.error(`report: send failed ${res.status} ${await res.text()}`);
      return Response.json({ ok: false, error: "Couldn't send that — please email hello@cryptoslotguide.com." }, { status: 502 });
    }
  } catch {
    return Response.json({ ok: false, error: "Couldn't send that — please email hello@cryptoslotguide.com." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
