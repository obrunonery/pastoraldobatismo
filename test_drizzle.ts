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
        const results = await db.select().from(schema.formations).limit(1);
        console.log("DRIZZLE_RESULT_KEYS:", Object.keys(results[0]));
        console.log("DRIZZLE_RESULT_JSON:", JSON.stringify(results[0], null, 2));
    } catch (err) {
        console.error("Drizzle test failed:", err.message);
    } finally {
        process.exit(0);
    }
}

main();
