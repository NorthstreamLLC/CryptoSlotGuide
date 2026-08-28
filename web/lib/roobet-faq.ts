/**
 * Split out of components/casinos/RoobetReviewPage.tsx so app/casinos/
 * roobet/page.tsx (a Server Component) can use it for FAQPage schema.
 * Importing a plain constant from a "use client" module works for
 * rendering, but schema.org JSON-LD needs to land in the server-
 * rendered HTML reliably — keeping it in a plain module avoids that
 * boundary entirely.
 */
export const faqData = [
  { q: "Is Roobet available in my country?", a: "Roobet blocks a long list of jurisdictions including the UK, the Netherlands, Australia and several US states. Its restricted list is published in the terms and is enforced at registration and again at withdrawal, so check it before depositing rather than after." },
  { q: "Do I have to complete KYC?", a: "Not for small volumes, per Roobet's published policy: withdrawals below a cumulative 2 BTC equivalent are said to clear with no document request. Above that, or if activity triggers a review, expect a standard ID and address check — timing pending our own field-test pass." },
  { q: "What does 1× wagering actually mean here?", a: "Cashback and RooWards credit arrives as balance that must be turned over once before withdrawal. That is materially different from a 40× match bonus: on a $100 credit you need $100 of wagering rather than $4,000." },
  { q: "How fast are withdrawals really?", a: "4 min 12s is Roobet's own published median. We haven't timed withdrawals here ourselves yet — that's the first thing our field-test pass will confirm or correct." },
  { q: "Does CryptoSlotGuide get paid for this ranking?", a: "We receive commission when a reader signs up through our links, including Roobet. Commission rates are not an input to any score, the scoring sheet is published, and every operator on the index is reviewed on the same six criteria whether or not we have a commercial relationship with them." },
];
