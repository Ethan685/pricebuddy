export type JobStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";

export type ScrapeJobKind = "PRODUCT" | "SEARCH";

export interface ScrapeJobPayload {
  kind: ScrapeJobKind;
  marketplace: string;
  query?: string;
  productId?: string;
  url?: string;
}

export interface ScrapeJob {
  id: string;
  status: JobStatus;

  payload: ScrapeJobPayload;

  priority: number;
  attempts: number;
  maxAttempts: number;

  createdAt: string;
  updatedAt: string;

  nextRunAt: string;

  lockedAt?: string;
  lockedBy?: string;
  lockExpiresAt?: string;

  lastError?: string;
  lastErrorAt?: string;
}
