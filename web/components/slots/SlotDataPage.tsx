import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { FeaturedPartner } from "@/components/ui/FeaturedPartner";
import { thumbOf } from "@/lib/thumb";
import { EmailSignup } from "@/components/ui/EmailSignup";
import { SlotPerks } from "@/components/slots/SlotPerks";
import { NextSteps } from "@/components/layout/NextSteps";
import { publishableArt, rtpSpread, rtpVersions, singleRtp, rtpSource, slotSpecs, type CatalogueSlotPage } from "@/lib/slot-page";
import { isTopSlot } from "@/lib/top-slots";
import { approvalsFor } from "@/lib/game-jurisdictions";
import { slotEssentialsLink, slotEssentialsLabel, slotEssentialsStudio } from "@/lib/slotessentials";
import { studioHref } from "@/lib/studio-pages";

/**
 * A catalogue slot's page: the RTP configurations a studio publishes for one
 * title, and the specs that go with them.
 *
 * Deliberately not shaped like the hand-written reviews in slots.json. Those
 * are played and argued; this page has one thing to say and says it — the
 * same game is licensed at more than one return, and the casino chooses. The
 * page leads on that number instead of padding it out with prose that would
 * read the same on all 410 of these.
 */

const MONO = "var(--font-jetbrains-mono), monospace";

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "14px 16px", borderRadius: 12, background: "#0E1316", border: "1px solid rgba(255,255,255,.07)", minWidth: 0 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#8E9CA5" }}>{k}</span>
      <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em", color: "#fff" }}>{v}</span>
    </div>
  );
}

export function SlotDataPage({ g, review }: { g: CatalogueSlotPage; review?: React.ReactNode }) {
  const versions = rtpVersions(g);
  const spread = rtpSpread(g);
  const only = singleRtp(g);
  const art = publishableArt(g);
  const specs = slotSpecs(g);
  const studio = g.provider ?? "the studio";
  const src = rtpSource(g);
  const approvals = approvalsFor(g.slug ?? "");
  const pick = isTopSlot(g.slug ?? "");

  return (
    <main style={{ background: "#07090B", color: "#E8EDF0" }}>
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.07)", background: "radial-gradient(100% 100% at 20% 0%, rgba(0,194,204,.07), transparent 60%), #0B0F12" }}>
        {art && (
          // The game's colours as a soft wash behind the hero; the 128px tile
          // is plenty once blurred.
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", inset: "-10%", backgroundImage: `url(${thumbOf(art)})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(44px) saturate(1.5)", opacity: 0.55, transform: "scale(1.1)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,15,18,.55) 0%, rgba(11,15,18,.82) 45%, #0B0F12 100%), linear-gradient(0deg, #0B0F12 0%, transparent 45%)" }} />
          </div>
        )}
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "40px 40px 44px" }}>
          <nav style={{ fontFamily: MONO, fontSize: 11, color: "#83919A", marginBottom: 22 }}>
            <Link href="/slots" style={{ color: "#83919A" }}>Slots</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            {studioHref(g.provider) ? (
              <Link href={studioHref(g.provider) as string} style={{ color: "#83919A" }}>{studio}</Link>
            ) : (
              <span>{studio}</span>
            )}
            {slotEssentialsStudio(g.provider) && (
              <a href={slotEssentialsStudio(g.provider) as string} target="_blank" rel="noopener" style={{ marginLeft: 12, color: "#5FE3E8" }}>
                {studio} on SlotEssentials ↗
              </a>
            )}
          </nav>

          <div style={{ display: "flex", gap: 26, alignItems: "flex-start", flexWrap: "wrap" }}>
            {art && (
              // next/image, not a bare img: the source files are 1000px wide
              // and this draws at 240, so 393 pages would each ship about 40KB
              // of art to paint a thumbnail.
              //
              // priority, because this is the largest element above the fold —
              // lazy-loading it makes it the LCP and then defers it. The 5:3
              // ratio is the art's own; a square would crop the title off it.
              <Image
                src={art}
                alt={`${g.name} game art`}
                width={480}
                height={288}
                sizes="240px"
                priority
                style={{ width: 240, height: 144, objectFit: "cover", borderRadius: 14, border: "1px solid rgba(255,255,255,.09)", flex: "0 0 auto" }}
              />
            )}
            <div style={{ flex: "1 1 340px", minWidth: 0 }}>
              {pick && (
                <div style={{ display: "inline-block", marginBottom: 10, padding: "4px 10px", borderRadius: 100, background: "rgba(255,197,49,.12)", border: "1px solid rgba(255,197,49,.3)", fontFamily: MONO, fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "#FFC531" }}>
                  One of our top slots
                </div>
              )}
              <h1 style={{ margin: "0 0 12px", fontSize: 40, lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 800, color: "#fff", textWrap: "balance" }}>
                {g.name} RTP
              </h1>
              <p style={{ margin: 0, maxWidth: "62ch", fontSize: 16, lineHeight: 1.6, color: "#A8B6BE" }}>
                {versions.length > 1 ? (
                  <>
                    {studio} licenses {g.name} at {versions.length} different returns — {versions[0]}% down to{" "}
                    {versions[versions.length - 1]}%, a spread of {spread} percentage points. Which one you play is set by the casino, not by you, and
                    the lobby does not show it.
                  </>
                ) : (
                  <>
                    {studio} publishes a single return of {only}% for {g.name}. Studios that licence more than one build do not always say so, so check
                    the figure in the game&rsquo;s own info panel before you judge it by this one.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 40px 0" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>
          {versions.length > 1 ? "Published configurations" : "Published return"}
        </h2>
        <p style={{ margin: "0 0 18px", maxWidth: "70ch", fontSize: 14, lineHeight: 1.6, color: "#8DA0AA" }}>
          {versions.length > 1 ? <>Every return {studio} publishes for this title, highest first.</> : <>What {studio} publishes for this title.</>}
          {src && (
            <>
              {" "}
              Read from{" "}
              <a href={src.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" style={{ color: "#5FE3E8" }}>
                {src.studio}&rsquo;s own game page
              </a>
              , which beats the catalogue feed.
            </>
          )}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {(versions.length ? versions : only !== null ? [only] : []).map((v, i) => (
            <div
              key={v}
              style={{
                padding: "18px 18px 16px",
                borderRadius: 14,
                background: i === 0 ? "rgba(95,227,232,.07)" : "#0E1316",
                border: `1px solid ${i === 0 ? "rgba(95,227,232,.3)" : "rgba(255,255,255,.07)"}`,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: i === 0 ? "#5FE3E8" : "#8E9CA5", marginBottom: 6 }}>
                {i === 0 ? "Best published" : versions.length === 2 ? "Also licensed" : `Version ${i + 1}`}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.03em", color: i === 0 ? "#5FE3E8" : "#fff" }}>{v}%</div>
            </div>
          ))}
        </div>
        {versions.length > 1 && (
        <p style={{ margin: "14px 0 0", maxWidth: "70ch", fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA" }}>
          On a {versions[0]}% build the house keeps {(100 - versions[0]).toFixed(2)}% of turnover. On the{" "}
          {versions[versions.length - 1]}% build it keeps {(100 - versions[versions.length - 1]).toFixed(2)}% — {spread ? `${(((100 - versions[versions.length - 1]) / (100 - versions[0]) - 1) * 100).toFixed(0)}% more` : "more"} out of
          the same stake. <Link href="/rtp-watch" style={{ color: "#5FE3E8" }}>RTP Watch</Link> records which build each casino ships.
        </p>
        )}
      </section>

      {/* A slot sold in several RTP builds is the one where knowing which
          build a casino ships matters, so the sign-up sits here, on those
          pages only. Same weekly email; the source tags the slot. */}
      {versions.length > 1 && (
        <section id="signup" style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px 0", scrollMarginTop: 120 }}>
          <EmailSignup
            source={`rtp:${g.slug ?? ""}`.slice(0, 40)}
            eyebrow="RTP Watch"
            title={`Know which ${g.name} build you're playing`}
            sub={`${g.name} ships in ${versions.length} RTP builds. When RTP Watch records which build a casino runs, or a studio changes its published figures, it's in our weekly email, along with the week's biggest races. One email a week, unsubscribe any time.`}
            button="Get RTP updates"
          />
        </section>
      )}

      {/* Right after the returns, where most readers still are — not only at
          the foot of the page. Same partners, same geo rules. */}
      <section className="csg-partner-slot" style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 40px 0" }}>
        <SlotPerks slot={g.name} signupHref={versions.length > 1 ? "#signup" : "#signup-band"} />
        <FeaturedPartner context={{ kind: "slots" }} exclude="roobet" count={2} heading="More casinos we recommend" />
      </section>

      {specs.length > 0 && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 0" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Specs</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {specs.map((s) => (
              <Spec key={s.k} k={s.k} v={s.v} />
            ))}
          </div>
        </section>
      )}

      {g.demoUrl && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 0" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", padding: "20px 22px", borderRadius: 16, background: "#0E1316", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Play it free on {g.demoHost ?? "the studio's site"}</div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#8DA0AA" }}>
                {studio}&rsquo;s own demo, on their domain — no account, no deposit. Demo builds run at the studio default, so treat it as the game, not as
                the return your casino will serve.
              </p>
            </div>
            <a
              href={g.demoUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              style={{ flex: "0 0 auto", padding: "12px 18px", borderRadius: 10, border: "1px solid rgba(95,227,232,.35)", color: "#5FE3E8", fontSize: 14, fontWeight: 700 }}
            >
              Open demo ↗
            </a>
          </div>
        </section>
      )}

      {approvals && (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>Where this game is approved</h2>
          <p style={{ margin: "0 0 16px", maxWidth: "70ch", fontSize: 13.5, lineHeight: 1.6, color: "#8DA0AA" }}>
            From {approvals.studio}&rsquo;s own game sheet. A regulated market licenses the game as well as the casino, so an operator can be live in a
            province while a particular slot is not.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {approvals.rows.map((r) => {
              const tint =
                r.state === "approved" ? { bg: "rgba(47,182,122,.1)", br: "rgba(47,182,122,.3)", fg: "#7BE0B8" }
                : r.state === "not-approved" ? { bg: "rgba(255,255,255,.03)", br: "rgba(255,255,255,.08)", fg: "#6E7A82" }
                : { bg: "rgba(199,164,92,.08)", br: "rgba(199,164,92,.26)", fg: "#C7A45C" };
              return (
                <span
                  key={r.key}
                  title={r.state === "unstated" ? `The sheet says "${r.raw}", which we do not translate into a yes or a no` : undefined}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 100, background: tint.bg, border: `1px solid ${tint.br}`, fontSize: 12.5, color: tint.fg }}
                >
                  {r.name}
                  {r.state === "unstated" && <span style={{ fontFamily: MONO, fontSize: 10 }}>{r.raw}</span>}
                </span>
              );
            })}
          </div>
          <p style={{ margin: "12px 0 0", maxWidth: "70ch", fontSize: 12.5, lineHeight: 1.55, color: "#77858E" }}>
            Green is a plain &ldquo;Yes&rdquo; on the sheet. Grey is a plain &ldquo;No&rdquo;. Amber is anything else the studio wrote — codes like GNC or
            RFA that we do not translate into a yes or a no, because we do not know what they mean.
          </p>
        </section>
      )}

      {review}

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px 80px" }}>
        <NextSteps
          steps={[
            {
              label: `Every ${studio} slot we hold`,
              href: `/slots/database?studio=${encodeURIComponent(g.provider ?? "")}`,
              hint: "The full catalogue, filterable by RTP, volatility and max win.",
            },
            {
              label: "Slots with more than one RTP version",
              href: "/slots/database?versions=1",
              hint: "Every title we hold that a studio licenses at more than one return.",
            },
            {
              label: "Which casinos ship a cut build",
              href: "/rtp-watch",
              hint: "The return stated inside each operator's own client, recorded per build.",
            },
            {
              label: "How casino RTP versions work",
              href: "/guides/how-casino-rtp-versions-work",
              hint: "Why the same game pays differently at two casinos, and how to check.",
            },
          ]}
        />
      </section>
    </main>
  );
}
