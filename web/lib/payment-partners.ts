/**
 * Payment providers named in the operators' own payment pages.
 *
 * The banking section used to render these as a sentence — "Footer payment
 * partners: Skrill, AstroPay, Interac, Pix, Webpay and UPI" — which is the
 * least scannable way to present the one thing a reader checks before signing
 * up: whether the rail they actually use is there. A row of marks answers that
 * at a glance; a sentence makes them read it.
 *
 * Nothing here is a new claim. A provider is only shown for a casino when that
 * casino's OWN cited page names it, and the sentence stays underneath with its
 * source link. This layer just finds the names already in the text.
 *
 * `domain` is the provider's own site, and it is the only place its mark is
 * fetched from — scripts/fetch-payment-logos.mjs, same rule as the casino and
 * studio marks. Pix and UPI are national schemes rather than companies, so
 * they point at the institution that runs them: the Banco Central do Brasil
 * and India's NPCI.
 */

export interface PaymentPartner {
  slug: string;
  name: string;
  domain: string;
  /**
   * How the name appears in operator copy. Written out rather than derived
   * from the name because several differ: "paysafecard" is one lowercase word,
   * Apple and Google Pay are written both with and without the "Pay", and a
   * bare /visa/ would match "visa requirements" in a KYC sentence.
   */
  match: RegExp;
}

export const PAYMENT_PARTNERS: PaymentPartner[] = [
  { slug: "visa", name: "Visa", domain: "www.visa.com", match: /\bvisa\b(?!\s*(requirement|applicat|status))/i },
  { slug: "mastercard", name: "Mastercard", domain: "www.mastercard.com", match: /\bmaster\s?card\b/i },
  { slug: "apple-pay", name: "Apple Pay", domain: "www.apple.com", match: /\bapple pay\b/i },
  { slug: "google-pay", name: "Google Pay", domain: "pay.google.com", match: /\bgoogle pay\b/i },
  { slug: "skrill", name: "Skrill", domain: "www.skrill.com", match: /\bskrill\b/i },
  { slug: "neteller", name: "Neteller", domain: "www.neteller.com", match: /\bneteller\b/i },
  { slug: "paysafecard", name: "paysafecard", domain: "www.paysafecard.com", match: /\bpaysafe\s?card\b/i },
  { slug: "astropay", name: "AstroPay", domain: "www.astropay.com", match: /\bastro\s?pay\b/i },
  { slug: "interac", name: "Interac", domain: "www.interac.ca", match: /\binterac\b/i },
  { slug: "pix", name: "Pix", domain: "www.bcb.gov.br", match: /\bpix\b/i },
  { slug: "upi", name: "UPI", domain: "www.npci.org.in", match: /\bUPI\b/ },
  { slug: "webpay", name: "Webpay", domain: "www.webpay.cl", match: /\bweb\s?pay\b/i },
  { slug: "papara", name: "Papara", domain: "www.papara.com", match: /\bpapara\b/i },
  { slug: "moonpay", name: "MoonPay", domain: "www.moonpay.com", match: /\bmoon\s?pay\b/i },
  { slug: "banxa", name: "Banxa", domain: "banxa.com", match: /\bbanxa\b/i },
  { slug: "changelly", name: "Changelly", domain: "changelly.com", match: /\bchangelly\b/i },
  { slug: "rapid-transfer", name: "Rapid Transfer", domain: "www.paysafe.com", match: /\brapid transfer\b/i },
];

const BY_SLUG = new Map(PAYMENT_PARTNERS.map((p) => [p.slug, p]));
export const paymentPartner = (slug: string) => BY_SLUG.get(slug);

/**
 * The providers a cited sentence names, in the registry's own order so the
 * card reads the same way on every casino — cards first, then wallets, then
 * the local rails — rather than in whatever order the operator listed them.
 */
export function detectPartners(value: string | null | undefined): PaymentPartner[] {
  if (!value) return [];
  return PAYMENT_PARTNERS.filter((p) => p.match.test(value));
}
