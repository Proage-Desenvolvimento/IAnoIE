#!/usr/bin/env bash
# IAnoIE Installer Script
# Usage: curl -fsSL https://raw.githubusercontent.com/proage-desenvolvimento/IAnoIE/main/scripts/install.sh | bash
# Or:   ./install.sh [--skip-docker] [--skip-nvidia] [--env-file /path] [--dev]

set -euo pipefail

# --- Configuration ---
INSTALL_DIR="/opt/ianoie"
REPO_URL="https://github.com/proage-desenvolvimento/IAnoIE"
COMPOSE_FILE="docker/docker-compose.prod.yml"
TEMPLATES_DIR="${INSTALL_DIR}/templates"
ENV_FILE="${INSTALL_DIR}/.env"
NETWORK_NAME="ianoie-proxy"
COMPOSE_PROJECT_NAME="ianoie"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Parse Arguments ---
SKIP_DOCKER=false
SKIP_NVIDIA=false
USE_DEV=false
CUSTOM_ENV=""

for arg in "$@"; do
  case $arg in
    --skip-docker)  SKIP_DOCKER=true ;;
    --skip-nvidia)  SKIP_NVIDIA=true ;;
    --dev)          USE_DEV=true ;;
    --env-file=*)   CUSTOM_ENV="${arg#*=}" ;;
    --help|-h)
      echo "Usage: $0 [--skip-docker] [--skip-nvidia] [--dev] [--env-file PATH]"
      echo ""
      echo "  --skip-docker    Skip Docker installation"
      echo "  --skip-nvidia    Skip NVIDIA Container Toolkit installation"
      echo "  --dev            Use development docker-compose instead of production"
      echo "  --env-file PATH  Use custom .env file instead of generating one"
      echo "  -h, --help       Show this help"
      exit 0
      ;;
  esac
done

# --- Helper Functions ---
info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

generate_secret() {
  openssl rand -hex 32
}

check_command() {
  command -v "$1" &>/dev/null
}

wait_for_health() {
  local service="$1"
  local max_attempts="${2:-30}"
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "ianoie-${service}" 2>/dev/null || echo "starting")
    if [ "$status" = "healthy" ]; then
      return 0
    fi
    printf "\r${BLUE}[INFO]${NC}  Waiting for %s... attempt %d/%d (status: %s)" "$service" "$attempt" "$max_attempts" "$status"
    sleep 2
    attempt=$((attempt + 1))
  done
  echo ""
  return 1
}

# --- Banner ---
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         IAnoIE — GPU AI App Platform      ║${NC}"
echo -e "${BLUE}║              Installer Script              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# --- Step 1: Check Root ---
info "Checking root privileges..."
if [ "$EUID" -ne 0 ]; then
  fail "Please run as root: sudo ./install.sh"
fi
ok "Running as root"

# --- Step 2: Install Docker ---
if [ "$SKIP_DOCKER" = false ]; then
  info "Checking Docker..."
  if check_command docker; then
    ok "Docker already installed: $(docker --version)"
  else
    info "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    ok "Docker installed: $(docker --version)"
  fi
fi

# Add current user to docker group if not root
if [ -n "${SUDO_USER:-}" ]; then
  usermod -aG docker "$SUDO_USER" 2>/dev/null || true
  info "Added user '$SUDO_USER' to docker group"
fi

# --- Step 3: Install NVIDIA Container Toolkit ---
if [ "$SKIP_NVIDIA" = false ]; then
  info "Checking NVIDIA Container Toolkit..."
  if dpkg -l | grep -q nvidia-container-toolkit 2>/dev/null; then
    ok "NVIDIA Container Toolkit already installed"
  else
    info "Installing NVIDIA Container Toolkit..."
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
      gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
    curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
      sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
      tee /etc/apt/sources.list.d/nvidia-container-toolkit.list >/dev/null
    apt-get update -qq
    apt-get install -y -qq nvidia-container-toolkit
    nvidia-ctk runtime configure --runtime=docker
    systemctl restart docker
    ok "NVIDIA Container Toolkit installed"
  fi
fi

# --- Step 4: Verify GPU ---
info "Verifying GPU access..."
if docker run --rm --gpus all ubuntu nvidia-smi -L 2>/dev/null; then
  ok "GPU access verified"
else
  warn "GPU access not detected. The platform will work but GPU features won't be available."
  warn "Make sure NVIDIA drivers and Container Toolkit are properly installed."
fi

# --- Step 5: Create Network ---
info "Creating Docker network '${NETWORK_NAME}'..."
docker network create "$NETWORK_NAME" 2>/dev/null || true
ok "Network '${NETWORK_NAME}' ready"

# --- Step 6: Setup Install Directory ---
info "Setting up install directory at ${INSTALL_DIR}..."
mkdir -p "$INSTALL_DIR"

# --- Step 7: Download Templates ---
if [ ! -d "${TEMPLATES_DIR}" ]; then
  info "Downloading app templates..."
  if check_command git; then
    TMPDIR=$(mktemp -d)
    git clone --depth 1 "$REPO_URL" "$TMPDIR/repo" 2>/dev/null || \
      git clone --depth 1 "${REPO_URL}.git" "$TMPDIR/repo" 2>/dev/null || {
      warn "Could not clone repo. Downloading templates archive..."
      curl -fsSL "${REPO_URL}/archive/refs/heads/main.tar.gz" | tar xz -C "$TMPDIR"
      cp -r "$TMPDIR/IanoIE-main/templates" "${TEMPLATES_DIR}" 2>/dev/null && TEMPLATES_COPIED=true
    }
    if [ -d "$TMPDIR/repo/templates" ]; then
      cp -r "$TMPDIR/repo/templates" "${INSTALL_DIR}/"
      ok "Templates downloaded from git"
    fi
    rm -rf "$TMPDIR"
  else
    info "git not found, downloading archive..."
    TMPDIR=$(mktemp -d)
    curl -fsSL "${REPO_URL}/archive/refs/heads/main.tar.gz" | tar xz -C "$TMPDIR"
    cp -r "$TMPDIR/IanoIE-main/templates" "${INSTALL_DIR}/"
    rm -rf "$TMPDIR"
    ok "Templates downloaded from archive"
  fi
else
  ok "Templates already present at ${TEMPLATES_DIR}"
fi

# --- Step 8: Download docker-compose ---
if [ "$USE_DEV" = true ]; then
  COMPOSE_FILE="docker/docker-compose.yml"
  info "Downloading development docker-compose.yml..."
else
  COMPOSE_FILE="docker/docker-compose.prod.yml"
  info "Downloading production docker-compose.prod.yml..."
fi

COMPOSE_TARGET="${INSTALL_DIR}/docker-compose.yml"
if check_command git && [ -d "$TMPDIR/repo" ] 2>/dev/null; then
  cp "$TMPDIR/repo/$COMPOSE_FILE" "$COMPOSE_TARGET" 2>/dev/null || true
fi

# Try downloading if not copied from clone
if [ ! -f "$COMPOSE_TARGET" ]; then
  BRANCH="main"
  curl -fsSL "${REPO_URL}/raw/${BRANCH}/${COMPOSE_FILE}" -o "$COMPOSE_TARGET" || {
    # Try .git extension
    curl -fsSL "${REPO_URL}.git/raw/${BRANCH}/${COMPOSE_FILE}" -o "$COMPOSE_TARGET" || {
      fail "Could not download docker-compose file"
    }
  }
fi
ok "docker-compose.yml downloaded"

# --- Step 9: Generate .env ---
if [ -n "$CUSTOM_ENV" ]; then
  info "Using custom .env file: ${CUSTOM_ENV}"
  cp "$CUSTOM_ENV" "$ENV_FILE"
  ok ".env file copied"
elif [ -f "$ENV_FILE" ]; then
  ok ".env file already exists, keeping it"
else
  info "Generating .env with secure secrets..."

  JWT_SECRET=$(generate_secret)
  ADMIN_PASSWORD=$(generate_secret | head -c 16)
  POSTGRES_PASSWORD=$(generate_secret | head -c 24)

  cat > "$ENV_FILE" << EOF
# IAnoIE Production Configuration
# Generated by install.sh on $(date -u +"%Y-%m-%d %H:%M:%S UTC")

# PostgreSQL
POSTGRES_USER=ianoie
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=ianoie

# JWT Authentication
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@ianoie.local
DEFAULT_ADMIN_PASSWORD=${ADMIN_PASSWORD}

# GPU Monitoring
GPU_POLL_INTERVAL_SECONDS=60
GPU_METRICS_RETENTION_DAYS=7

# Templates path on host
TEMPLATES_HOST_PATH=${TEMPLATES_DIR}
EOF

  chmod 600 "$ENV_FILE"
  ok ".env file generated with secure secrets"
fi

# --- Step 10: Pull Images ---
if [ "$USE_DEV" = false ]; then
  info "Pulling Docker images..."
  cd "$INSTALL_DIR"
  docker compose pull 2>/dev/null || {
    warn "Could not pull pre-built images. Building from source..."
    # Fallback: need repo for build
    if [ ! -f "${INSTALL_DIR}/Dockerfile" ]; then
      TMPDIR=$(mktemp -d)
      git clone --depth 1 "$REPO_URL" "$TMPDIR/repo" 2>/dev/null || git clone --depth 1 "${REPO_URL}.git" "$TMPDIR/repo" 2>/dev/null
      cp -r "$TMPDIR/repo/backend" "${INSTALL_DIR}/"
      cp -r "$TMPDIR/repo/frontend" "${INSTALL_DIR}/"
      rm -rf "$TMPDIR"
    fi
    docker compose build
  }
  ok "Images ready"
fi

# --- Step 11: Start Services ---
info "Starting IAnoIE services..."
cd "$INSTALL_DIR"
docker compose up -d
ok "Services started"

# --- Step 12: Wait for Health ---
echo ""
info "Waiting for services to become healthy..."

wait_for_health "postgres" 30 && ok "PostgreSQL is healthy" || warn "PostgreSQL health check timed out"
wait_for_health "redis" 15 && ok "Redis is healthy" || warn "Redis health check timed out"
wait_for_health "api" 60 && ok "API is healthy" || warn "API health check timed out"

# --- Done ---
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       IAnoIE Installed Successfully!       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Get server IP
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "<dgx-ip>")

echo -e "  ${BLUE}URL:${NC}      http://${SERVER_IP}"
echo -e "  ${BLUE}Login:${NC}    admin@ianoie.local"
if [ -z "$CUSTOM_ENV" ] && [ -f "$ENV_FILE" ]; then
  echo -e "  ${BLUE}Password:${NC} $(grep DEFAULT_ADMIN_PASSWORD "$ENV_FILE" | cut -d= -f2)"
fi
echo ""
echo -e "  ${BLUE}Config:${NC}    ${ENV_FILE}"
echo -e "  ${BLUE}Logs:${NC}      docker compose -f ${INSTALL_DIR}/docker-compose.yml logs -f"
echo -e "  ${BLUE}Update:${NC}    curl -fsSL ${REPO_URL}/raw/main/scripts/update.sh | bash"
echo -e "  ${BLUE}Backup:${NC}    curl -fsSL ${REPO_URL}/raw/main/scripts/backup.sh | bash"
echo ""
