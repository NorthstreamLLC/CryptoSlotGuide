import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteCounts } from "@/lib/site-data";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

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
  title: {
    default: "CryptoSlotGuide — crypto casino & slot reviews",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Crypto casino, slot, sportsbook and wallet reviews built on measured data — field-tested where we can fund it, assessed from public sources everywhere else, and every review says which is which.",
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
        <Header counts={siteCounts} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
