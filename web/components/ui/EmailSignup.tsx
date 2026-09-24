"use client";

import { useState } from "react";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * Weekly digest sign-up. Posts to our own /api/newsletter, which adds the
 * address to the SendGrid list server-side — the API key never reaches the
 * browser and no third-party script runs on the page. Until
 * NEXT_PUBLIC_NEWSLETTER_ON is "1" the form shows but says sign-ups open at
 * launch, so it never pretends to collect an address it can't store.
 */
/**
 * Same rule the server applies, so the form never accepts something the API
 * will refuse: one @, a dot in the domain, a two-letter TLD at least, and no
 * stray dots at either end or doubled up in the middle.
 */
const VALID_EMAIL = /^[^\s@.][^\s@]*@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
const isValidEmail = (v: string) => {
  const t = v.trim();
  return t.length <= 254 && VALID_EMAIL.test(t) && !t.includes("..");
};

export function EmailSignup({ source, title = "Join the weekly bonus & races newsletter", sub = "The best affiliate casino bonuses, the biggest races, raffles, leaderboards and what changed at each casino this week. One email a week, no spam, unsubscribe any time." }: { source: string; title?: string; sub?: string }) {
  const live = process.env.NEXT_PUBLIC_NEWSLETTER_ON === "1";
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [company, setCompany] = useState("");
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const emailOk = isValidEmail(email);
  const canSubmit = live && agree && emailOk && state !== "sending";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setTouched(true);
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source, consent: agree, csg_hp: company }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setState("done");
      } else {
        setError(data.error ?? "That didn't go through. Check the address and try again.");
        setState("error");
      }
    } catch {
      setError("That didn't go through. Check your connection and try again.");
      setState("error");
    }
  }

  return (
    <section style={{ padding: "26px 28px", borderRadius: 18, background: "radial-gradient(120% 120% at 100% 0%, rgba(0,194,204,.12), transparent 55%), #0C1013", border: "1px solid rgba(0,194,204,.22)" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Free weekly updates</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{title}</h2>
      <p style={{ margin: "0 0 16px", maxWidth: "60ch", fontSize: 14, lineHeight: 1.6, color: "#A8B6BE" }}>{sub}</p>
      {state === "done" ? (
        <div style={{ fontSize: 15, fontWeight: 700, color: "#7BE0B8" }}>You&apos;re on the list — the next digest will land in your inbox.</div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/*
            Honeypot: hidden from people, irresistible to bots. The name matters —
            this was called "company", which is a standard autofill token, so
            browsers and password managers filled it for real visitors and every
            genuine sign-up was silently discarded as a bot. The name now matches
            no autofill heuristic, and the two data- attributes tell 1Password and
            LastPass to leave it alone, since both ignore autocomplete="off".
          */}
          <input
            type="text"
            name="csg_hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            data-lpignore="true"
            data-form-type="other"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <label htmlFor={`email-${source}`} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Email address</label>
            <input
              id={`email-${source}`}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={touched && email !== "" && !emailOk}
              placeholder="you@email.com"
              style={{ flex: "1 1 240px", minWidth: 0, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", background: "#080B0D", color: "#fff", fontSize: 15 }}
            />
            <button
              type="submit"
              disabled={!canSubmit}
              style={{ padding: "12px 20px", borderRadius: 10, border: 0, background: canSubmit ? "#00C2CC" : "#2A3439", color: canSubmit ? "#0A0D0F" : "#7B8A93", fontSize: 14, fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed" }}
            >
              {state === "sending" ? "Joining…" : live ? "Join newsletter" : "Opens at launch"}
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
            I&apos;m 18 or older and agree to receive the weekly email. Unsubscribe any time.
          </label>
          {touched && email !== "" && !emailOk && state !== "error" && (
            <div style={{ fontSize: 13, color: "#F0A77F" }}>That doesn&apos;t look like a complete email address.</div>
          )}
          {state === "error" && <div role="alert" style={{ fontSize: 13, color: "#F0A77F" }}>{error}</div>}
        </form>
      )}
    </section>
  );
}
