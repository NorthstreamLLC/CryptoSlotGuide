/**
 * Checks a SendGrid setup against what /api/newsletter actually needs, and says
 * what is missing. Read-only: it sends no mail and creates no contacts.
 *
 * Run from web/ with the values in .env.local (or exported in the shell):
 *   node --env-file=.env.local scripts/check-sendgrid.mjs
 *
 * Exits non-zero if anything required is missing.
 */
const API = "https://api.sendgrid.com/v3";
const key = process.env.SENDGRID_API_KEY;
const listId = process.env.SENDGRID_LIST_ID;

let failures = 0;
const ok = (m) => console.log(`  ok      ${m}`);
const warn = (m) => console.log(`  note    ${m}`);
const bad = (m) => {
  console.log(`  MISSING ${m}`);
  failures++;
};

async function api(path) {
  try {
    const res = await fetch(API + path, { headers: { authorization: `Bearer ${key}` } });
    return { status: res.status, body: res.ok ? await res.json() : null };
  } catch (e) {
    return { status: 0, body: null, error: String(e.message) };
  }
}

async function main() {
  console.log("SendGrid setup check\n");

  // 1. The key itself, and the two scopes the route uses.
  console.log("API key");
  if (!key) {
    bad("SENDGRID_API_KEY is not set");
    console.log("\nNothing else can be checked without it.");
    return;
  }
  const scopes = await api("/scopes");
  if (scopes.status === 401 || scopes.status === 403) {
    bad(`the key was rejected (${scopes.status}) — wrong, revoked, or missing permissions`);
    console.log("\nFix the key first; every other check needs it.");
    return;
  }
  if (scopes.status !== 200) {
    bad(`could not reach SendGrid (${scopes.status}${scopes.error ? " " + scopes.error : ""})`);
    return;
  }
  ok("key authenticates");
  const granted = scopes.body.scopes ?? [];
  const has = (p) => granted.some((s) => s.startsWith(p));
  if (has("marketing")) ok("has Marketing access (needed to store contacts)");
  else bad("Marketing access — every sign-up will fail without it");
  if (has("mail.send")) ok("has Mail Send access (needed for the welcome email)");
  else warn("no Mail Send access — fine unless you want the welcome email");

  // 2. The list contacts are added to.
  console.log("\nContact list");
  if (!listId) {
    bad("SENDGRID_LIST_ID is not set");
  } else {
    const l = await api(`/marketing/lists/${listId}`);
    if (l.status === 200) ok(`list "${l.body.name}" found (${l.body.contact_count ?? 0} contacts)`);
    else bad(`no list with id ${listId} (${l.status}) — copy the id from the list's URL under Marketing → Contacts`);
  }

  // 3. Consent fields. Optional, but without them nothing records when or where
  //    someone opted in.
  console.log("\nConsent fields");
  const fd = await api("/marketing/field_definitions");
  if (fd.status === 200) {
    const names = (fd.body.custom_fields ?? []).map((f) => f.name.toLowerCase());
    for (const [n, type] of [["signup_source", "Text"], ["signup_date", "Date"]]) {
      if (names.includes(n)) ok(`${n} exists`);
      else warn(`${n} (${type}) not created — sign-ups still work, but consent is not evidenced`);
    }
  } else {
    warn(`could not read custom fields (${fd.status})`);
  }

  // 4. Sender identity: the from-address must be verified one way or the other.
  console.log("\nSender identity");
  const from = process.env.SENDGRID_FROM;
  const senders = await api("/verified_senders");
  const domains = await api("/whitelabel/domains");
  // A key without Sender Authentication read access gets 403 here. Reporting that
  // as "no verified sender" would send you hunting the wrong problem, so the two
  // cases are kept apart: unreadable is not the same as absent.
  const denied = (r) => r.status === 401 || r.status === 403;
  const unreadable = denied(senders) || denied(domains);
  const verified = senders.status === 200 ? (senders.body.results ?? []).filter((s) => s.verified).map((s) => String(s.from_email).toLowerCase()) : [];
  const authed = domains.status === 200 && Array.isArray(domains.body) ? domains.body.filter((d) => d.valid).map((d) => String(d.domain).toLowerCase()) : [];

  if (verified.length) ok(`verified single senders: ${verified.join(", ")}`);
  if (authed.length) ok(`authenticated domains: ${authed.join(", ")}`);
  if (unreadable) warn("this key cannot read Sender Authentication, so the sender could not be checked here — confirm it in the dashboard, or give the key read access to Sender Authentication");
  else if (!verified.length && !authed.length) warn("no verified sender and no authenticated domain — no mail can be sent yet");

  if (!from) {
    warn("SENDGRID_FROM not set — no welcome email will be sent");
  } else if (unreadable) {
    warn(`SENDGRID_FROM ${from} — not checked (see above)`);
  } else {
    const domainOf = from.split("@")[1]?.toLowerCase() ?? "";
    if (verified.includes(from.toLowerCase())) ok(`SENDGRID_FROM ${from} is a verified sender`);
    else if (authed.includes(domainOf)) ok(`SENDGRID_FROM ${from} is covered by domain authentication`);
    else bad(`SENDGRID_FROM ${from} is neither verified nor on an authenticated domain — the welcome email would fail`);
  }

  // 5. Everything optional.
  console.log("\nOptional");
  if (process.env.SENDGRID_WELCOME_TEMPLATE_ID) ok("welcome template id set");
  else warn("SENDGRID_WELCOME_TEMPLATE_ID not set — no welcome email");
  if (process.env.SENDGRID_UNSUBSCRIBE_GROUP_ID) ok("unsubscribe group set");
  else warn("SENDGRID_UNSUBSCRIBE_GROUP_ID not set — unsubscribes go to the global suppression list");
  if (process.env.NEXT_PUBLIC_NEWSLETTER_ON === "1") ok("NEXT_PUBLIC_NEWSLETTER_ON=1 — the sign-up button is live");
  else warn('NEXT_PUBLIC_NEWSLETTER_ON is not "1" — the button still reads "Opens at launch"');
}

await main();
console.log(failures ? `\n${failures} required item(s) missing.` : "\nEverything required is in place.");
if (failures) process.exitCode = 1;
