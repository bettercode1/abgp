#!/usr/bin/env bash
# Production deploy for Contabo. Safe for a live site:
# - one deploy at a time
# - never overwrites .env
# - frontend is built off to the side, then swapped
# - PM2 restarts only after a successful build
set -euo pipefail

APP_DIR="${APP_DIR:-/home/deploy/apps/ABGP/abgp}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3001/health}"
BRANCH="${DEPLOY_BRANCH:-main}"
LOCK_FILE="${LOCK_FILE:-/tmp/abgp-deploy.lock}"

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

exec 9>"$LOCK_FILE"
flock -n 9 || die "Another deploy is already running. Wait and retry."

cd "$APP_DIR" || die "App directory not found: $APP_DIR"
[ -d .git ] || die "Not a git repo: $APP_DIR"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  die "Working tree has local edits. Fix or stash them on the VPS, then rerun."
fi

log "Pulling $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

log "Installing frontend dependencies"
npm ci

log "Building frontend (dist-next)"
rm -rf dist-next
npx tsc
npx vite build --outDir dist-next
[ -f dist-next/index.html ] || die "Frontend build missing dist-next/index.html"

log "Swapping frontend release"
if [ -d dist ]; then
  rm -rf dist-prev
  mv dist dist-prev
fi
mv dist-next dist
rm -rf dist-prev

log "Installing backend dependencies"
npm --prefix backend ci

restart_backend() {
  if command -v pm2 >/dev/null 2>&1 && pm2 describe abgp-backend >/dev/null 2>&1; then
    pm2 reload abgp-backend --update-env || pm2 restart abgp-backend
    pm2 save || true
    return
  fi
  sudo pm2 reload abgp-backend --update-env || sudo pm2 restart abgp-backend
  sudo pm2 save || true
}

log "Reloading backend"
restart_backend

log "Checking $HEALTH_URL"
ok=0
for _ in $(seq 1 15); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 2
done
[ "$ok" -eq 1 ] || die "Backend health check failed after reload. Run: sudo pm2 logs abgp-backend --lines 80"

log "Deploy finished"
git log -1 --oneline
