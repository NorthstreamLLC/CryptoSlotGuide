import { EmailSignup } from "@/components/ui/EmailSignup";

/** Site-wide newsletter sign-up, shown above the footer on every page. */
export function NewsletterBand() {
  return (
    <section style={{ background: "#07090B", borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "44px 24px" }}>
        <EmailSignup
          source="site"
          title="For the best casino bonuses, join our newsletter"
          sub="The best affiliate casino bonuses, the biggest races, raffles, leaderboards and what changed at each casino this week. One email a week, no spam, unsubscribe any time."
        />
      </div>
    </section>
  );
}
