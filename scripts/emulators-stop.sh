set -euo pipefail
PID_FILE="/tmp/pricebuddy_emulators.pid"
if [ -f "$PID_FILE" ]; then
  kill -TERM "$(cat "$PID_FILE")" 2>/dev/null || true
  rm -f "$PID_FILE"
fi
for p in 4000 4400 4500 5001 8080 9150; do
  lsof -ti tcp:$p | xargs -r kill -9
done
echo "stopped"
