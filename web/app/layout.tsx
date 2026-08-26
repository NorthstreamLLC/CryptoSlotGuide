import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteCounts } from "@/lib/site-data";

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
  title: {
    default: "CryptoSlotGuide — crypto casino & slot reviews",
    template: "%s | CryptoSlotGuide",
  },
  description:
    "Crypto casino, slot, sportsbook and wallet reviews built on measured data — every score traces to a figure recorded on a funded account.",
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
