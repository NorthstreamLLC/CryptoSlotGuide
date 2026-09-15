/**
 * Split out of components/casinos/RoobetReviewPage.tsx so app/casinos/
 * roobet/page.tsx (a Server Component) can use it for FAQPage schema.
 * Importing a plain constant from a "use client" module works for
 * rendering, but schema.org JSON-LD needs to land in the server-
 * rendered HTML reliably — keeping it in a plain module avoids that
 * boundary entirely.
 */
export const faqData = [
  { q: "Is Roobet available in my country?", a: "Roobet's terms restrict 25 jurisdictions, including the whole United States, the United Kingdom, the Netherlands and Australia — the full list is in the spec sheet above, and its geo-block is active — it blocked a request we sent from a restricted region — so check the list before depositing rather than after." },
  { q: "Do I have to complete KYC?", a: "Possibly. Roobet's terms let it request KYC documents at any time, and it can refuse a withdrawal until your identity is fully verified. It doesn't publish a fixed threshold." },
  { q: "What does 1× wagering actually mean here?", a: "Roobet's bonus policy states no wagering multiplier for rakeback. The one turnover rule in its help centre is an anti-money-laundering one: a deposit must be wagered 100% before you withdraw it. That is materially different from a 40× match bonus, where a $100 credit needs $4,000 of wagering." },
  { q: "How fast are withdrawals really?", a: "Roobet says it sends withdrawals instantly on request, with arrival depending on blockchain confirmations. We haven't timed withdrawals here ourselves yet — that's the first thing a field test will confirm or correct." },
  { q: "Does CryptoSlotGuide get paid for this ranking?", a: "We receive commission when a reader signs up through our links, including Roobet. Commission rates are not an input to any score, the scoring sheet is published, and every operator on the index is reviewed on the same six criteria whether or not we have a commercial relationship with them." },
];
