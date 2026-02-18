import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./drizzle/schema";
import { desc } from "drizzle-orm";
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
        console.log("Testing listFormations with Core API...");
        const result = await db.select().from(schema.formations).orderBy(desc(schema.formations.date));
        console.log("SUCCESS! Found", result.length, "formations.");
        if (result.length > 0) {
            console.log("Sample Data (Facilitator):", result[0].facilitator);
        }
    } catch (err) {
        console.error("STILL FAILING:", err.message);
    } finally {
        process.exit(0);
    }
}

main();
