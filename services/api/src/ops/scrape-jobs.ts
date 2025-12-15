async function main() {
  console.log("scrape_jobs: start");
  console.log("scrape_jobs: TODO connect to queue/worker + persist offers");
  console.log("scrape_jobs: done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
