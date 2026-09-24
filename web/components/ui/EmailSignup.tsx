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
export function EmailSignup({ source, title = "Get the weekly bonus & races digest", sub = "New offers, the biggest races and what changed at each casino, every week. No spam, unsubscribe any time." }: { source: string; title?: string; sub?: string }) {
  const live = process.env.NEXT_PUBLIC_NEWSLETTER_ON === "1";
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!live || !agree) return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, consent: agree, csg_hp: company }),
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
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Free weekly digest</div>
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
              placeholder="you@email.com"
              style={{ flex: "1 1 240px", minWidth: 0, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", background: "#080B0D", color: "#fff", fontSize: 15 }}
            />
            <button
              type="submit"
              disabled={!live || !agree || state === "sending"}
              style={{ padding: "12px 20px", borderRadius: 10, border: 0, background: live && agree ? "#00C2CC" : "#2A3439", color: live && agree ? "#0A0D0F" : "#7B8A93", fontSize: 14, fontWeight: 800, cursor: live && agree ? "pointer" : "not-allowed" }}
            >
              {state === "sending" ? "Signing up…" : live ? "Get the digest" : "Opens at launch"}
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
            I&apos;m 18 or older and agree to receive the weekly email. Unsubscribe any time.
          </label>
          {state === "error" && <div role="alert" style={{ fontSize: 13, color: "#F0A77F" }}>{error}</div>}
        </form>
      )}
    </section>
  );
}
