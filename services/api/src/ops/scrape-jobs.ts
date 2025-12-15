async function main() {
  console.log("scrape_jobs: start");
  console.log("scrape_jobs: TODO wire to queue/enqueue worker");
  console.log("scrape_jobs: done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
