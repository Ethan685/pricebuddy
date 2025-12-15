import * as functions from "firebase-functions";
import { processScrapeJobsOnce } from "../jobs/worker";

export const processScrapeJobs = functions
  .region("asia-northeast3")
  .pubsub.schedule("every 1 minutes")
  .onRun(async () => {
    await processScrapeJobsOnce();
  });

