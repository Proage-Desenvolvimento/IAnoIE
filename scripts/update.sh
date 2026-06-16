#!/usr/bin/env bash
# IAnoIE Update Script — for git-clone / build-from-source deployments.
#
# Pulls the latest code and rebuilds + restarts only the source-built services
# that actually changed (api, worker, beat, frontend). Templates (templates/*.yaml)
# are bind-mounted, so they go live on `git pull` with no rebuild.
#
# Usage:
#   ./scripts/update.sh                     # pull + rebuild only what changed
#   ./scripts/update.sh --backup            # pg_dump the DB before updating
#   ./scripts/update.sh --rebuild-all       # force rebuild of all source services
#   ./scripts/update.sh --services "api worker beat"   # rebuild only these
#   ./scripts/update.sh --rollback          # restore the previous commit + rebuild
#   ./scripts/update.sh --help
#
# Run from anywhere — the script locates the repo root (dir containing
# docker/docker-compose.yml) by searching upward from this file's location.
#
# NOTE: this script does NOT run DB migrations. The app uses create_all, which
# only creates missing tables/columns — it will not ALTER existing ones. If a
# model gains a column, apply an ALTER TABLE manually. Seed (seed_apps.py)
# changes also don't affect an already-seeded DB.

set -euo pipefail

# --- locate repo root (dir with docker/docker-compose.yml) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$SCRIPT_DIR"
while [ "$REPO_DIR" != "/" ]; do
  [ -f "$REPO_DIR/docker/docker-compose.yml" ] && break
  REPO_DIR="$(dirname "$REPO_DIR")"
done
if [ ! -f "$REPO_DIR/docker/docker-compose.yml" ]; then
  echo "FAIL: docker/docker-compose.yml not found (searched upward from $SCRIPT_DIR)" >&2
  exit 1
fi

COMPOSE=(docker compose -f "$REPO_DIR/docker/docker-compose.yml")
PREV_FILE="$REPO_DIR/.ianoie-prev-commit"
SOURCE_SERVICES=(api worker beat frontend)

# --- output helpers ---
RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'; BLUE=$'\033[0;34m'; NC=$'\033[0m'
info(){ printf '%s[INFO]%s  %s\n' "$BLUE" "$NC" "$*"; }
ok(){   printf '%s[OK]%s    %s\n' "$GREEN" "$NC" "$*"; }
warn(){ printf '%s[WARN]%s  %s\n' "$YELLOW" "$NC" "$*"; }
fail(){ printf '%s[FAIL]%s  %s\n' "$RED" "$NC" "$*"; exit 1; }

# --- args ---
BACKUP=false; ROLLBACK=false; REBUILD_ALL=false; SERVICES_OVERRIDE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --backup)      BACKUP=true ;;
    --rollback)    ROLLBACK=true ;;
    --rebuild-all) REBUILD_ALL=true ;;
    --services) shift; SERVICES_OVERRIDE="${1:-}" ;;
    --help|-h)     sed -n '2,22p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) fail "unknown option: $1 (try --help)" ;;
  esac
  shift
done

# --- preflight ---
docker info >/dev/null 2>&1 || fail "docker not accessible — run as root (or be in the docker group)"
command -v git >/dev/null   || fail "git not found"
cd "$REPO_DIR"

# ============================================================
# Rollback: restore the commit recorded before the last update
# ============================================================
if [ "$ROLLBACK" = true ]; then
  [ -f "$PREV_FILE" ] || fail "no previous commit recorded at $PREV_FILE"
  PREV="$(cat "$PREV_FILE")"
  info "Rolling back to ${PREV:0:7} ..."
  git reset --hard "$PREV"
  "${COMPOSE[@]}" up -d --build --remove-orphans "${SOURCE_SERVICES[@]}"
  ok "Rolled back to $(git rev-parse --short HEAD) and rebuilt source services."
  exit 0
fi

echo ""
printf '%s=== IAnoIE Update (source build) ===%s\n' "$BLUE" "$NC"
echo ""

# --- optional DB backup ---
if [ "$BACKUP" = true ]; then
  BACKUP_DIR="$REPO_DIR/backups"
  mkdir -p "$BACKUP_DIR"
  BACKUP_FILE="$BACKUP_DIR/pre-update-$(date +%Y%m%d-%H%M%S).sql"
  info "Backing up database to $BACKUP_FILE ..."
  if docker exec ianoie-postgres pg_dump -U ianoie ianoie > "$BACKUP_FILE" 2>/dev/null; then
    ok "Backup saved ($BACKUP_FILE)"
  else
    warn "Backup failed (is ianoie-postgres running?) — continuing without backup."
  fi
fi

# --- record current commit (for a future --rollback) ---
PREV_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo "")"

# --- pull ---
info "Pulling latest code ..."
if ! git pull --ff-only; then
  fail "git pull failed. Resolve local changes / divergent history manually, then re-run."
fi
NEW_COMMIT="$(git rev-parse HEAD)"

# remember the pre-update commit so --rollback can return to it
[ -n "$PREV_COMMIT" ] && [ "$PREV_COMMIT" != "$NEW_COMMIT" ] && echo "$PREV_COMMIT" > "$PREV_FILE"

# nothing new?
if [ -n "$PREV_COMMIT" ] && [ "$PREV_COMMIT" = "$NEW_COMMIT" ] && [ "$REBUILD_ALL" = false ]; then
  ok "Already up to date ($(git rev-parse --short HEAD)). Nothing to do."
  exit 0
fi

# --- decide which services to rebuild ---
SERVICES=()
RECREATE_ALL=false
if [ -n "$SERVICES_OVERRIDE" ]; then
  SERVICES=( $SERVICES_OVERRIDE )
elif [ "$REBUILD_ALL" = true ] || [ -z "$PREV_COMMIT" ]; then
  SERVICES=( "${SOURCE_SERVICES[@]}" )
else
  CHANGED="$(git diff --name-only "$PREV_COMMIT" "$NEW_COMMIT")"
  if echo "$CHANGED" | grep -q '^backend/';  then SERVICES+=(api worker beat); fi
  if echo "$CHANGED" | grep -q '^frontend/'; then SERVICES+=(frontend); fi
  if echo "$CHANGED" | grep -qE '^(docker/|\.env)'; then RECREATE_ALL=true; fi
  if [ ${#SERVICES[@]} -eq 0 ] && [ "$RECREATE_ALL" = false ]; then
    ok "Changes only in non-build files (templates/scripts/docs)."
    ok "Templates are bind-mounted → already live. Nothing to rebuild."
    exit 0
  fi
fi

# --- rebuild + restart ---
if [ ${#SERVICES[@]} -gt 0 ]; then
  info "Rebuilding + restarting: ${SERVICES[*]} ..."
  "${COMPOSE[@]}" up -d --build --remove-orphans "${SERVICES[@]}"
fi
# compose/.env changed → recreate everything so all services pick up the new config
if [ "$RECREATE_ALL" = true ]; then
  info "docker-compose.yml / .env changed — recreating all services ..."
  "${COMPOSE[@]}" up -d --remove-orphans
fi

# --- health check ---
info "Waiting for core services to become healthy ..."
sleep 3
for svc in postgres redis api; do
  status="starting"
  for _ in $(seq 1 30); do
    status="$(docker inspect --format='{{.State.Health.Status}}' "ianoie-$svc" 2>/dev/null || echo starting)"
    [ "$status" = healthy ] && break
    sleep 2
  done
  if [ "$status" = healthy ]; then ok "$svc healthy"; else warn "$svc not healthy (status: $status) — check logs"; fi
done

# --- show what was pulled ---
if [ -n "${PREV_COMMIT:-}" ] && [ "$PREV_COMMIT" != "$NEW_COMMIT" ]; then
  info "New commits:"
  git --no-pager log --oneline "$PREV_COMMIT..$NEW_COMMIT" 2>/dev/null | sed 's/^/    /' || true
fi

# --- cleanup dangling images ---
info "Pruning dangling images ..."
docker image prune -f >/dev/null 2>&1 || true

echo ""
ok "Update complete → $(git rev-parse --short HEAD)"
info "Logs:    ${COMPOSE[*]} logs -f api worker"
info "Rollback: ./scripts/update.sh --rollback"
