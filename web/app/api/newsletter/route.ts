/**
 * Newsletter sign-up: the site's own form posts here, and this adds the address
 * to a SendGrid marketing list server-side.
 *
 * Doing it here rather than embedding SendGrid's own form keeps the design, keeps
 * a third-party script off every page, and keeps the API key out of the browser —
 * SENDGRID_API_KEY is deliberately not a NEXT_PUBLIC_ variable. The address is
 * never logged; only the outcome is.
 *
 * Environment (see .env.example):
 *   SENDGRID_API_KEY              required — a key with Marketing permissions
 *   SENDGRID_LIST_ID              required — the list to add contacts to
 *   SENDGRID_WELCOME_TEMPLATE_ID  optional — sends a welcome email on sign-up
 *   SENDGRID_FROM                 required with the template above, a verified sender
 *   NEXT_PUBLIC_NEWSLETTER_ON     set to "1" so the form's button goes live
 *
 * Where the addresses live: SendGrid, and nowhere else. This site has no
 * database and keeps no copy — see consentFields() for the consent record
 * stored beside each contact.
 */

const API = process.env.SENDGRID_API_BASE ?? "https://api.sendgrid.com/v3";

/** Best-effort throttle. Serverless instances don't share this, which is fine — it exists to blunt a loop, not to be a quota. */
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

/** Deliberately strict rather than clever: one @, a dot in the domain, no spaces. */
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/.test(v) && v.length <= 254;

export async function POST(request: Request) {
  const key = process.env.SENDGRID_API_KEY;
  const listId = process.env.SENDGRID_LIST_ID;
  if (!key || !listId) {
    return Response.json({ error: "Sign-ups aren't open yet." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  let body: { email?: unknown; source?: unknown; consent?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  // Honeypot: a real person never fills a field they cannot see.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!looksLikeEmail(email)) {
    return Response.json({ error: "That address doesn't look right." }, { status: 400 });
  }
  if (body.consent !== true) {
    return Response.json({ error: "Please confirm you're 18 or older and want the email." }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "site";

  try {
    // PUT upserts: an address that signs up twice is updated, not duplicated or rejected.
    const res = await fetch(`${API}/marketing/contacts`, {
      method: "PUT",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        list_ids: [listId],
        contacts: [{ email, custom_fields: await consentFields(key, source) }],
      }),
    });

    if (!res.ok) {
      // SendGrid's body can name the address; keep it out of the logs.
      console.error(`newsletter: SendGrid contacts upsert failed (${res.status}), source=${source}`);
      return Response.json({ error: "That didn't go through. Try again shortly." }, { status: 502 });
    }

    await sendWelcome(email, key);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("newsletter: SendGrid request threw", e instanceof Error ? e.message : "unknown");
    return Response.json({ error: "That didn't go through. Try again shortly." }, { status: 502 });
  }
}


/**
 * Consent, stored beside the contact in SendGrid.
 *
 * A gambling list has to be able to show when and where someone opted in, and
 * the address itself proves nothing. Create two custom fields in SendGrid
 * (Marketing → Contacts → Custom Fields) and they get filled automatically:
 *
 *   signup_source  Text  — the page the form was on ("site", "bonuses", ...)
 *   signup_date    Date  — when they ticked the box
 *
 * Field values go to SendGrid by field ID, not by name, so the ids are looked
 * up once per process and cached. If the fields don't exist the contact is
 * still stored — consent metadata is worth having, not worth failing a
 * sign-up over.
 */
let fieldIds: Record<string, string> | null = null;

async function loadFieldIds(key: string): Promise<Record<string, string>> {
  if (fieldIds) return fieldIds;
  const out: Record<string, string> = {};
  try {
    const res = await fetch(`${API}/marketing/field_definitions`, {
      headers: { authorization: `Bearer ${key}` },
    });
    if (res.ok) {
      const body = (await res.json()) as { custom_fields?: { id: string; name: string }[] };
      for (const f of body.custom_fields ?? []) out[f.name.toLowerCase()] = f.id;
    }
  } catch {
    // Leave the map empty; the sign-up proceeds without the metadata.
  }
  fieldIds = out;
  return out;
}

async function consentFields(key: string, source: string): Promise<Record<string, string> | undefined> {
  const ids = await loadFieldIds(key);
  const fields: Record<string, string> = {};
  if (ids["signup_source"]) fields[ids["signup_source"]] = source;
  // SendGrid date fields take ISO 8601; the date alone is enough to evidence consent.
  if (ids["signup_date"]) fields[ids["signup_date"]] = new Date().toISOString().slice(0, 10);
  return Object.keys(fields).length ? fields : undefined;
}

/**
 * The welcome email, sent from here rather than from a SendGrid Automation so it
 * works on any plan that can send mail. Failing to send must not fail the sign-up —
 * the contact is already on the list by this point.
 */
async function sendWelcome(email: string, key: string): Promise<void> {
  const templateId = process.env.SENDGRID_WELCOME_TEMPLATE_ID;
  const from = process.env.SENDGRID_FROM;
  if (!templateId || !from) return;

  try {
    const res = await fetch(`${API}/mail/send`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: { email: from, name: "CryptoSlotGuide" },
        personalizations: [{ to: [{ email }] }],
        template_id: templateId,
        // Every marketing send needs a one-click unsubscribe; the group id is optional
        // but without one SendGrid falls back to the global suppression list.
        ...(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID
          ? { asm: { group_id: Number(process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID) } }
          : {}),
      }),
    });
    if (!res.ok) console.error(`newsletter: welcome email failed (${res.status})`);
  } catch {
    console.error("newsletter: welcome email threw");
  }
}
