#!/usr/bin/env bash
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "==> Emulators log:"
tail -n 100 "$ROOT_DIR/dev/emulators.log"
echo
echo "==> Web log:"
tail -n 100 "$ROOT_DIR/dev/web.log"
