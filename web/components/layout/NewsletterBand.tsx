import { EmailSignup } from "@/components/ui/EmailSignup";

/** Site-wide newsletter sign-up above the footer, hidden (globals.css) on pages that carry their own topic sign-up, so no page asks twice. */
export function NewsletterBand() {
  return (
    <section id="signup-band" className="csg-nl-band" style={{ background: "#07090B", borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px" }}>
        <EmailSignup
          source="site"
          title="What changed at your casinos, once a month"
          sub="New bonuses, fee and rule changes, licence updates and the month's biggest races at the casinos we cover, each with its source. One email a month, no spam, unsubscribe any time."
        />
      </div>
    </section>
  );
}
