#!/usr/bin/env bash
# Starts both Scrapling entry points inside one container:
#   1) MCP server (Streamable HTTP) in the background — consumed by Claude/Cursor/Claude Code.
#   2) Web terminal (ttyd) in the foreground (PID 1) — the CLI / `scrapling shell`.
set -euo pipefail

# Absolute path to the Scrapling CLI in the uv venv (robust to WORKDIR changes).
SCRAPLING_BIN="/app/.venv/bin/scrapling"
export PATH="/app/.venv/bin:${PATH}"

echo "[scrapling] starting MCP server (Streamable HTTP) on :8000 …"
"$SCRAPLING_BIN" mcp --http --host 0.0.0.0 --port 8000 &

# ttyd: -W = writable (client input), bash lands in WORKDIR (/root/work).
echo "[scrapling] starting web terminal (ttyd) on :7681 …"
exec ttyd -W -i 0.0.0.0 -p 7681 bash
