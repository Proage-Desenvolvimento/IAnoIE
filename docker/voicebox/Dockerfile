# ============================================================
# Voicebox — open-source AI voice studio (CPU: web UI + REST + MCP)
# https://github.com/jamiepine/voicebox
#
# Upstream ships a `build: .` setup with NO published image, so (like
# docker/omnivoice/) this is a self-contained recipe the operator builds
# locally before installing the app:
#
#   docker build -t ianoie/voicebox:latest -f docker/voicebox/Dockerfile .
#   docker build -t ianoie/voicebox:latest -f docker/voicebox/Dockerfile \
#       --build-arg VOICEBOX_REF=<tag-or-sha> .
#
# Pin VOICEBOX_REF to a commit SHA for reproducible production builds.
# This is upstream's own 3-stage Dockerfile with a clone stage prepended,
# so it stays in sync with how upstream builds the image.
# ============================================================

ARG VOICEBOX_REF=main

# === Stage 0: fetch upstream source at a pinned ref ===
FROM alpine/git:latest AS source
ARG VOICEBOX_REF
RUN git clone --depth 1 --branch ${VOICEBOX_REF} \
      https://github.com/jamiepine/voicebox.git /src

# === Stage 1: build frontend (verbatim from upstream Dockerfile) ===
FROM oven/bun:1 AS frontend

WORKDIR /build

# Copy workspace config and frontend source
COPY --from=source /src/package.json /src/bun.lock /src/CHANGELOG.md ./
COPY --from=source /src/app/ ./app/
COPY --from=source /src/web/ ./web/

# Strip workspaces not needed for web build, and fix trailing comma
RUN sed -i '/"tauri"/d; /"landing"/d' package.json && \
    sed -i -z 's/,\n  ]/\n  ]/' package.json
RUN bun install --no-save
# Build frontend (skip tsc — upstream has pre-existing type errors)
RUN cd web && bunx --bun vite build


# === Stage 2: build Python dependencies ===
FROM python:3.11-slim AS backend-builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip

COPY --from=source /src/backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt
RUN pip install --no-cache-dir --prefix=/install --no-deps chatterbox-tts
RUN pip install --no-cache-dir --prefix=/install --no-deps hume-tada
RUN pip install --no-cache-dir --prefix=/install --no-deps \
    git+https://github.com/QwenLM/Qwen3-TTS.git


# === Stage 3: runtime ===
FROM python:3.11-slim

# Create non-root user for security
RUN groupadd -r voicebox && \
    useradd -r -g voicebox -m -s /bin/bash voicebox

WORKDIR /app

# Install only runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder stage
COPY --from=backend-builder /install /usr/local

# Copy backend application code
COPY --from=source --chown=voicebox:voicebox /src/backend/ /app/backend/

# Copy built frontend from frontend stage
COPY --from=frontend --chown=voicebox:voicebox /build/web/dist /app/frontend/

# Create data directories owned by the non-root user (also the model-cache
# target via VOICEBOX_MODELS_DIR in the template)
RUN mkdir -p /app/data/generations /app/data/profiles /app/data/cache /app/data/models \
    && chown -R voicebox:voicebox /app/data

# Switch to non-root user
USER voicebox

# Expose the API port
EXPOSE 17493

# Health check — auto-restart if the server hangs
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
    CMD curl -f http://localhost:17493/health || exit 1

# Start the FastAPI server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "17493"]
