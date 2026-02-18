
import { getDashboardSummary } from "./server/db.ts";

async function diag() {
    console.log("--- FINAL DIAGNOSTIC ---");
    try {
        const summary = await getDashboardSummary();
        console.log("Summary Result:", JSON.stringify(summary, null, 2));
    } catch (e: any) {
        console.error("DIAG ERROR (Message):", e.message);
        console.error("DIAG ERROR (Full):", e);
    }
}

diag();
