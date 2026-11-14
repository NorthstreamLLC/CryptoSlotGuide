#!/usr/bin/env bash
# Ship to production safely: everything that can fail on Vercel fails here first.
#
#   scripts/ship.sh            check, then push HEAD to main and confirm the live deploy
#   scripts/ship.sh --check    run the checks only, push nothing
#
# Steps: rebase on origin/main (a GitHub Action also commits there), type check,
# content checks, importer tests, then the full production build, which renders
# every page, the step the quick checks missed on 13 November 2026 (a West
# Virginia listing with no brand name broke one page). The build's prebuild step
# rewrites data/changelog.json from git history; that rewrite is undone so it is
# never committed by accident. Only then is anything pushed, and the script waits
# for the Production deployment of exactly that commit and reports its result.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/web"
CHECK_ONLY=0
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=1
step() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
fail() { printf '\n\033[31m✗ %s\033[0m\n' "$*"; exit 1; }

cd "$ROOT"
[[ -z "$(git status --porcelain)" ]] || fail "Uncommitted changes: commit or stash them first."

step "Rebase on origin/main"
git fetch -q origin main
git rebase -q origin/main || fail "Rebase failed: resolve it, then run again."

cd "$WEB"
step "Type check"
rm -rf .next/dev/types
npx tsc --noEmit -p . || fail "Type errors."

step "Content checks"
node scripts/check-house-order.mjs
node scripts/check-no-borrowed-copy.mjs

step "Importer tests"
TMPDIR="${TMPDIR:-/tmp}" npm run -s test:import >/dev/null || fail "Importer tests failed (run npm run test:import)."

step "Production build (renders every page)"
LOG="$(mktemp)"
if ! npm run -s build >"$LOG" 2>&1; then
  git -C "$ROOT" checkout -q -- web/data/changelog.json 2>/dev/null || true
  grep -nE "Error|error" "$LOG" | head -20
  fail "Build failed; nothing was pushed. Full log: $LOG"
fi
git -C "$ROOT" checkout -q -- web/data/changelog.json 2>/dev/null || true
[[ -z "$(git -C "$ROOT" status --porcelain)" ]] || { git -C "$ROOT" status --short; fail "The build left changed files; check them before shipping."; }
echo "Build passed."

[[ $CHECK_ONLY == 1 ]] && { printf '\n\033[32m✓ All checks passed (--check: nothing pushed).\033[0m\n'; exit 0; }

cd "$ROOT"
SHA="$(git rev-parse HEAD)"
step "Push ${SHA:0:7} to main"
for i in 1 2 3 4; do git push -q origin HEAD:main && break; [[ $i == 4 ]] && fail "Push failed."; sleep $((i * 2)); done

step "Wait for the Production deployment of ${SHA:0:7}"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo NorthstreamLLC/cryptoslotguide)"
STATE=""
for _ in $(seq 1 60); do
  URL="$(gh api "repos/$REPO/deployments" --jq "[.[] | select(.sha==\"$SHA\" and .environment==\"Production\")][0].statuses_url" 2>/dev/null || true)"
  if [[ -n "$URL" && "$URL" != "null" ]]; then
    STATE="$(gh api "$URL" --jq '.[0].state' 2>/dev/null || true)"
    [[ "$STATE" == success || "$STATE" == failure || "$STATE" == error ]] && break
  fi
  sleep 20
done
[[ "$STATE" == success ]] || fail "Production deployment: ${STATE:-not seen after 20 minutes}. The live site keeps the previous version."
printf '\n\033[32m✓ Live: %s is deployed to production.\033[0m\n' "${SHA:0:7}"
