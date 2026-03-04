import dotenv from "dotenv";
dotenv.config();
import * as db from "./server/db";

async function main() {
    console.log("Testing dashboard functions...");
    try {
        console.log("Calling getDashboardSummary...");
        const summary = await db.getDashboardSummary();
        console.log("Dashboard Summary Result:", JSON.stringify(summary, null, 2));

        console.log("Calling getPresenceScale...");
        const scale = await db.getPresenceScale();
        console.log("Presence Scale Result Count:", scale.length);
        if (scale.length > 0) {
            console.log("Sample Scale Item:", JSON.stringify(scale[0], null, 2));
        }

        console.log("Calling getEvolutionData...");
        const evolution = await db.getEvolutionData();
        console.log("Evolution Data Result Count:", evolution.length);

        console.log("SUCCESS: Complex queries executed without errors!");

    } catch (e) {
        console.error("COMPLEX VERIFICATION FAILED:", e);
    }
    process.exit(0);
}

main();
