import dotenv from "dotenv";
dotenv.config();
import * as db from "./server/db";

async function main() {
    console.log("Testing db.listBaptisms()...");
    try {
        const result = await db.listBaptisms();
        console.log("Result length:", result.length);
        if (result.length > 0) {
            console.log("First record sample:", JSON.stringify(result[0], null, 2));
        } else {
            console.log("Check if table exists and has data directly...");
            const diagnostic = await db.db.select().from(require("./drizzle/schema").baptisms);
            console.log("Direct Drizzle Select count:", diagnostic.length);
        }
    } catch (e) {
        console.error("Test error:", e);
    }
    process.exit(0);
}

main();
