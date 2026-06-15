#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail()  { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }

echo "=== IAnoIE VPS Setup ==="
echo "This script prepares your Linux VPS for IAnoIE"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
  fail "Please run as root: sudo ./setup-vps.sh"
fi

# --- Detect OS ---
detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "$ID"
  elif [ -f /etc/redhat-release ]; then
    echo "rhel"
  else
    echo "unknown"
  fi
}

OS_ID=$(detect_os)
info "Detected OS: $OS_ID"

# --- Install system dependencies ---
install_deps() {
  local missing=()
  for cmd in curl git; do
    if ! command -v "$cmd" &> /dev/null; then
      missing+=("$cmd")
    fi
  done

  if [ ${#missing[@]} -eq 0 ]; then
    ok "System dependencies already installed"
    return
  fi

  info "Installing: ${missing[*]}"
  case "$OS_ID" in
    ubuntu|debian)
      apt-get update -qq
      apt-get install -y -qq "${missing[@]}"
      ;;
    almalinux|rocky|centos|rhel)
      dnf install -y -q "${missing[@]}" 2>/dev/null || yum install -y -q "${missing[@]}"
      ;;
    *)
      warn "Unsupported OS '$OS_ID' — please install manually: ${missing[*]}"
      ;;
  esac
}

install_deps

# --- Install Docker ---
if ! command -v docker &> /dev/null; then
  info "Installing Docker..."
  case "$OS_ID" in
    ubuntu|debian)
      curl -fsSL https://get.docker.com | sh
      ;;
    almalinux|rocky|centos|rhel)
      # get.docker.com rejects some RHEL-family forks ("Unsupported distribution 'almalinux'"),
      # so use Docker's official CE repo — the centos channel is RHEL/AlmaLinux/Rocky compatible.
      dnf install -y dnf-plugins-core
      dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
      dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      ;;
    *)
      warn "Unsupported OS '$OS_ID' for Docker install — falling back to get.docker.com"
      curl -fsSL https://get.docker.com | sh
      ;;
  esac
  systemctl enable docker
  systemctl start docker
  ok "Docker installed: $(docker --version)"
else
  ok "Docker already installed: $(docker --version)"
fi

# --- GPU detection and optional NVIDIA setup ---
if command -v nvidia-smi &> /dev/null; then
  info "NVIDIA GPU detected!"
  nvidia-smi -L 2>/dev/null || true

  # Install NVIDIA Container Toolkit
  case "$OS_ID" in
    ubuntu|debian)
      if ! dpkg -l | grep -q nvidia-container-toolkit 2>/dev/null; then
        info "Installing NVIDIA Container Toolkit (apt)..."
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
          gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
          sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
          tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
        apt-get update -qq
        apt-get install -y -qq nvidia-container-toolkit
        nvidia-ctk runtime configure --runtime=docker
        systemctl restart docker
        ok "NVIDIA Container Toolkit installed"
      else
        ok "NVIDIA Container Toolkit already installed"
      fi
      ;;
    almalinux|rocky|centos|rhel)
      if ! rpm -q nvidia-container-toolkit &>/dev/null; then
        info "Installing NVIDIA Container Toolkit (dnf)..."
        curl -s -L https://nvidia.github.io/libnvidia-container/stable/rpm/nvidia-container-toolkit.repo | \
          tee /etc/yum.repos.d/nvidia-container-toolkit.repo
        dnf install -y -q nvidia-container-toolkit
        nvidia-ctk runtime configure --runtime=docker
        systemctl restart docker
        ok "NVIDIA Container Toolkit installed"
      else
        ok "NVIDIA Container Toolkit already installed"
      fi
      ;;
    *)
      warn "Please install NVIDIA Container Toolkit manually for your OS"
      ;;
  esac

  # Verify GPU access
  info "Verifying GPU access in Docker..."
  if docker run --rm --gpus all ubuntu nvidia-smi -L &>/dev/null; then
    ok "GPU access in Docker: working"
  else
    warn "GPU access in Docker: not working (apps will run in CPU mode)"
  fi
else
  info "No NVIDIA GPU detected — skipping GPU setup"
  info "Apps will run in CPU mode. GPU-enabled apps will show a warning."
fi

# --- SELinux (RHEL-family only) ---
# AlmaLinux/Rocky/CentOS/RHEL ship with SELinux enforcing. The bind mounts in
# docker-compose use the :z flag (shared container label) so containers can
# access /var/run/docker.sock and the templates dir without AVC denials.
case "$OS_ID" in
  almalinux|rocky|centos|rhel)
    if command -v getenforce &>/dev/null && [ "$(getenforce)" != "Disabled" ]; then
      info "SELinux: $(getenforce) — bind mounts in docker-compose use :z for compatibility"
      if ! rpm -q container-selinux &>/dev/null; then
        warn "container-selinux not found — install it: dnf install -y container-selinux"
      fi
    fi
    ;;
esac

# --- Create Docker network ---
echo ""
info "Creating ianoie-proxy network..."
docker network create ianoie-proxy 2>/dev/null && ok "Network created" || ok "Network already exists"

# --- Done ---
echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and configure"
echo "  2. Run: docker compose -f docker/docker-compose.yml up -d"
echo "  3. Access: http://<your-vps-ip>:8888"
echo "  4. Login: admin@aimization.com / admin"
echo ""
echo "To install on a DGX Spark with NVIDIA GPU, use setup-dgx.sh instead."
