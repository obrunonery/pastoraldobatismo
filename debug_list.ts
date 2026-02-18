import dotenv from "dotenv";
dotenv.config();

// IMPORTANTE: importar depois do config()
import { listFormations } from "./server/db";

async function run() {
    try {
        console.log("ENV CHECK:", process.env.TURSO_URL ? "URL present" : "URL MISSING");
        const results = await listFormations();
        console.log("TOTAL_RESULTS:", results.length);
        if (results.length > 0) {
            console.log("FIRST_RESULT_KEYS:", Object.keys(results[0]));
            //console.log("FIRST_RESULT_DATA:", JSON.stringify(results[0], null, 2));
            results.forEach((r: any) => {
                console.log(`ID: ${r.id} | Facilitator: "${r.facilitator}" | Keys: ${Object.keys(r).join(',')}`);
            });
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
}

run();
