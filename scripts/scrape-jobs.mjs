import { execSync } from "node:child_process";

execSync("pnpm -C services/api build", { stdio: "inherit" });
execSync("node services/api/dist/ops/scrape-jobs.js", { stdio: "inherit" });
