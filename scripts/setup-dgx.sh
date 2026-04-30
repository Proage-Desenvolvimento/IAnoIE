#!/usr/bin/env bash
set -euo pipefail

echo "=== IAnoIE DGX Setup ==="
echo "This script prepares your DGX machine for IAnoIE"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root: sudo ./setup-dgx.sh"
  exit 1
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "Docker installed."
else
  echo "Docker already installed: $(docker --version)"
fi

# Install NVIDIA Container Toolkit
if ! dpkg -l | grep -q nvidia-container-toolkit &> /dev/null; then
  echo "Installing NVIDIA Container Toolkit..."
  curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
    gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
  curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
  apt-get update
  apt-get install -y nvidia-container-toolkit
  nvidia-ctk runtime configure --runtime=docker
  systemctl restart docker
  echo "NVIDIA Container Toolkit installed."
else
  echo "NVIDIA Container Toolkit already installed."
fi

# Verify GPU access
echo ""
echo "Verifying GPU access in Docker..."
docker run --rm --gpus all ubuntu nvidia-smi -L 2>/dev/null && echo "GPU access: OK" || echo "WARNING: GPU access not working"

# Create Docker network
echo ""
echo "Creating ianoie-proxy network..."
docker network create ianoie-proxy 2>/dev/null || echo "Network already exists"

# Create Docker network
echo ""
echo "Creating ianoie-proxy network..."
docker network create ianoie-proxy 2>/dev/null || echo "Network already exists"

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "  1. Copy .env.example to .env and configure"
echo "  2. Run: docker compose -f docker/docker-compose.yml up -d"
echo "  3. PostgreSQL will auto-create the ianoie database"
echo "  4. Access: http://<dgx-ip>"
echo "  5. Login: admin@ianoie.local / admin"
