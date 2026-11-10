/**
 * First-hand tests: what we saw with our own account at a casino, shown as a
 * "We tested it" section on its review (components/casino/FirstHandTest.tsx).
 *
 * Only what the screenshots prove goes in `findings`; anything we remember but
 * didn't record goes in `recollection` and is labelled as such. Screenshots
 * live in public/tests/<slug>/ with anything identifying (balances, dates that
 * pin a transaction on-chain, usernames) cropped or blurred before they're
 * committed.
 */

export type TestShot = { src: string; width: number; height: number; alt: string; caption: string };

export type FirstHandTest = {
  slug: string;
  /** When the screenshots were taken (ISO date). */
  checked: string;
  /** When the account activity happened, in words, as precisely as we can honestly say. */
  activity: string;
  summary: string;
  findings: string[];
  recollection?: string;
  shots: TestShot[];
  steps: { title: string; body: string }[];
  /** What the next test will add. */
  next?: string;
};

export const FIRST_HAND_TESTS: FirstHandTest[] = [
  {
    slug: "razed",
    checked: "2026-11-10",
    activity: "2025",
    summary: "We deposited at Razed twice in 2025, both credited, and withdrew €17.37 in crypto, which Razed marked as paid with an on-chain transaction ID.",
    findings: [
      "Withdrawal paid: €17.37 sent in crypto, status \"Paid\", with a transaction ID linked from the account's Transactions page.",
      "Deposits: two deposits in 2025, both marked \"Approved\".",
      "Coins you can withdraw: eight (USDT, ETH, BTC, LTC, XRP, TRX, USDC and SOL), fewer than the 13 Razed lists for deposits. If you deposit DOGE, DAI, BCH, ALGO or SHFL, plan to withdraw in one of the eight.",
      "Fees come out of the amount: on USDT over the ERC-20 network the cashier showed a €2.68 network fee and a €12.54 minimum withdrawal, with a \"You will get\" line showing what lands after the fee.",
      "On a euro account the cashier listed no card or bank withdrawal method (\"No payments\"), so cashing out to a bank means going through a crypto exchange.",
    ],
    recollection: "We didn't log timestamps, so we can't give a measured payout time. As we remember it, both the deposit and the withdrawal went through instantly, which matches Razed's own \"instant withdrawals\" claim.",
    shots: [
      { src: "/tests/razed/withdrawal-paid.webp", width: 965, height: 225, alt: "Razed Transactions page showing a €17.37 withdrawal with status Paid and a TXID link", caption: "Our withdrawal: €17.37, marked Paid, with its transaction ID. Date blurred." },
      { src: "/tests/razed/usdt-withdrawal.webp", width: 835, height: 541, alt: "Razed cashier withdrawing USDT on ERC-20 with a €12.54 minimum and €2.68 network fee", caption: "The withdrawal form: pick the coin and network, paste your address. On USDT (ERC-20): €2.68 fee, €12.54 minimum." },
      { src: "/tests/razed/cashier.webp", width: 835, height: 532, alt: "Razed cashier withdrawal tab listing eight cryptocurrencies and no card or cash methods for EUR", caption: "Eight coins to withdraw; no card or bank method on a euro account." },
    ],
    steps: [
      { title: "Open the cashier", body: "Click Wallet at the top of Razed, then the Withdrawal tab." },
      { title: "Pick the coin and network", body: "Choose the coin your exchange or wallet accepts, then the network. Each network has its own fee and minimum, shown before you confirm, so compare them: the fee is taken from what you receive." },
      { title: "Paste your address", body: "In your exchange (for example Coinbase: Receive; Kraken: Transfer, then Deposit), copy the deposit address for that exact coin and network, and paste it into Razed. A wrong network can lose the funds." },
      { title: "Enter the amount and confirm", body: "Enter the amount (at least the minimum shown), check \"You will get\", press Withdraw and confirm with two-factor authentication if it's on." },
      { title: "Cash out to your bank", body: "Once it lands on the exchange, sell the coin for your currency and withdraw to your bank from there. Canadian accounts can also withdraw CAD by Interac e-Transfer in Razed's cashier, approving the transfer in their bank." },
    ],
    next: "Our next Razed test will time a withdrawal end to end, from pressing Withdraw to funds on the exchange, and add it here.",
  },
];

export const firstHandTest = (slug: string) => FIRST_HAND_TESTS.find((t) => t.slug === slug) ?? null;
