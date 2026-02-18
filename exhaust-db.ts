
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
dotenv.config();

const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_DATABASE,
});

async function exhaust() {
    console.log("--- EXHAUSTIVE DB CHECK ---");
    const tables = ["baptisms", "minutes", "events", "communications"];
    const now = new Date(new Date().getTime() - (3 * 60 * 60 * 1000)).toISOString().split('T')[0];
    console.log("Current ref date (now):", now);

    for (const table of tables) {
        try {
            const res = await client.execute(`SELECT * FROM ${table}`);
            console.log(`Table: ${table} (${res.rows.length} rows)`);
            if (res.rows.length > 0) {
                console.log("First row keys:", Object.keys(res.rows[0]));
                console.log("First row data:", JSON.stringify(res.rows[0], null, 2));

                // Try to find "next" row manually
                const dateKeys = ["date", "scheduled_date", "meeting_date", "scheduledDate", "meetingDate"];
                const next = res.rows.filter((row: any) => {
                    const dateVal = dateKeys.find(k => row[k]) ? row[dateKeys.find(k => row[k])!] : null;
                    return dateVal && dateVal >= now;
                });
                console.log(`Found ${next.length} future/today rows in ${table}`);
            }
        } catch (e: any) {
            console.error(`Error checking ${table}:`, e.message);
        }
    }
}

exhaust();
