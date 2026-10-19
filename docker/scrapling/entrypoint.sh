#!/usr/bin/env bash
# Starts both Scrapling entry points inside one container:
#   1) MCP server (Streamable HTTP) in the background — consumed by Claude/Cursor/Claude Code.
#   2) Web terminal (ttyd) in the foreground (PID 1) — the CLI / `scrapling shell`.
set -euo pipefail

# Absolute path to the Scrapling CLI in the uv venv (robust to WORKDIR changes).
SCRAPLING_BIN="/app/.venv/bin/scrapling"
export PATH="/app/.venv/bin:${PATH}"

echo "[scrapling] starting MCP server (Streamable HTTP) on :8000 …"
# Supervised so a crashed MCP server comes back on its own — the container stays
# "running" as long as ttyd (PID 1) lives, so nothing else would restart it.
# `set +e`: the inherited errexit would exit this loop on the first crash.
(
    set +e
    while true; do
        "$SCRAPLING_BIN" mcp --http --host 0.0.0.0 --port 8000
        echo "[scrapling] MCP server exited (code $?) — restarting in 3s…" >&2
        sleep 3
    done
) &

# ttyd: -W = writable (client input), bash lands in WORKDIR (/root/work).
echo "[scrapling] starting web terminal (ttyd) on :7681 …"
exec ttyd -W -i 0.0.0.0 -p 7681 bash
