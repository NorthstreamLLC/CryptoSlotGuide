import { KevinPage } from "@/components/promo/KevinPage";

/** Temporary, hidden preview of the Kevin Hart page after the deadline. Delete once checked. */
export const metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <KevinPage live={false} />;
}
