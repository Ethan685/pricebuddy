pkill -f firebase || true
pkill -f "pnpm dev" || true
pkill -f vite || true
lsof -ti :5001 | xargs -r kill -9 || true
lsof -ti :8080 | xargs -r kill -9 || true
lsof -ti :5173 | xargs -r kill -9 || true
echo "RESET DONE"
