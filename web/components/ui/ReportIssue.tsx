"use client";

import { useState } from "react";

const MONO = "var(--font-jetbrains-mono), monospace";

/**
 * "Something wrong on this page?" — a reader-facing correction form.
 *
 * Collapsed to one quiet line by default. A page's job is its facts; this has
 * to be findable without competing with them, which is why it is a link rather
 * than a panel and why it sits at the foot of the content.
 *
 * The page URL is captured automatically. Asking a reader to describe WHICH
 * page they mean is how a correction arrives that nobody can act on.
 */
export function ReportIssue({ subject }: { subject?: string }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const canSend = detail.trim().length >= 10 && state !== "sending";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          detail,
          source,
          email,
          csg_hp: hp,
          url: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setState("done");
        return;
      }
      setState("error");
      setError(json.error ?? "Couldn't send that just now.");
    } catch {
      setState("error");
      setError("Couldn't reach us — please email hello@cryptoslotguide.com.");
    }
  }

  if (state === "done") {
    return (
      <p style={{ marginTop: 34, padding: "14px 18px", borderRadius: 12, background: "rgba(0,194,204,.07)", border: "1px solid rgba(0,194,204,.25)", fontSize: 13.5, lineHeight: 1.6, color: "#9FD9DD" }}>
        Thanks — that&apos;s on its way. If we can reproduce it, the page gets re-checked and re-dated rather than quietly edited.
      </p>
    );
  }

  if (!open) {
    return (
      <p style={{ marginTop: 34, fontSize: 13, color: "#77858E" }}>
        Spotted something wrong{subject ? ` about ${subject}` : " on this page"}?{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hover:!text-accent"
          style={{ background: "none", border: 0, padding: 0, fontSize: 13, fontWeight: 700, color: "#5FE3E8", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          Tell us
        </button>
        {" "}— we re-check anything reproducible.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 34, padding: "20px 22px", borderRadius: 16, background: "#0C1013", border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase", color: "#00C2CC", marginBottom: 6 }}>
        Report an inaccuracy
      </div>
      <p style={{ margin: "0 0 14px", maxWidth: "70ch", fontSize: 13, lineHeight: 1.6, color: "#8DA0AA" }}>
        A figure that&apos;s out of date, a term that&apos;s changed, or something that doesn&apos;t match what you saw at the operator. We capture which page
        you&apos;re on automatically.
      </p>

      <label style={{ display: "block", fontSize: 12.5, color: "#A9B8C0", marginBottom: 6 }}>
        What&apos;s wrong?
        <textarea
          id="report-detail"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={4}
          maxLength={4000}
          required
          placeholder="e.g. the minimum withdrawal says $10 but their terms page now says $20"
          style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, background: "#080B0D", border: "1px solid rgba(255,255,255,.12)", fontSize: 14, lineHeight: 1.55, color: "#E8EDF0", resize: "vertical" }}
        />
      </label>

      <label style={{ display: "block", fontSize: 12.5, color: "#A9B8C0", margin: "12px 0 6px" }}>
        Where did you see the correct figure? <span style={{ color: "#77858E" }}>(optional, but it speeds things up)</span>
        <input
          id="report-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          maxLength={500}
          placeholder="A link to the operator's own page"
          style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, background: "#080B0D", border: "1px solid rgba(255,255,255,.12)", fontSize: 14, color: "#E8EDF0" }}
        />
      </label>

      <label style={{ display: "block", fontSize: 12.5, color: "#A9B8C0", margin: "12px 0 6px" }}>
        Your email <span style={{ color: "#77858E" }}>(optional — only so we can reply)</span>
        <input
          id="report-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          style={{ display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, background: "#080B0D", border: "1px solid rgba(255,255,255,.12)", fontSize: 14, color: "#E8EDF0" }}
        />
      </label>

      {/* Honeypot: off-screen rather than display:none, which some bots skip,
          and named so no password manager tries to autofill it. */}
      <input
        type="text"
        name="csg_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      {error && (
        <p role="alert" style={{ margin: "12px 0 0", fontSize: 13, color: "#F0A77F" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={!canSend}
          className="transition-opacity"
          style={{ padding: "11px 18px", borderRadius: 10, border: 0, background: canSend ? "#00C2CC" : "rgba(255,255,255,.09)", color: canSend ? "#04191B" : "#77858E", fontSize: 14, fontWeight: 700, cursor: canSend ? "pointer" : "not-allowed" }}
        >
          {state === "sending" ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="hover:!text-white"
          style={{ background: "none", border: 0, fontSize: 13, color: "#8DA0AA", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
