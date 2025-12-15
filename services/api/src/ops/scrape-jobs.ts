async function main() {
  console.log("scrape_jobs: start");
  // TODO: connect queue -> fetch offers -> persist to Firestore
  console.log("scrape_jobs: done");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
