
import axios from "axios";

// Direct HTTP call to the emulator
async function verifySearch() {
    console.log("Verifying search API...");
    const projectId = "pricebuddy-5a869";
    const region = "us-central1";
    const functionName = "searchProducts";
    const url = `http://127.0.0.1:5001/${projectId}/${region}/${functionName}`;

    try {
        const response = await axios.post(url, {
            data: { query: "ALL" }
        });

        console.log("Response Data:", JSON.stringify(response.data.result, null, 2));

        if (response.data.result && response.data.result.products && response.data.result.products.length > 0) {
            console.log("✅ Search verification passed!");
        } else {
            console.error("❌ Search returned no results.");
            if (response.data.result.debug) {
                console.log("--- REMOTE DEBUG LOGS ---");
                console.log(response.data.result.debug.join("\n"));
                console.log("------------------------");
            }
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Search verification failed:", error);
        process.exit(1);
    }
}

verifySearch();
