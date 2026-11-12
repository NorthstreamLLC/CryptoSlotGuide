import Link from "next/link";
import Image from "next/image";
import { pickPartners } from "@/lib/partner-fit";
import { typeableCode } from "@/lib/promo-pages";
import { GeoRanked } from "@/components/geo/GeoRanked";
import { DemoPlay } from "@/components/slots/DemoPlay";
import { demoFor } from "@/lib/slot-demos";
import { GeoBlockNote } from "@/components/geo/GeoBlockNote";

/**
 * The right half of a slot page's hero: the game's own art, large, with its
 * key figures laid on it, then one place to play it. The art is what a reader
 * came for and the most engaging thing we hold for a slot; the casino button
 * sits under it rather than being the hero.
 *
 * The casino is the partner that fits this page (lib/partner-fit.ts, rotated
 * by the slot's slug), replaced by the next fit where the visitor's location
 * is shut to it. The button never claims the title is in that lobby.
 */
export function SlotHeroArt({
  art,
  name,
  studio,
  chips,
  seed,
  tint = "#5FE3E8",
  back,
}: {
  art: string;
  name: string;
  studio?: string | null;
  /** Up to three figures for the art, e.g. { label: "RTP", value: "96.50%" }. */
  chips: { label: string; value: string }[];
  seed: string;
  tint?: string;
  back?: { href: string; label: string };
}) {
  const demo = demoFor(seed);
  const picks = pickPartners({ context: { kind: "slots" }, seed, limit: 4 });
  const shown = chips.filter((c) => c.value && !/not published/i.test(c.value)).slice(0, 3);
  const slotSites = (
    <Link href="/slots/best-crypto-slot-sites" className="sha-cta" style={{ background: "#F2F5F7", color: "#0A0D0F" }}>
      Where to play slots →
    </Link>
  );

  return (
    <div className="sha" data-placement="slot-hero" style={{ ["--tint" as string]: tint }}>
      <style>{CSS}</style>
      <div className="sha-frame">
        {/* priority: the largest thing above the fold, so it is the LCP. */}
        <Image src={art} alt={`${name} game art`} width={960} height={600} sizes="(max-width: 860px) 100vw, 480px" priority className="sha-img" />
        <div className="sha-shade" aria-hidden />
        {demo && <DemoPlay url={demo.url} name={name} studio={demo.studio} slug={seed} />}
        {studio && <span className="sha-studio">{studio}</span>}
        {shown.length > 0 && (
          <dl className="sha-chips">
            {shown.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="sha-foot">
        {picks.length ? (
          <GeoRanked
            count={1}
            note={<GeoBlockNote slug={picks[0].o.slug} name={picks[0].o.name} compact none allOf={picks.map((p) => p.o.slug)} />}
            items={picks.map(({ o }) => {
              const code = typeableCode(o.slug, o.promoCode) ? o.promoCode : null;
              return {
                slug: o.slug,
                node: (
                  <div className="sha-play">
                    <a href={o.signupUrl as string} target="_blank" rel="nofollow sponsored noopener" data-copy-code={code ?? undefined} className="sha-cta">
                      Play slots at {o.name} ↗
                    </a>
                    <span className="sha-note">
                      Our pick for this page{code ? <> · code <b>{code}</b></> : null} · <Link href={`/casinos/${o.slug}`}>review</Link> · affiliate link, 18+
                    </span>
                  </div>
                ),
              };
            })}
          />
        ) : (
          slotSites
        )}
        {back && (
          <Link href={back.href} className="sha-back">
            {back.label}
          </Link>
        )}
      </div>
    </div>
  );
}

const CSS = `
.sha { position: relative; }
.sha-frame { position: relative; border-radius: 18px; overflow: hidden; aspect-ratio: 16 / 10; background: #0C1013; border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 30px 80px -20px color-mix(in srgb, var(--tint) 45%, transparent), 0 18px 50px rgba(0,0,0,.55); transform: perspective(1200px) rotateY(-4deg); transform-origin: left center; transition: transform .4s ease; }
.sha:hover .sha-frame { transform: perspective(1200px) rotateY(0deg); }
.sha-img { display: block; width: 100%; height: 100%; object-fit: cover; }
.sha-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(7,9,11,0) 45%, rgba(7,9,11,.88) 100%); }
.sha-studio { position: absolute; top: 12px; left: 12px; padding: 4px 9px; border-radius: 100px; background: rgba(7,9,11,.7); border: 1px solid rgba(255,255,255,.14); backdrop-filter: blur(6px); font-size: 11.5px; font-weight: 600; color: #E8EDF0; }
.sha-chips { position: absolute; left: 12px; right: 12px; bottom: 12px; margin: 0; display: flex; gap: 8px; flex-wrap: wrap; }
.sha-chips div { padding: 7px 11px; border-radius: 10px; background: rgba(7,9,11,.72); border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(6px); }
.sha-chips dt { font-size: 10.5px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #9AA9B1; }
.sha-chips dd { margin: 1px 0 0; font-size: 16px; font-weight: 700; letter-spacing: -.01em; color: #fff; }
.sha-foot { display: flex; flex-direction: column; gap: 9px; margin-top: 16px; }
.sha-play { display: flex; flex-direction: column; gap: 7px; }
.sha-cta { display: block; text-align: center; padding: 14px; border-radius: 11px; background: #FFC531; color: #141007; font-size: 15px; font-weight: 700; transition: transform .15s, background .15s; }
.sha-cta:hover { transform: translateY(-1px); background: #FFD45E; }
.sha-note { text-align: center; font-size: 12px; color: #7E8C94; }
.sha-note b { color: #DCE5E9; font-weight: 700; }
.sha-note a { color: #A9B8C0; text-decoration: underline; text-underline-offset: 2px; }
.sha-back { display: block; text-align: center; padding: 12px; border-radius: 11px; border: 1px solid rgba(255,255,255,.14); color: #DCE5E9; font-size: 13.5px; font-weight: 600; }
.sha-back:hover { border-color: rgba(255,255,255,.3); }
@media (max-width: 760px) { .sha-frame { transform: none; } .sha:hover .sha-frame { transform: none; } }
`;
