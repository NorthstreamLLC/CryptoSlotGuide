import { RtpWatchPage } from "@/components/rtp-watch/RtpWatchPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "RTP Watch: which casinos ship a cut build",
  "The same slot can pay 96.5% at one casino and 94.5% at the next. RTP Watch records the return stated inside each operator's own client, per build, as our field-testing reaches each operator.",
  "/rtp-watch"
);

export default function Page() {
  return <RtpWatchPage />;
}
