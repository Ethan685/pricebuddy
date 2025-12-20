set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ID="${PROJECT_ID:-pricebuddy-5a869}"
API_KEY="${API_KEY:-pk_live_test_1234}"
QUERY="${QUERY:-iphone}"
REGION="${REGION:-KR}"

kill_port () {
  local p="$1"
  if lsof -ti tcp:"$p" >/dev/null 2>&1; then
    lsof -ti tcp:"$p" | xargs -r kill -9
  fi
}

for p in 4000 4400 4500 5001 8080 5173; do
  kill_port "$p"
done

cd "$ROOT_DIR"

if [ ! -f firebase.json ]; then
  cat > firebase.json <<JSON
{
  "functions": { "source": "functions" },
  "emulators": {
    "ui": { "enabled": true, "port": 4000 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "hub": { "port": 4400 },
    "logging": { "port": 4500 }
  }
}
JSON
fi

cd "$ROOT_DIR/functions"
if [ ! -d node_modules ]; then
  npm i
fi

node - <<NODE
const admin = require("firebase-admin");
const crypto = require("crypto");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.PROJECT_ID || "pricebuddy-5a869" });
const db = admin.firestore();

const plain = process.env.API_KEY || "pk_live_test_1234";
const hashedKey = crypto.createHash("sha256").update(plain).digest("hex");

(async () => {
  await db.collection("api_keys").doc("test-key").set({
    active: true,
    hashedKey,
    label: "local-test",
    userId: "system",
    usageCount: 0,
    lastUsed: null
  }, { merge: true });
  console.log("seed ok", { plain, hashedKey });
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
NODE

cd "$ROOT_DIR"
firebase emulators:start --only functions,firestore --project "$PROJECT_ID" &
EMU_PID=$!

sleep 4

curl -i "http://127.0.0.1:5001/${PROJECT_ID}/us-central1/apiSearchProducts?query=${QUERY}&region=${REGION}" -H "X-API-Key: ${API_KEY}" | head -n 30

wait "$EMU_PID"
