#!/usr/bin/env bash
# Production deploy for Contabo. Safe for a live site:
# - one deploy at a time
# - never overwrites .env
# - frontend is built off to the side, then swapped
# - git/npm/build run as the app user (deploy)
# - PM2 restarts only after a successful build (root process)
set -euo pipefail

APP_DIR="${APP_DIR:-/home/deploy/apps/ABGP/abgp}"
APP_USER="${APP_USER:-deploy}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3001/health}"
BRANCH="${DEPLOY_BRANCH:-main}"
LOCK_FILE="${LOCK_FILE:-/tmp/abgp-deploy.lock}"

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

as_app() {
  if [ "$(id -u)" -eq 0 ] && [ "$APP_USER" != "root" ]; then
    sudo -u "$APP_USER" -- "$@"
  else
    "$@"
  fi
}

as_app_bash() {
  as_app bash -lc "cd $(printf '%q' "$APP_DIR") && $*"
}

exec 9>"$LOCK_FILE"
flock -n 9 || die "Another deploy is already running. Wait and retry."

cd "$APP_DIR" || die "App directory not found: $APP_DIR"
[ -d .git ] || die "Not a git repo: $APP_DIR"

if [ -n "$(as_app git -C "$APP_DIR" status --porcelain --untracked-files=no)" ]; then
  log "Discarding local VPS edits (deploy always matches origin/$BRANCH)"
  as_app git -C "$APP_DIR" reset --hard "origin/$BRANCH"
fi

log "Syncing $BRANCH as $APP_USER"
as_app git -C "$APP_DIR" fetch origin "$BRANCH"
as_app git -C "$APP_DIR" checkout "$BRANCH"
as_app git -C "$APP_DIR" reset --hard "origin/$BRANCH"

if [ -f "$APP_DIR/backend/migrations/011_activities.sql" ]; then
  log "Applying activities migration (idempotent)"
  as_app_bash "cd backend && node scripts/run-migration.cjs migrations/011_activities.sql"
fi

log "Installing frontend dependencies"
as_app_bash "npm ci"

log "Building frontend (dist-next)"
as_app_bash "rm -rf dist-next && npx tsc && npx vite build --outDir dist-next"
as_app_bash "test -f dist-next/index.html" || die "Frontend build missing dist-next/index.html"

log "Swapping frontend release"
as_app_bash "if [ -d dist ]; then rm -rf dist-prev && mv dist dist-prev; fi; mv dist-next dist; rm -rf dist-prev"

log "Installing backend dependencies"
as_app_bash "npm --prefix backend ci"

log "Reloading backend"
if pm2 describe abgp-backend >/dev/null 2>&1; then
  pm2 reload abgp-backend --update-env || pm2 restart abgp-backend
  pm2 save || true
else
  die "PM2 process abgp-backend was not found for the current user. Do not start a second copy."
fi

log "Checking $HEALTH_URL"
ok=0
for _ in $(seq 1 15); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 2
done
[ "$ok" -eq 1 ] || die "Backend health check failed after reload. Run: pm2 logs abgp-backend --lines 80"

log "Deploy finished"
as_app git -C "$APP_DIR" log -1 --oneline
