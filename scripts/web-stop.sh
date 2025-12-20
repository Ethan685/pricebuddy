set -euo pipefail
PID_FILE="/tmp/pricebuddy_web.pid"
if [ -f "$PID_FILE" ]; then
  kill -TERM "$(cat "$PID_FILE")" 2>/dev/null || true
  rm -f "$PID_FILE"
fi
lsof -ti tcp:5173 | xargs -r kill -9
echo "stopped"
