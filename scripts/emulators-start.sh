set -euo pipefail
cd "/Users/ethanpark/Documents/Pricebuddy F"

for p in 4000 4400 4500 5001 8080 9150; do
  lsof -ti tcp:$p | xargs -r kill -9
done

rm -f /tmp/pricebuddy_emulators.pid /tmp/pricebuddy_emulators.log

nohup firebase emulators:start --only functions,firestore --project pricebuddy-5a869 \
  > /tmp/pricebuddy_emulators.log 2>&1 < /dev/null & echo $! > /tmp/pricebuddy_emulators.pid

disown
echo "EMULATORS_PID=$(cat /tmp/pricebuddy_emulators.pid)"
echo "LOG=/tmp/pricebuddy_emulators.log"
