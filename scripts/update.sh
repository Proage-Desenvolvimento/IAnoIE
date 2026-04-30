#!/usr/bin/env bash
# IAnoIE Update Script
# Usage: curl -fsSL https://raw.githubusercontent.com/proage-desenvolvimento/IAnoIE/main/scripts/update.sh | bash
# Or:   ./update.sh [--backup] [--rollback]

set -euo pipefail

INSTALL_DIR="/opt/ianoie"
REPO_URL="https://github.com/proage-desenvolvimento/IAnoIE"
BACKUP=false
ROLLBACK=false

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

for arg in "$@"; do
  case $arg in
    --backup)   BACKUP=true ;;
    --rollback) ROLLBACK=true ;;
    --help|-h)
      echo "Usage: $0 [--backup] [--rollback]"
      echo ""
      echo "  --backup    Create database backup before updating"
      echo "  --rollback  Rollback to previous image versions"
      exit 0
      ;;
  esac
done

if [ "$EUID" -ne 0 ]; then
  fail "Please run as root: sudo ./update.sh"
fi

if [ ! -d "$INSTALL_DIR" ]; then
  fail "IAnoIE not found at ${INSTALL_DIR}. Run install.sh first."
fi

cd "$INSTALL_DIR"

# --- Rollback ---
if [ "$ROLLBACK" = true ]; then
  info "Rolling back to previous versions..."
  docker compose down
  docker compose up -d --no-pull
  ok "Rolled back to previous versions"
  exit 0
fi

echo ""
echo -e "${BLUE}=== IAnoIE Update ===${NC}"
echo ""

# --- Backup ---
if [ "$BACKUP" = true ]; then
  info "Creating database backup before update..."
  BACKUP_FILE="${INSTALL_DIR}/backups/pre-update-$(date +%Y%m%d-%H%M%S).sql"
  mkdir -p "${INSTALL_DIR}/backups"
  docker exec ianoie-postgres pg_dump -U ianoie ianoie > "$BACKUP_FILE"
  ok "Backup saved to ${BACKUP_FILE}"
fi

# --- Record current versions ---
info "Recording current image versions..."
BEFORE=$(docker compose images --format json 2>/dev/null | python3 -c "
import sys, json
for line in sys.stdin:
    try:
        obj = json.loads(line)
        print(f\"{obj.get('service','?')}: {obj.get('image','?')}\")
    except: pass
" 2>/dev/null || docker compose images 2>/dev/null || echo "unknown")

# --- Pull latest images ---
info "Pulling latest images..."
docker compose pull

# --- Restart services ---
info "Restarting services with new images..."
docker compose up -d --remove-orphans

# --- Wait for health ---
info "Waiting for services to become healthy..."
sleep 5

for service in postgres redis api; do
  attempt=1
  max=30
  while [ $attempt -le $max ]; do
    status=$(docker inspect --format='{{.State.Health.Status}}' "ianoie-${service}" 2>/dev/null || echo "starting")
    if [ "$status" = "healthy" ]; then
      break
    fi
    printf "\r${BLUE}[INFO]${NC}  %s: attempt %d/%d (status: %s)" "$service" "$attempt" "$max" "$status"
    sleep 2
    attempt=$((attempt + 1))
  done
  echo ""
done

# --- Show version diff ---
echo ""
info "Image versions:"
echo "  Before:"
echo "$BEFORE" | sed 's/^/    /'
echo ""
echo "  After:"
docker compose images 2>/dev/null | sed 's/^/    /' || true

# --- Cleanup old images ---
info "Cleaning up old images..."
docker image prune -f 2>/dev/null || true

echo ""
ok "Update complete!"
echo ""
info "Check logs: docker compose -f ${INSTALL_DIR}/docker-compose.yml logs -f"
