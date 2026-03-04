
import "dotenv/config";
import * as db from "./server/db";

async function main() {
    console.log("Testing db.listBaptisms()...");
    try {
        const result = await db.listBaptisms();
        console.log("Result length:", result.length);
        if (result.length > 0) {
            console.log("First record sample:", JSON.stringify(result[0], null, 2));
        } else {
            console.log("No records found in baptisms table via listBaptisms()");
        }
    } catch (e) {
        console.error("Test error:", e);
    }
}

main();
