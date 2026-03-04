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
    console.log("Testing ResultSet row mode...");
    try {
        const res = await client.execute("SELECT 1 as test_col");
        console.log("Raw Row 0:", res.rows[0]);
        console.log("Keys of Row 0:", Object.keys(res.rows[0]));
        console.log("test_col value:", (res.rows[0] as any).test_col);
    } catch (e) {
        console.error("Test failed:", e);
    }
    process.exit(0);
}

main();
