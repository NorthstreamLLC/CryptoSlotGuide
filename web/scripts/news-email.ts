/**
 * Builds the monthly newsletter email from a news issue (lib/news.ts), ready to
 * paste into SendGrid as a single send. Same look and footer as the earlier
 * campaign emails in docs/, with SendGrid's {{{unsubscribe}}} tags.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/news-email.ts 2026-11
 *
 * writes ../docs/email-news-2026-11.html. Every item links to the casino's own
 * source and to our page; links back to the site carry UTM tags so Vercel
 * Analytics can tell newsletter visits apart.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { NEWS, NEWS_KIND } from "@/lib/news";
import { siteData } from "@/lib/site-data";
import { getSpecFact } from "@/lib/spec-sheet";
import { logoFor } from "@/lib/logo";
import { brandFor } from "@/lib/casino-facts";
import { PROMO_HUB } from "@/lib/promo-pages";
// The live site, not lib/seo's SITE_URL: that falls back to a placeholder outside a deploy.
const SITE_URL = "https://cryptoslotguide.com";

const month = process.argv[2] ?? NEWS[0]?.month;
const issue = NEWS.find((n) => n.month === month);
if (!issue) throw new Error(`No news issue for ${month}`);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const utm = (path: string, content: string) => `${SITE_URL}${path}${path.includes("?") ? "&" : "?"}utm_source=newsletter&utm_medium=email&utm_campaign=news-${month}&utm_content=${content}`;
const host = (u: string) => new URL(u).hostname.replace(/^www\./, "");
const F = "font-family:Arial, Helvetica, sans-serif;";

/** A casino's mark for email: its PNG/JPG logo where it has one (email clients drop SVG/WebP), else a tinted monogram. */
function mark(slug: string, mono: string) {
  const logo = logoFor(slug);
  if (logo && /\.(png|jpe?g)$/i.test(logo)) return `<img src="${SITE_URL}${logo}" width="32" height="32" alt="" style="display:block; width:32px; height:32px; border-radius:8px; border:0;">`;
  return `<div style="width:32px; height:32px; border-radius:8px; background:${brandFor(slug)}; ${F} font-size:11px; font-weight:bold; line-height:32px; text-align:center; color:#0A0D0F;">${esc(mono)}</div>`;
}

const items = issue.items.flatMap((it, i) => {
  const o = siteData.ops.find((x) => x.slug === it.slug);
  const f = getSpecFact(it.slug, it.group, it.label);
  if (!o || !f?.sourceUrl) return [];
  const k = NEWS_KIND[it.kind];
  const before = it.before
    ? `<tr><td style="padding:2px 18px 6px; ${F} font-size:13px; line-height:20px; color:#8DA0AA;"><span style="font-size:10px; letter-spacing:1px; color:#7F8D96;">BEFORE</span><br>${esc(it.before)}</td></tr>`
    : "";
  return [
    `<tr><td class="pad" style="padding:8px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#11171B; border:1px solid #1E262C; border-left:3px solid ${brandFor(o.slug)}; border-radius:12px;">
        <tr><td style="padding:14px 18px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="32" style="padding-right:10px;">${mark(o.slug, o.mono)}</td>
            <td style="${F} font-size:14px; font-weight:bold; color:#FFFFFF;">${esc(o.name)} &nbsp;<span style="font-size:10px; letter-spacing:1px; color:${k.tint};">${k.label.toUpperCase()}</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0 18px 8px; ${F} font-size:17px; line-height:23px; font-weight:bold; color:#FFFFFF;">${esc(it.headline)}</td></tr>
        ${before}
        <tr><td style="padding:2px 18px 10px; ${F} font-size:13.5px; line-height:21px; color:#DCE5E9;"><span style="font-size:10px; letter-spacing:1px; color:${brandFor(o.slug)};">${it.before ? "NOW" : "WHAT HAPPENED"}</span><br>${esc(it.after)}</td></tr>
        <tr><td style="padding:0 18px 14px; ${F} font-size:12.5px;">
          <a href="${esc(f.sourceUrl)}" style="color:#5FE3E8;">Source: ${esc(host(f.sourceUrl))}</a> &nbsp;·&nbsp;
          <a href="${esc(utm(`/news/${month}#item-${i + 1}`, `item-${i + 1}`))}" style="color:#E8EDF0;">Read on the site</a>
        </td></tr>
      </table>
    </td></tr>`,
  ];
});

// Codes that carry a perk of their own, as a short block after the news.
const codes = siteData.ops.filter((o) => PROMO_HUB[o.slug]?.kind === "perk" && o.promoCode && o.signupUrl);
const codeRows = codes
  .map(
    (o) => `<tr><td style="padding:6px 18px; ${F} font-size:13.5px; line-height:20px; color:#B7C4CB;">
      <strong style="color:#FFFFFF;">${esc(o.name)}</strong> &nbsp;<span style="font-family:'Courier New', monospace; color:#FFC531;">${esc(o.promoCode!)}</span><br>${esc(o.codePerk?.short ?? PROMO_HUB[o.slug].line)} &nbsp;<a href="${esc(utm(`/promo-codes/${o.slug}`, `code-${o.slug}`))}" style="color:#5FE3E8;">How it works</a>
    </td></tr>`
  )
  .join("");

const preview = issue.items.slice(0, 3).map((i) => i.headline).join(" · ");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${esc(issue.title)}</title>
<style>
  @media (max-width: 620px) {
    .wrap { width: 100% !important; }
    .pad { padding-left: 16px !important; padding-right: 16px !important; }
    .h1 { font-size: 24px !important; line-height: 30px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#07090B;">
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#07090B;">
  ${esc(preview)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090B;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background:#0C1013; border:1px solid #1E262C; border-radius:16px; overflow:hidden;">
        <tr>
          <td class="pad" style="padding:20px 32px; ${F} font-size:18px; font-weight:bold; color:#FFFFFF;">
            <a href="${esc(utm("/", "logo"))}" style="color:#FFFFFF; text-decoration:none;">CryptoSlot<span style="color:#00C2CC;">Guide</span></a>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:8px 32px 6px; ${F}">
            <div style="font-size:11px; letter-spacing:1.5px; color:#FF9CC6;">${issue.items.length} CHANGES · EVERY ONE SOURCED</div>
            <h1 class="h1" style="margin:10px 0 12px; font-size:28px; line-height:34px; color:#FFFFFF;">${esc(issue.title)}</h1>
            <p style="margin:0 0 8px; font-size:15px; line-height:23px; color:#B7C4CB;">${esc(issue.intro)}</p>
          </td>
        </tr>
        ${items.join("\n")}
        <tr>
          <td class="pad" style="padding:18px 32px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#11171B; border:1px solid #2A2410; border-radius:12px;">
              <tr><td style="padding:14px 18px 4px; ${F} font-size:16px; font-weight:bold; color:#FFFFFF;">Codes with their own perk</td></tr>
              ${codeRows}
              <tr><td style="padding:6px 18px 14px; ${F} font-size:13px;"><a href="${esc(utm("/promo-codes", "all-codes"))}" style="color:#FFC531; font-weight:bold;">All promo codes</a> &nbsp;·&nbsp; <a href="${esc(utm("/rakeback-casinos", "rakeback"))}" style="color:#FFC531; font-weight:bold;">Best rakeback</a></td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="pad" style="padding:20px 32px 28px; ${F} font-size:11.5px; line-height:18px; color:#7F8D96;">
            18+. Every change above comes from the casino's own pages or its regulator's register, linked beside it. Some links on our site are affiliate links: we may earn a commission if you sign up, which never changes what we report. Gambling involves risk: play only with money you can afford to lose. <a href="${esc(utm("/responsible-gambling", "rg"))}" style="color:#8DA0AA;">Responsible gambling</a>
          </td>
        </tr>
      </table>
      <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">
        <tr>
          <td align="center" style="padding:18px 12px; ${F} font-size:12px; line-height:19px; color:#5E6B73;">
            You're getting this because you signed up at <a href="https://cryptoslotguide.com/" style="color:#8DA0AA;">cryptoslotguide.com</a>.<br>
            <a href="{{{unsubscribe}}}" style="color:#8DA0AA;">Unsubscribe</a> &nbsp;·&nbsp; <a href="{{{unsubscribe_preferences}}}" style="color:#8DA0AA;">Email preferences</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

const out = resolve(__dirname, "..", "..", "docs", `email-news-${month}.html`);
writeFileSync(out, html);
console.log(`wrote ${out} (${items.length} items, ${codes.length} codes)`);
