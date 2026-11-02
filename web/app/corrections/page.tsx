import Link from "next/link";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { CORRECTIONS } from "@/lib/corrections";
import { InfoPage, A } from "@/components/info/InfoPage";

export const metadata = pageMetadata(
  "Corrections",
  `How ${SITE_NAME} handles mistakes, and a dated log of what we got wrong and what we changed.`,
  "/corrections"
);

const MONO = "var(--font-jetbrains-mono), monospace";
const day = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function Page() {
  return (
    <InfoPage
      kicker="Accountability"
      title="Corrections"
      path="/corrections"
      tint="#FF9CC6"
      intro={<p style={{ margin: 0 }}>When something on {SITE_NAME} is wrong, we fix it on the page, date the fix, and record it here. A mistake a reader could have acted on is never edited away silently.</p>}
      sections={[
        {
          title: "How to report a mistake",
          body: <p style={{ margin: 0 }}>Email <A href="mailto:hello@cryptoslotguide.com">hello@cryptoslotguide.com</A> with the page address and what you found, ideally with a link to the casino&apos;s own page. We re-check every report we can reproduce against the original source. Changes to a casino&apos;s terms that we find ourselves go in our <A href="/news">monthly news</A> instead; this log is for our own errors.</p>,
        },
      ]}
    >
      <h2 style={{ margin: "40px 0 14px", fontSize: 23, letterSpacing: "-.015em", fontWeight: 800, color: "#fff" }}>Corrections log</h2>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {CORRECTIONS.map((c, i) => (
          <li key={i} style={{ padding: "16px 18px", borderRadius: 14, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)", borderLeft: "3px solid #FF9CC6" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#FF9CC6" }}>{day(c.date)}</span>
              <Link href={c.href} style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{c.page} →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "#8DA0AA" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", color: "#7F8D96", marginBottom: 4 }}>WHAT WAS WRONG</div>
                {c.wrong}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: "#DCE5E9" }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".08em", color: "#57E39A", marginBottom: 4 }}>WHAT IT SAYS NOW</div>
                {c.fixed}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </InfoPage>
  );
}
