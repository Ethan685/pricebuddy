import { runPriceSchedulerOnce } from "../routes/price-scheduler";

async function main() {
  await runPriceSchedulerOnce();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
