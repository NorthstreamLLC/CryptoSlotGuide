import Link from "next/link";
import author from "@/data/author.json";

const MONO = "var(--font-jetbrains-mono), monospace";
export const AUTHOR_HREF = `/authors/${author.slug}`;

/** Initials in a gold badge: the editor writes under a pen name and shows no photo. */
export function AuthorBadge({ size = 52 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 30% 25%, #FFE08A, #C9921A 70%)",
        boxShadow: "0 8px 22px rgba(255,197,49,.25), inset 0 0 0 2px rgba(255,255,255,.25)",
        color: "#1A1304",
        fontSize: size * 0.34,
        fontWeight: 800,
        letterSpacing: "-.02em",
      }}
    >
      {author.initials}
    </span>
  );
}

/** "Edited by Lars P.", inline, for a byline row. */
export function EditedBy({ color = "#8E9CA5" }: { color?: string }) {
  return (
    <>
      edited by{" "}
      <Link href={AUTHOR_HREF} style={{ color, textDecoration: "underline", textUnderlineOffset: 2 }}>
        {author.name}
      </Link>
    </>
  );
}

/** Who edits the page, at its foot: name, role and a two-line bio. */
export function AuthorBox() {
  return (
    <aside
      aria-label="About the editor"
      style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 22px", borderRadius: 16, background: "linear-gradient(135deg, rgba(255,197,49,.07), rgba(255,255,255,.02))", border: "1px solid rgba(255,197,49,.22)" }}
    >
      <AuthorBadge />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase", color: "#FFC531", marginBottom: 4 }}>Edited by</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <Link href={AUTHOR_HREF} style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{author.name}</Link>
          <span style={{ fontFamily: MONO, fontSize: 11, color: "#8E9CA5" }}>{author.role}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#A8B6BE" }}>{author.bio}</p>
      </div>
    </aside>
  );
}

const fmt = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

/** The hero byline: who edits the page, and when its facts were last read. */
export function AuthorByline({ updated }: { updated?: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
      <Link href={AUTHOR_HREF} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <AuthorBadge size={36} />
        <span>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0" }}>{author.name}</span>
          <span style={{ display: "block", fontFamily: MONO, fontSize: 10, color: "#FFC531" }}>{author.role}</span>
        </span>
      </Link>
      {updated && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <span aria-hidden style={{ width: 30, height: 30, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(87,227,154,.12)", color: "#57E39A", fontSize: 15 }}>↻</span>
          <span>
            <time dateTime={updated.slice(0, 10)} style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#E8EDF0" }}>{fmt(updated)}</time>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 10, color: "#57E39A" }}>Last updated</span>
          </span>
        </span>
      )}
    </div>
  );
}
