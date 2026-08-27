import { RtpWatchPage } from "@/components/rtp-watch/RtpWatchPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "RTP Watch: which casinos ship a cut build",
  "The same slot can pay 96.5% at one casino and 94.5% at the next. We read the paytable inside each operator's own client as our field-testing covers them and publish the number, per build.",
  "/rtp-watch"
);

export default function Page() {
  return <RtpWatchPage />;
}
