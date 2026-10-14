"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { EmailSignup } from "@/components/ui/EmailSignup";

const JOINED = "csg-news-joined";
const CLOSED = "csg-news-closed";
const AGE = "csg-age-ok";
const WAIT_MS = 40_000;
const SNOOZE_DAYS = 30;

/**
 * The newsletter, offered once, late and small. It waits for 40 seconds on
 * the site or half a page of scrolling, never shows before the 18+ check is
 * answered, never to someone who has joined (EmailSignup records that), and
 * closing it keeps it away for 30 days. On a phone it is a panel at the
 * bottom of the screen rather than a full-screen takeover, which is the kind
 * of interstitial Google demotes.
 */
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_NEWSLETTER_ON !== "1") return;
    let blocked = false;
    try {
      const closed = Number(localStorage.getItem(CLOSED) ?? 0);
      blocked = localStorage.getItem(JOINED) === "1" || Date.now() - closed < SNOOZE_DAYS * 86_400_000;
    } catch {
      blocked = true;
    }
    if (blocked) return;

    const show = () => {
      let ageOk = false;
      try {
        ageOk = localStorage.getItem(AGE) === "1" || sessionStorage.getItem(AGE) === "1";
      } catch {
        /* storage blocked */
      }
      if (ageOk) setOpen(true);
    };
    const t = setTimeout(show, WAIT_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  if (!open) return null;

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(CLOSED, String(Date.now()));
    } catch {
      /* storage blocked */
    }
  };

  return (
    <div role="dialog" aria-label="Newsletter" className="csg-news-pop">
      <button type="button" onClick={close} aria-label="Close" className="csg-news-x">×</button>
      <EmailSignup
        source="popup"
        compact
        eyebrow="Free weekly email"
        title="The best bonuses and races, every week"
        sub="The biggest races and raffles, the best casino bonuses and what changed at each casino. One email a week, unsubscribe any time."
        button="Send me the weekly email"
      />
    </div>
  );
}
