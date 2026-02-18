import { createClient } from "@libsql/client";
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

async function main() {
    try {
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
        for (const table of tables.rows) {
            const name = table.name as string;
            if (name.startsWith('_')) continue;

            console.log(`\n--- TABLE: ${name} ---`);
            const info = await client.execute(`PRAGMA table_info(${name})`);
            const columns = info.rows.map(r => r.name);
            console.log(`Columns: ${columns.join(', ')}`);

            const data = await client.execute(`SELECT * FROM ${name} LIMIT 3`);
            console.log("Sample Data:");
            console.log(JSON.stringify(data.rows, null, 2));
        }
    } catch (err) {
        console.error("Audit failed:", err.message);
    } finally {
        process.exit(0);
    }
}

main();
