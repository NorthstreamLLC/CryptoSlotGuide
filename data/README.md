# Data — seed subset

These JSON files match the shapes in [`lib/types.ts`](../lib/types.ts) but hold a
**small real subset**, not the full dataset. The design prototype
(`design/CryptoSlotGuide.dc.html`) carries the complete records — 47 casinos,
16 slots, 47 coin-support rows, etc. — as JS class fields.

**Before publish**, port the full arrays out of the prototype into these files
(or a CMS/DB, per `design/README.md`'s "Editability requirement"). Until then:

- Every page reads from these files, so the site is fully wired end to end —
  it's just working from fewer rows than the finished dataset.
- Per `design/README.md` "Known gaps to close before publish": payout times
  and scores on the 29 casinos added from the client's list are placeholders
  and need real timed withdrawals before publish. That applies here too —
  treat every `payout`/`score` value in `ops.json` as illustrative.
- `rtpWatch.json` readings are fabricated for now. Real rows come from the
  CSV/sheet import pipeline described in `design/README.md`'s RTP Watch
  section — do not publish fabricated RTP figures.
