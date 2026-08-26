# CryptoSlotGuide — production app (in progress)

This is the real Next.js/TypeScript codebase for the site, built out page by
page against the design at the repo root (`CryptoSlotGuide.dc.html` +
`support.js` + `image-slot.js` + `assets/`) — that file is the fidelity
source of truth, not this folder's README or any prose description of it.

**The repo root's design bundle stays live/authoritative** — it's what
Claude Design shows and edits. Nothing here touches it. This app is meant to
eventually replace it as the deployed site once enough pages are ported.

## Working rule
Every page/component here is ported from the matching section of the actual
`CryptoSlotGuide.dc.html` markup and inline styles — same layout, spacing,
copy, colors — not re-implemented from a description of it. Every route in
the root `README.md`'s routing map is built and wired to real data; there
are no `PagePlaceholder` stand-ins left. If you add a new route, follow the
same read-source-then-port discipline rather than describing the page from
memory or from this README's prose.

## Running locally
```
cd web
npm install
npm run dev
```
