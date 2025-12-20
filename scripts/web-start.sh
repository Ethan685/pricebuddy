set -euo pipefail
cd "/Users/ethanpark/Documents/Pricebuddy F/apps/web_app"

for p in 5173; do
  lsof -ti tcp:$p | xargs -r kill -9
done

rm -f /tmp/pricebuddy_web.pid /tmp/pricebuddy_web.log

nohup pnpm -s dev --host 127.0.0.1 --port 5173 \
  > /tmp/pricebuddy_web.log 2>&1 < /dev/null & echo $! > /tmp/pricebuddy_web.pid

disown
echo "WEB_PID=$(cat /tmp/pricebuddy_web.pid)"
echo "LOG=/tmp/pricebuddy_web.log"
echo "URL=http://127.0.0.1:5173/"
