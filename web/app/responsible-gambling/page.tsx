import { pageMetadata, SITE_NAME } from "@/lib/seo";
import { InfoPage, A } from "@/components/info/InfoPage";

export const metadata = pageMetadata(
  "Responsible gambling: limits, self-exclusion and where to get help",
  "Gambling should be entertainment, not income. The limits and self-exclusion tools crypto casinos offer, warning signs to watch for, blocking software, and free, confidential help lines.",
  "/responsible-gambling"
);

const HELP: { name: string; where: string; contact: string; href: string }[] = [
  { name: "National Gambling Helpline (GamCare)", where: "UK", contact: "0808 8020 133, free, 24/7", href: "https://www.gamcare.org.uk" },
  { name: "BeGambleAware", where: "UK", contact: "Advice, self-assessment and local support", href: "https://www.begambleaware.org" },
  { name: "National Problem Gambling Helpline (NCPG)", where: "US", contact: "1-800-MY-RESET (1-800-697-3738)", href: "https://www.ncpgambling.org/help-treatment/" },
  { name: "ConnexOntario", where: "Ontario, Canada", contact: "1-866-531-2600", href: "https://www.connexontario.ca" },
  { name: "Gambling Help Online", where: "Australia", contact: "Free, confidential online and phone support", href: "https://www.gamblinghelponline.org.au" },
  { name: "Gambling Therapy", where: "Worldwide, in several languages", contact: "Free online support and forums", href: "https://www.gamblingtherapy.org" },
  { name: "Gamblers Anonymous", where: "Worldwide", contact: "Peer support meetings", href: "https://www.gamblersanonymous.org" },
];

export default function Page() {
  return (
    <InfoPage
      kicker="Play safely"
      title="Responsible gambling"
      path="/responsible-gambling"
      tint="#57E39A"
      intro={<p style={{ margin: 0 }}>Gambling is entertainment that costs money, never a way to make it. The house edge means the longer you play, the more you should expect to lose. You must be 18 or older, or the legal age where you live if that&apos;s higher. If it stops being fun, stop, and use the tools and help below.</p>}
      sections={[
        {
          title: "Set your limits before you play",
          body: (
            <>
              <p style={{ margin: 0 }}>Decide what you can afford to lose and how long you&apos;ll play before you deposit, not after. Most crypto casinos let you set deposit, loss or wager limits and time-outs from your account settings, and you can ask their support for a cool-off or self-exclusion. Our casino reviews list each casino's deposit limits where it publishes them, and some offer fewer tools than others: Rainbet, for example, offers loss limits rather than deposit limits.</p>
              <p style={{ margin: 0 }}>Crypto prices move. Playing with a stablecoin like USDT or USDC keeps a bankroll from shrinking or growing with the market, so a loss is the loss you see. Our guide to <A href="/how-to-set-a-crypto-gambling-budget-that-actually-works">setting a crypto gambling budget</A> walks through it.</p>
            </>
          ),
        },
        {
          title: "Warning signs",
          body: (
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>Spending more money or time than you planned, or chasing losses to win them back.</li>
              <li>Borrowing, selling things or moving savings into crypto to keep playing.</li>
              <li>Hiding how much you gamble from people close to you.</li>
              <li>Feeling anxious, irritable or low when you&apos;re not gambling, or gambling to escape those feelings.</li>
              <li>Gambling getting in the way of work, sleep or relationships.</li>
            </ul>
          ),
        },
        {
          title: "Self-exclusion and blocking",
          body: (
            <>
              <p style={{ margin: 0 }}>Most of the crypto casinos we cover are licensed offshore, so national self-exclusion schemes such as the UK&apos;s <A href="https://www.gamstop.co.uk">GAMSTOP</A> don&apos;t reach them. To exclude yourself from one, contact its support and ask for a self-exclusion on your account; do it at each casino where you hold an account.</p>
              <p style={{ margin: 0 }}>Blocking software stops gambling sites loading on your devices: <A href="https://gamban.com">Gamban</A> is a paid option and <A href="https://betblocker.org">BetBlocker</A> is free.</p>
            </>
          ),
        },
        {
          title: "Where to get help",
          body: (
            <>
              <p style={{ margin: 0 }}>These services are free and confidential. Talking to someone early helps.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                {HELP.map((h) => (
                  <a key={h.name} href={h.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", borderRadius: 12, background: "#0C1013", border: "1px solid rgba(87,227,154,.25)" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10.5, letterSpacing: ".06em", color: "#57E39A" }}>{h.where.toUpperCase()}</span>
                    <span style={{ fontSize: 15.5, fontWeight: 800, color: "#fff" }}>{h.name}</span>
                    <span style={{ fontSize: 14, color: "#A8B6BE" }}>{h.contact}</span>
                  </a>
                ))}
              </div>
            </>
          ),
        },
        {
          title: "Our part",
          body: (
            <p style={{ margin: 0 }}>We don&apos;t present gambling as a way to make money, we show every bonus with the wagering it carries, and our reviews link to the limits and self-exclusion tools each casino offers. If you think a page on this site encourages harmful play, tell us at <A href="mailto:hello@cryptoslotguide.com">hello@cryptoslotguide.com</A>.</p>
          ),
        },
      ]}
    />
  );
}
