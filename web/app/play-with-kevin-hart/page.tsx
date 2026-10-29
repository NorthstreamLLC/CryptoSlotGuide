import { pageMetadata } from "@/lib/seo";
import { KEVIN_PATH, kevinLive } from "@/lib/kevin-promo";
import { KevinPage } from "@/components/promo/KevinPage";

// Rebuilt hourly, so the page turns into its ended version within the hour after the deadline.
export const revalidate = 3600;

export function generateMetadata() {
  return kevinLive()
    ? pageMetadata(
        "Kevin Hart x Pragmatic Play: live casino takeover and $1.25M prize pool",
        "Kevin Hart hosts Pragmatic Play live casino games on 6-7 November 2026, with a $1.25M prize pool from 19 October. How it works, the prizes, and where to play.",
        KEVIN_PATH
      )
    : pageMetadata(
        "Kevin Hart x Pragmatic Play: how the $1.25M promotion worked",
        "Pragmatic Play's $1.25M Kevin Hart promotion ran from 19 October to 7 November 2026 and has ended. How it worked, the prizes, Kevin Hart's live shows, and what's running now instead.",
        KEVIN_PATH
      );
}

export default function Page() {
  return <KevinPage live={kevinLive()} />;
}
