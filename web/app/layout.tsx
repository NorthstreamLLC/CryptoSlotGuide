import { NewsletterPopup } from "@/components/layout/NewsletterPopup";
import { buildNotifications } from "@/lib/notifications";
import type { Metadata } from "next";
import { buildNavTabs } from "@/lib/nav";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CodeCopier } from "@/components/ui/CodeCopier";
import { AgeGate } from "@/components/layout/AgeGate";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterBand } from "@/components/layout/NewsletterBand";
import { siteCounts } from "@/lib/site-data";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { ogCardPath } from "@/lib/og";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Bing Webmaster Tools ownership check; must stay after verification.
  verification: { other: { "msvalidate.01": "834A5A7DDD9FF6EC9294E283B70E3189" } },
  title: {
    default: "CryptoSlotGuide — crypto casino, slot and wallet information",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Crypto casino, slot, sportsbook and wallet reviews that say where every figure comes from — field-tested once we fund an account, assessed from public sources until then, and labelled either way.",
  // The card for any page that sets no Open Graph of its own (lib/og.ts).
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: ogCardPath("Crypto casinos, slots and sportsbooks — every figure sourced", "/"), width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-page text-text-primary">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <a href="#main" className="csg-skip">Skip to content</a>
        <Header counts={siteCounts} navTabs={buildNavTabs(siteCounts)} notifs={buildNotifications()} />
        <RevealObserver />
        <div id="main" className="flex-1">{children}</div>
        <NewsletterBand />
        <Footer />
        <CodeCopier />
        <AgeGate />
        <NewsletterPopup />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
