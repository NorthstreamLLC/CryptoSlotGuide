"use client";

import { useState } from "react";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * Weekly digest sign-up. Posts to the email provider set in
 * NEXT_PUBLIC_NEWSLETTER_URL (a Beehiiv/ConvertKit/Mailchimp form endpoint).
 * Until that is set the form shows but explains sign-ups open at launch,
 * so it never pretends to collect an address it can't store.
 */
export function EmailSignup({ source, title = "Get the weekly bonus & races digest", sub = "New offers, the biggest races and what changed at each casino, every week. No spam, unsubscribe any time." }: { source: string; title?: string; sub?: string }) {
  const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_URL;
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!endpoint || !agree) return;
    setState("sending");
    try {
      const body = new FormData();
      body.append("email", email);
      body.append("source", source);
      await fetch(endpoint, { method: "POST", body, mode: "no-cors" });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <section style={{ padding: "26px 28px", borderRadius: 18, background: "radial-gradient(120% 120% at 100% 0%, rgba(0,194,204,.12), transparent 55%), #0C1013", border: "1px solid rgba(0,194,204,.22)" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 8 }}>Free weekly digest</div>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{title}</h2>
      <p style={{ margin: "0 0 16px", maxWidth: "60ch", fontSize: 14, lineHeight: 1.6, color: "#A8B6BE" }}>{sub}</p>
      {state === "done" ? (
        <div style={{ fontSize: 15, fontWeight: 700, color: "#7BE0B8" }}>You&apos;re on the list. Check your inbox to confirm.</div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              disabled={!endpoint || !agree || state === "sending"}
              style={{ padding: "12px 20px", borderRadius: 10, border: 0, background: endpoint && agree ? "#00C2CC" : "#2A3439", color: endpoint && agree ? "#0A0D0F" : "#7B8A93", fontSize: 14, fontWeight: 800, cursor: endpoint && agree ? "pointer" : "not-allowed" }}
            >
              {state === "sending" ? "Signing up…" : endpoint ? "Get the digest" : "Opens at launch"}
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, lineHeight: 1.5, color: "#8DA0AA" }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
            I&apos;m 18 or older and agree to receive the weekly email. Unsubscribe any time.
          </label>
          {state === "error" && <div style={{ fontSize: 13, color: "#F0A77F" }}>That didn&apos;t go through. Check the address and try again.</div>}
        </form>
      )}
    </section>
  );
}
