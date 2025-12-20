#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EMULATOR_DATA="$ROOT_DIR/.emulator-data"

echo "==> Kill leftover firebase/node processes"
pkill -f "firebase emulators" || true
pkill -f "firebase-tools" || true
pkill -f "node .*firebase" || true

echo "==> Free ports"
for p in 4000 4400 4500 4501 5001 8080 5173 3000; do
  lsof -ti tcp:$p | xargs -I{} kill -9 {} 2>/dev/null || true
done

echo "==> Ensure emulator data dir"
mkdir -p "$EMULATOR_DATA"

echo "==> Start Firebase emulators (functions, firestore)"
cd "$ROOT_DIR"
firebase emulators:start \
  --only functions,firestore \
  --import="$EMULATOR_DATA" \
  --export-on-exit \
  > "$ROOT_DIR/dev/emulators.log" 2>&1 &

EMULATOR_PID=$!
echo $EMULATOR_PID > "$ROOT_DIR/dev/emulators.pid"

echo "==> Wait emulators to boot"
sleep 6

echo "==> Start web app"
cd "$ROOT_DIR/apps/web_app"
pnpm dev > "$ROOT_DIR/dev/web.log" 2>&1 &

WEB_PID=$!
echo $WEB_PID > "$ROOT_DIR/dev/web.pid"

echo "==> DONE"
echo "Emulators PID: $EMULATOR_PID"
echo "Web PID: $WEB_PID"
echo "Logs: dev/emulators.log , dev/web.log"
