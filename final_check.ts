import * as db from "./server/db";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function main() {
    try {
        const results = await db.listFormations();
        console.log("FINAL_CHECK_KEYS:", Object.keys(results[0]));
        console.log("FINAL_CHECK_FACILITATOR:", results[0].facilitator);
        console.log("FINAL_CHECK_FILEURL:", results[0].fileUrl);
    } catch (err) {
        console.error("Final check failed:", err.message);
    } finally {
        process.exit(0);
    }
}

main();
