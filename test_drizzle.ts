import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./drizzle/schema";
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

const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_DATABASE!,
});

const db = drizzle(client, { schema });

async function main() {
    try {
        console.log("Checking formations table...");
        const results = await db.select().from(schema.formations).limit(1);
        if (results.length > 0) {
            console.log("DRIZZLE_RESULT_KEYS:", Object.keys(results[0]));
            console.log("DRIZZLE_RESULT_JSON:", JSON.stringify(results[0], null, 2));
        } else {
            console.log("SUCCESS: Connection worked, but formations table is empty.");
        }
    } catch (err) {
        console.error("Drizzle test failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.stack) console.error("Stack Trace:", err.stack);
    } finally {
        process.exit(0);
    }
}

main();
