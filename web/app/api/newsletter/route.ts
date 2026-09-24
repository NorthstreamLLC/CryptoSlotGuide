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

/**
 * Read-only self-test: GET /api/newsletter?selftest=1
 *
 * A sign-up that fails returns a deliberately vague message, and the real reason
 * is in a log that isn't always reachable. This asks SendGrid the same questions
 * the sign-up does — is the key good, does the list exist, are the custom fields
 * there — and reports the status codes. It creates nothing and sends nothing, and
 * returns no addresses, list names or key material: status numbers only.
 */
export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get("selftest") !== "1") {
    return new Response(null, { status: 405 });
  }
  const key = process.env.SENDGRID_API_KEY;
  const listId = process.env.SENDGRID_LIST_ID;
  if (!key || !listId) {
    return Response.json({ configured: false, hasKey: !!key, hasListId: !!listId });
  }

  const probe = async (path: string) => {
    try {
      const r = await fetch(`${API}${path}`, { headers: { authorization: `Bearer ${key}` } });
      return r.status;
    } catch {
      return 0;
    }
  };

  const [scopes, list, fields] = await Promise.all([probe("/scopes"), probe(`/marketing/lists/${listId}`), probe("/marketing/field_definitions")]);

  // The sign-up's PUT only ever returns 202 Accepted — SendGrid writes the contact
  // in a background job, and that job can fail silently (contact allowance reached,
  // a custom field whose type doesn't match the value). ?probe=1 runs the identical
  // upsert with a marked test address and polls the job so the reason is visible.
  // It creates one contact, named so it is obvious and easy to delete.
  let allowance: unknown;
  try {
    const c = await fetch(`${API}/marketing/contacts/count`, { headers: { authorization: `Bearer ${key}` } });
    if (c.ok) allowance = await c.json();
  } catch {
    /* non-fatal */
  }

  // Whether a submission made through the real browser form landed. Fixed
  // address, never one supplied by the caller, so this cannot be used to test
  // whether some third party is subscribed.
  let formTest: unknown;
  if (new URL(request.url).searchParams.get("formtest") === "1") {
    formTest = await probeExists(key, "formtest@cryptoslotguide.com");
  }

  const askedExists = new URL(request.url).searchParams.get("exists");
  let existsCheck: unknown;
  if (askedExists) {
    existsCheck = /@cryptoslotguide\.com$/i.test(askedExists)
      ? await probeExists(key, askedExists.toLowerCase())
      : { refused: "only addresses on this site's own domain can be looked up" };
  }

  let jobProbe: unknown;
  if (new URL(request.url).searchParams.get("probe") === "1") {
    jobProbe = await runProbe(key, listId, new URL(request.url).searchParams.get("nofields") !== "1");
  }

  // When the id is rejected, say what shape it has and whether the account has
  // any lists at all — enough to tell "wrong id" from "no list exists" from
  // "pasted something that isn't an id", without returning ids or names.
  let shape: Record<string, unknown> | undefined;
  if (list !== 200) {
    const trimmed = listId.trim();
    let listsInAccount: number | string = "unknown";
    let idIsOneOfThem: boolean | string = "unknown";
    try {
      const r = await fetch(`${API}/marketing/lists?page_size=100`, { headers: { authorization: `Bearer ${key}` } });
      if (r.ok) {
        const body = (await r.json()) as { result?: { id: string }[] };
        const ids = (body.result ?? []).map((l) => l.id);
        listsInAccount = ids.length;
        idIsOneOfThem = ids.includes(trimmed);
      }
    } catch {
      /* leave as unknown */
    }
    shape = {
      listsInAccount,
      idIsOneOfThem,
      looksLikeUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed),
      length: listId.length,
      hasSurroundingWhitespace: listId !== trimmed,
      hasQuotes: /^["']|["']$/.test(listId),
      looksLikeUrl: /^https?:\/\//i.test(trimmed),
    };
  }

  return Response.json({
    configured: true,
    keyAccepted: scopes === 200,
    listFound: list === 200,
    fieldsReadable: fields === 200,
    status: { scopes, list, fields },
    ...(allowance ? { allowance } : {}),
    ...(jobProbe ? { probe: jobProbe } : {}),
    ...(formTest ? { formTest } : {}),
    ...(existsCheck ? { existsCheck } : {}),
    ...(shape ? { listId: shape } : {}),
    reading: {
      401: "key is wrong or revoked",
      403: "key lacks the permission for that endpoint",
      404: "not found — for the list, the id is wrong",
    },
  });
}

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

  let body: { email?: unknown; source?: unknown; consent?: unknown; csg_hp?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  // Honeypot: a real person never fills a field they cannot see — but a browser
  // will, if the field is named something autofill recognises. Only the current
  // field name is checked; a stale cached page still sending the old "company"
  // key is ignored rather than rejected, so nobody is dropped mid-rollout.
  if (typeof body.csg_hp === "string" && body.csg_hp.trim() !== "") {
    return Response.json({ ok: true, path: "honeypot" });
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
    const payload = JSON.stringify({
      list_ids: [listId],
      contacts: [{ email, custom_fields: await consentFields(key, source) }],
    });
    const res = await fetch(`${API}/marketing/contacts`, {
      method: "PUT",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: payload,
    });

    if (!res.ok) {
      // SendGrid's body can name the address; keep it out of the logs.
      console.error(`newsletter: SendGrid contacts upsert failed (${res.status}), source=${source}`);
      // The upstream status rides along: it names no address and leaks no key, and
      // without it a failure here is undiagnosable from outside.
      return Response.json({ error: "That didn't go through. Try again shortly.", upstream: res.status }, { status: 502 });
    }

    const accepted = (await res.json().catch(() => ({}))) as { job_id?: string };
    await sendWelcome(email, key);
    return Response.json({
      ok: true,
      path: "sendgrid",
      upstream: res.status,
      jobId: accepted.job_id ?? null,
      sentBody: payload.replace(listId, "<listId>"),
    });
  } catch (e) {
    console.error("newsletter: SendGrid request threw", e instanceof Error ? e.message : "unknown");
    return Response.json({ error: "That didn't go through. Try again shortly." }, { status: 502 });
  }
}


/**
 * Does this address exist in the account at all? The contact count is cached
 * and the list view lags, so neither settles the question; a search does.
 * Only ever called with the probe's own fixed address, never a visitor's.
 */
async function probeExists(key: string, email: string) {
  try {
    const r = await fetch(`${API}/marketing/contacts/search/emails`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ emails: [email] }),
    });
    if (r.status === 404) return { found: false, status: 404 };
    if (!r.ok) return { lookupStatus: r.status };
    const body = (await r.json()) as { result?: Record<string, { contact?: { id?: string; list_ids?: string[] } }> };
    const hit = body.result?.[email]?.contact;
    return { found: !!hit, inLists: hit?.list_ids?.length ?? 0 };
  } catch {
    return { lookupStatus: "threw" };
  }
}

/**
 * Runs the exact upsert a sign-up runs, with a marked test address, then polls
 * the background job until SendGrid says what happened to it. This is the only
 * way to see why a contact vanishes after a 202: the PUT reports acceptance,
 * the job reports the outcome.
 */
async function runProbe(key: string, listId: string, withFields = true) {
  const email = `selftest+${Date.now()}@cryptoslotguide.com`;
  // &nofields=1 drops the custom fields, which isolates whether they are what
  // the job is choking on: a Date field rejecting its value fails the whole
  // contact, and the PUT still answers 202.
  const fields = withFields ? await consentFields(key, "selftest") : undefined;
  const payload = JSON.stringify({ list_ids: [listId], contacts: [{ email, custom_fields: fields }] });
  const put = await fetch(`${API}/marketing/contacts`, {
    method: "PUT",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: payload,
  });
  const sentBody = payload.replace(listId, "<listId>");
  const accepted = put.status;
  const body = (await put.json().catch(() => ({}))) as { job_id?: string; errors?: unknown };
  if (!put.ok) return { sentCustomFields: fields ?? null, accepted, rejectedImmediately: body };
  const jobId = body.job_id;
  if (!jobId) return { sentCustomFields: fields ?? null, accepted, note: "no job_id returned" };

  // Jobs routinely take longer than a few seconds, and a half-answer is worse
  // than a slow one, so poll for up to ~45s.
  for (let i = 0; i < 22; i++) {
    await new Promise((s) => setTimeout(s, 2000));
    const r = await fetch(`${API}/marketing/contacts/imports/${jobId}`, { headers: { authorization: `Bearer ${key}` } });
    if (!r.ok) return { sentCustomFields: fields ?? null, accepted, jobStatusLookup: r.status };
    const job = (await r.json()) as { status?: string; results?: Record<string, unknown> };
    if (job.status && job.status !== "pending") {
      let errorDetail: unknown;
      const url = (job.results as { errors_url?: string } | undefined)?.errors_url;
      if (url) {
        try {
          errorDetail = await (await fetch(url)).text();
        } catch {
          /* the url is pre-signed and short-lived; absence is not fatal */
        }
      }
      return { sentBody, accepted, job, errorDetail, exists: await probeExists(key, email) };
    }
  }
  return { sentBody, accepted, jobId, note: "job still pending after 45s", exists: await probeExists(key, email) };
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
