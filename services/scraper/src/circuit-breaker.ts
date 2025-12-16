import { firestore } from "@pricebuddy/infra/firestore";

type BreakerState = {
  failures: number;
  openUntil?: string;
  updatedAt: string;
};

const COL = "scrape_circuit";

function nowIso() {
  return new Date().toISOString();
}

function addSeconds(iso: string, seconds: number) {
  const d = new Date(iso);
  d.setSeconds(d.getSeconds() + seconds);
  return d.toISOString();
}

export async function isOpen(marketplace: string) {
  const ref = firestore.collection(COL).doc(marketplace);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const s = snap.data() as BreakerState;
  if (!s.openUntil) return false;
  return s.openUntil > nowIso();
}

export async function recordSuccess(marketplace: string) {
  const ref = firestore.collection(COL).doc(marketplace);
  await ref.set({ failures: 0, openUntil: null, updatedAt: nowIso() }, { merge: true });
}

export async function recordFailure(marketplace: string, opts?: { threshold?: number; openSeconds?: number }) {
  const threshold = opts?.threshold ?? 5;
  const openSeconds = opts?.openSeconds ?? 120;
  const ref = firestore.collection(COL).doc(marketplace);

  await firestore.runTransaction(async (tx: any) => {
    const cur = await tx.get(ref);
    const now = nowIso();
    const data = (cur.exists ? (cur.data() as BreakerState) : { failures: 0, updatedAt: now }) as BreakerState;
    const failures = (data.failures ?? 0) + 1;

    const patch: Partial<BreakerState> = { failures, updatedAt: now };
    if (failures >= threshold) patch.openUntil = addSeconds(now, openSeconds);

    tx.set(ref, patch, { merge: true });
  });
}
