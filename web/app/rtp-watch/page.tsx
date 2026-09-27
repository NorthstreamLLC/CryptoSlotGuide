import { RtpWatchPage } from "@/components/rtp-watch/RtpWatchPage";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";

export const metadata = pageMetadata(
  "RTP Watch: which casinos ship a cut build",
  "The same slot can pay 96.5% at one casino and 94.5% at the next. RTP Watch records the return stated inside each operator's own client, per build, as our field-testing reaches each operator.",
  "/rtp-watch"
);

export default function Page() {
  // No ItemList here: the rows are per-casino RTP builds, not a ranked list
  // of pages, and marking them up as one would describe something the page
  // does not offer.
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "RTP Watch", path: "/rtp-watch" }]),
          collectionPageSchema(
            "RTP Watch: which casinos ship a cut build",
            "The return stated inside each operator's own client, recorded per build.",
            "/rtp-watch"
          ),
        ]}
      />
      <RtpWatchPage />
    </>
  );
}
