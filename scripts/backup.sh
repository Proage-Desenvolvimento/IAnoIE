#!/usr/bin/env bash
# IAnoIE Backup & Restore Script
# Usage:
#   Backup:  curl -fsSL .../backup.sh | bash
#   Restore: ./backup.sh --restore /path/to/backup.tar.gz
#   Or:      curl -fsSL .../backup.sh | bash -s -- --restore /path/to/backup.tar.gz

set -euo pipefail

INSTALL_DIR="/opt/ianoie"
BACKUP_DIR="${INSTALL_DIR}/backups"
RESTORE_FILE=""
DB_ONLY=false
VOLUMES_ONLY=false

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "  (no options)         Full backup (database + volumes)"
  echo "  --db-only            Database backup only"
  echo "  --volumes-only       Volumes backup only"
  echo "  --restore PATH       Restore from backup archive"
  echo "  --restore-db PATH    Restore database only from archive"
  echo "  -h, --help           Show this help"
  exit 0
}

for arg in "$@"; do
  case $arg in
    --db-only)       DB_ONLY=true ;;
    --volumes-only)  VOLUMES_ONLY=true ;;
    --restore=*)     RESTORE_FILE="${arg#*=}" ;;
    --restore)       shift; RESTORE_FILE="${1:-}" ;;
    --restore-db=*)  RESTORE_DB_ONLY=true; RESTORE_FILE="${arg#*=}" ;;
    --restore-db)    shift; RESTORE_DB_ONLY=true; RESTORE_FILE="${1:-}" ;;
    --help|-h)       usage ;;
  esac
done

if [ "$EUID" -ne 0 ]; then
  fail "Please run as root: sudo ./backup.sh"
fi

# --- Restore Mode ---
if [ -n "${RESTORE_FILE:-}" ]; then
  if [ ! -f "$RESTORE_FILE" ]; then
    fail "Backup file not found: ${RESTORE_FILE}"
  fi

  info "Restoring from: ${RESTORE_FILE}"
  RESTORE_DIR=$(mktemp -d)
  tar xzf "$RESTORE_FILE" -C "$RESTORE_DIR"

  # Restore database
  if [ -z "${RESTORE_DB_ONLY:-}" ] || [ "${RESTORE_DB_ONLY:-}" = true ]; then
    SQL_FILE=$(find "$RESTORE_DIR" -name "*.sql" -type f | head -1)
    if [ -n "$SQL_FILE" ]; then
      info "Restoring PostgreSQL database..."
      docker exec -i ianoie-postgres psql -U ianoie -d ianoie < "$SQL_FILE"
      ok "Database restored"
    else
      warn "No .sql file found in backup"
    fi
  fi

  # Restore volumes
  if [ -z "${RESTORE_DB_ONLY:-}" ]; then
    VOLS_DIR="${RESTORE_DIR}/volumes"
    if [ -d "$VOLS_DIR" ]; then
      info "Restoring Docker volumes..."

      # Redis
      if [ -d "${VOLS_DIR}/ianoie-redis" ]; then
        docker run --rm -v ianoie-redis:/data -v "${VOLS_DIR}:/backup" \
          alpine sh -c "rm -rf /data/* && cp -a /backup/ianoie-redis/. /data/"
        ok "Redis volume restored"
      fi
    fi
  fi

  rm -rf "$RESTORE_DIR"
  ok "Restore complete!"
  info "Restarting services..."
  cd "$INSTALL_DIR" && docker compose restart
  exit 0
fi

# --- Backup Mode ---
echo ""
echo -e "${BLUE}=== IAnoIE Backup ===${NC}"
echo ""

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="ianoie-backup-${TIMESTAMP}"
WORK_DIR=$(mktemp -d)

# Database backup
if [ "$VOLUMES_ONLY" = false ]; then
  info "Backing up PostgreSQL database..."
  docker exec ianoie-postgres pg_dump -U ianoie ianoie > "${WORK_DIR}/ianoie-db-${TIMESTAMP}.sql" || {
    fail "Database backup failed. Is the postgres container running?"
  }
  ok "Database backed up ($(du -h "${WORK_DIR}/ianoie-db-${TIMESTAMP}.sql" | cut -f1))"
fi

# Volume backup
if [ "$DB_ONLY" = false ]; then
  info "Backing up Docker volumes..."

  VOLS_DIR="${WORK_DIR}/volumes"
  mkdir -p "$VOLS_DIR"

  # Redis data
  if docker volume inspect ianoie-redis &>/dev/null; then
    docker run --rm -v ianoie-redis:/data -v "${VOLS_DIR}:/backup" \
      alpine sh -c "cp -a /data/. /backup/ianoie-redis/ 2>/dev/null || true"
    ok "Redis volume backed up"
  fi

  # App data volumes (managed installations)
  for vol in $(docker volume ls --filter label=ianoie.managed=true --format '{{.Name}}' 2>/dev/null); do
    docker run --rm -v "$vol:/data" -v "${VOLS_DIR}:/backup" \
      alpine sh -c "cp -a /data/. /backup/${vol}/ 2>/dev/null || true"
    ok "Volume '${vol}' backed up"
  done
fi

# Save .env
if [ -f "${INSTALL_DIR}/.env" ]; then
  cp "${INSTALL_DIR}/.env" "${WORK_DIR}/.env"
  ok "Configuration backed up"
fi

# Create archive
ARCHIVE_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
tar czf "$ARCHIVE_PATH" -C "$WORK_DIR" .
rm -rf "$WORK_DIR"

echo ""
ok "Backup complete!"
echo ""
echo -e "  ${BLUE}Archive:${NC}   ${ARCHIVE_PATH}"
echo -e "  ${BLUE}Size:${NC}      $(du -h "$ARCHIVE_PATH" | cut -f1)"
echo ""
echo -e "  ${BLUE}Restore:${NC}   ${0} --restore ${ARCHIVE_PATH}"
echo ""
