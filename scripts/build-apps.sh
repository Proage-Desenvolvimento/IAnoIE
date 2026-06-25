#!/usr/bin/env bash
# Build the custom (operator-built) app images used by IAnoIE templates:
#   scrapling, omnivoice, voicebox
#
# These images are NOT produced by docker-compose or CI — only their Dockerfiles
# ship in docker/<app>/. The install task pulls them only if absent locally
# (install.py checks the local image store first), so each must exist on the host
# before its app can be installed. This script builds them.
#
# Usage:
#   ./scripts/build-apps.sh                  # build all three
#   ./scripts/build-apps.sh scrapling        # build only scrapling
#   ./scripts/build-apps.sh scrapling voicebox
#   BUILD_PLATFORM=linux/arm64 ./scripts/build-apps.sh   # cross-build for arm64 (DGX Spark)
#
# Run from anywhere — locates the repo root (dir with docker/docker-compose.yml).
# Builds natively (host arch) by default, which is correct for running on the same host.

set -euo pipefail

# --- locate repo root (dir with docker/docker-compose.yml), like update.sh ---
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

# --- output helpers ---
RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'; BLUE=$'\033[0;34m'; NC=$'\033[0m'
info(){ printf '%s[INFO]%s  %s\n' "$BLUE" "$NC" "$*"; }
ok(){   printf '%s[OK]%s    %s\n' "$GREEN" "$NC" "$*"; }
warn(){ printf '%s[WARN]%s  %s\n' "$YELLOW" "$NC" "$*"; }
fail(){ printf '%s[FAIL]%s  %s\n' "$RED" "$NC" "$*"; exit 1; }

# --- preflight ---
docker info >/dev/null 2>&1 || fail "docker not accessible — run as root (or be in the docker group)"

# Per-app build spec. NOTE the context differs on purpose:
#   - scrapling Dockerfile does `COPY entrypoint.sh`, and entrypoint.sh lives in
#     docker/scrapling/, so its context MUST be docker/scrapling (NOT repo root).
#   - omnivoice/voicebox have no local COPY (multi-stage / git-clone stages), so
#     repo root (".") is a valid context for them.
ALL_APPS=(scrapling omnivoice voicebox)
app_image()     { case "$1" in scrapling) echo "ianoie/scrapling:latest";; omnivoice) echo "ianoie/omnivoice:latest";; voicebox) echo "ianoie/voicebox:latest";; esac; }
app_dockerfile(){ case "$1" in scrapling) echo "docker/scrapling/Dockerfile";; omnivoice) echo "docker/omnivoice/Dockerfile";; voicebox) echo "docker/voicebox/Dockerfile";; esac; }
app_context()   { case "$1" in scrapling) echo "docker/scrapling";; omnivoice) echo ".";; voicebox) echo ".";; esac; }

# Optional cross-build platform (e.g. linux/arm64 when building on amd64 for the DGX Spark).
PLATFORM_FLAG=()
if [ -n "${BUILD_PLATFORM:-}" ]; then
  PLATFORM_FLAG=(--platform "$BUILD_PLATFORM")
  info "Cross-building for platform: $BUILD_PLATFORM"
fi

# Resolve which apps to build (default: all known).
if [ "$#" -gt 0 ]; then
  APPS=( "$@" )
else
  APPS=( "${ALL_APPS[@]}" )
fi

cd "$REPO_DIR"
FAILURES=0
for app in "${APPS[@]}"; do
  image="$(app_image "$app")"
  dockerfile="$(app_dockerfile "$app")"
  context="$(app_context "$app")"
  if [ -z "$image" ] || [ -z "$dockerfile" ]; then
    warn "Unknown app: $app (known: ${ALL_APPS[*]})"
    FAILURES=$((FAILURES + 1))
    continue
  fi
  if [ ! -f "$REPO_DIR/$dockerfile" ]; then
    warn "$app: Dockerfile not found at $dockerfile — skipping"
    FAILURES=$((FAILURES + 1))
    continue
  fi
  info "Building $app → $image (context: $context) ..."
  if docker build ${PLATFORM_FLAG[@]+"${PLATFORM_FLAG[@]}"} -t "$image" -f "$dockerfile" "$context"; then
    ok "$app built → $image"
  else
    warn "$app build failed (image $image) — this app won't be installable until it builds"
    FAILURES=$((FAILURES + 1))
  fi
done

echo ""
if [ "$FAILURES" -eq 0 ]; then
  ok "All requested app images built."
else
  warn "$FAILURES app image(s) failed — see above."
  exit 1
fi
