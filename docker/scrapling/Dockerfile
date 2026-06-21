# Scrapling (adaptive web-scraping framework) wrapped as an IAnoIE app.
#
# Self-contained recipe the operator builds once — same pattern as docker/voicebox
# and docker/omnivoice (there is no build step in docker-compose). Serves two things
# behind one URL, both protected by Basic Auth (enforced by Traefik via the template):
#   - a web terminal (CLI: `scrapling shell`, `scrapling extract`) on :7681
#   - the MCP Streamable HTTP server (native since Scrapling v0.3.6) on :8000
#
# Build (x86_64 dev box):
#   docker build -t ianoie/scrapling:latest -f docker/scrapling/Dockerfile .
# Build for the DGX Spark (arm64):
#   docker build --platform linux/arm64 -t ianoie/scrapling:latest -f docker/scrapling/Dockerfile .
#
# The base image already bundles Chromium + all Scrapling extras via uv, so this layer
# only adds ttyd (web terminal) and an entrypoint that starts both processes.

FROM ghcr.io/d4vinci/scrapling:latest

# ttyd = web terminal; bash is already in the python:3.12-slim base. apt gives us a
# multi-arch binary (works on both amd64 dev and arm64 DGX Spark) without downloading
# arch-specific release assets.
RUN apt-get update && apt-get install -y --no-install-recommends ttyd \
    && rm -rf /var/lib/apt/lists/*

# Global wrapper so the web terminal's bash finds `scrapling` regardless of PATH/WORKDIR.
RUN printf '#!/usr/bin/env sh\nexec /app/.venv/bin/scrapling "$@"\n' > /usr/local/bin/scrapling \
    && chmod +x /usr/local/bin/scrapling

# Persisted workspace for scripts / scraped output (mounted as the scrapling-work volume).
RUN mkdir -p /root/work
WORKDIR /root/work

# Friendly hints in the web terminal.
RUN printf 'export PATH="/app/.venv/bin:$PATH"\n\
echo ""\n\
echo "Scrapling ready. Try:"\n\
echo "  scrapling --help"\n\
echo "  scrapling shell"\n\
echo "  scrapling extract get https://example.com out.md"\n\
echo "Work dir: /root/work (persisted across restarts)"\n\
echo ""\n' > /root/.bashrc

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7681 8000
ENTRYPOINT ["/entrypoint.sh"]
