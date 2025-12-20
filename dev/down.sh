#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Stop web"
if [ -f "$ROOT_DIR/dev/web.pid" ]; then
  kill -9 "$(cat "$ROOT_DIR/dev/web.pid")" || true
  rm -f "$ROOT_DIR/dev/web.pid"
fi

echo "==> Stop emulators"
if [ -f "$ROOT_DIR/dev/emulators.pid" ]; then
  kill -9 "$(cat "$ROOT_DIR/dev/emulators.pid")" || true
  rm -f "$ROOT_DIR/dev/emulators.pid"
fi

echo "==> Kill leftovers"
pkill -f "firebase emulators" || true
pkill -f "firebase-tools" || true
pkill -f "node .*firebase" || true

echo "==> DONE"
