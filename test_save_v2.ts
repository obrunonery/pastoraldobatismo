import dotenv from "dotenv";
dotenv.config();
import * as db from "./server/db";

async function main() {
    console.log("Testing refactored createTransaction (V2)...");
    try {
        const testData = {
            type: "entrada" as const,
            value: 99.99,
            description: "Teste Refatoração Drizzle V2",
            date: new Date().toISOString(),
            category: "Outros"
        };

        const result = await db.createTransaction(testData);
        console.log("Create Result:", result);

        console.log("Testing refactored listTransactions...");
        const list = await db.listTransactions();
        const found = list.find(t => t.description === testData.description);

        if (found) {
            console.log("SUCCESS: Transaction found in list!", found);
        } else {
            console.log("FAIL: Transaction not found in list.");
        }

        // Cleanup
        if (found && found.id) {
            await db.deleteTransaction(found.id);
            console.log("Cleanup: Deleted test transaction.");
        }

    } catch (e) {
        console.error("VERIFICATION FAILED:", e);
    }
    process.exit(0);
}

main();
