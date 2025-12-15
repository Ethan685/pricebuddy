import { firestore } from "@pricebuddy/infra/firestore";
import type { ScrapeJob, ScrapeJobPayload } from "@pricebuddy/core";

const COL = "scrape_jobs";

function nowIso() {
  return new Date().toISOString();
}

function addSeconds(iso: string, seconds: number) {
  const d = new Date(iso);
  d.setSeconds(d.getSeconds() + seconds);
  return d.toISOString();
}

export async function enqueueScrapeJob(payload: ScrapeJobPayload, opts?: Partial<Pick<ScrapeJob, "priority" | "maxAttempts">>) {
  const createdAt = nowIso();
  const docRef = firestore.collection(COL).doc();
  const job: ScrapeJob = {
    id: docRef.id,
    status: "PENDING",
    payload,
    priority: opts?.priority ?? 50,
    attempts: 0,
    maxAttempts: opts?.maxAttempts ?? 5,
    createdAt,
    updatedAt: createdAt,
    nextRunAt: createdAt,
  };
  await docRef.set(job, { merge: true });
  return job;
}

export async function markJobSuccess(jobId: string) {
  const updatedAt = nowIso();
  await firestore.collection(COL).doc(jobId).set(
    {
      status: "SUCCEEDED",
      updatedAt,
      lockedAt: null,
      lockedBy: null,
      lockExpiresAt: null,
      lastError: null,
      lastErrorAt: null,
    },
    { merge: true }
  );
}

export async function markJobFailure(jobId: string, err: unknown, backoffSeconds: number) {
  const updatedAt = nowIso();
  const msg = err instanceof Error ? (err.stack || err.message) : String(err);
  const nextRunAt = addSeconds(updatedAt, backoffSeconds);
  await firestore.collection(COL).doc(jobId).set(
    {
      status: "PENDING",
      updatedAt,
      nextRunAt,
      lastError: msg.slice(0, 4000),
      lastErrorAt: updatedAt,
      lockedAt: null,
      lockedBy: null,
      lockExpiresAt: null,
    },
    { merge: true }
  );
}

export async function hardFailJob(jobId: string, err: unknown) {
  const updatedAt = nowIso();
  const msg = err instanceof Error ? (err.stack || err.message) : String(err);
  await firestore.collection(COL).doc(jobId).set(
    {
      status: "FAILED",
      updatedAt,
      lastError: msg.slice(0, 4000),
      lastErrorAt: updatedAt,
      lockedAt: null,
      lockedBy: null,
      lockExpiresAt: null,
    },
    { merge: true }
  );
}

export async function claimJobs(params: {
  limit: number;
  workerId: string;
  lockSeconds: number;
  minPriority?: number;
}) {
  const { limit, workerId, lockSeconds, minPriority } = params;
  const now = nowIso();
  const lockExpiresAt = addSeconds(now, lockSeconds);

  const base = firestore
    .collection(COL)
    .where("status", "==", "PENDING")
    .where("nextRunAt", "<=", now)
    .orderBy("nextRunAt", "asc")
    .orderBy("priority", "desc")
    .limit(limit);

  const snap = await base.get();
  const docs = snap.docs;

  const claimed: ScrapeJob[] = [];
  for (const d of docs) {
    const job = d.data() as ScrapeJob;
    if (typeof minPriority === "number" && job.priority < minPriority) continue;

    await firestore.runTransaction(async (tx) => {
      const ref = firestore.collection(COL).doc(job.id);
      const cur = await tx.get(ref);
      if (!cur.exists) return;
      const data = cur.data() as ScrapeJob;
      if (data.status !== "PENDING") return;
      if (data.nextRunAt > now) return;
      if (data.lockExpiresAt && data.lockExpiresAt > now) return;

      tx.set(
        ref,
        {
          status: "RUNNING",
          attempts: (data.attempts ?? 0) + 1,
          updatedAt: now,
          lockedAt: now,
          lockedBy: workerId,
          lockExpiresAt,
        },
        { merge: true }
      );
      claimed.push({ ...data, status: "RUNNING", attempts: (data.attempts ?? 0) + 1, updatedAt: now, lockedAt: now, lockedBy: workerId, lockExpiresAt });
    });
  }

  return claimed;
}
