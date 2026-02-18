
import { getDashboardSummary } from "./server/db.ts";

async function diag() {
    console.log("--- Integrated Diagnostic ---");
    try {
        const summary = await getDashboardSummary();
        console.log("Full Summary Object:", JSON.stringify(summary, null, 2));
    } catch (e) {
        console.error("DIAG ERROR:", e);
    }
}

diag();
