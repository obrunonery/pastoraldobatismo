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
    console.log("Testing INSERT into finance table...");
    try {
        const res = await client.execute({
            sql: "INSERT INTO finance (type, value, description, date, category) VALUES (?, ?, ?, ?, ?)",
            args: ["entrada", 10.50, "Teste de Conexão", new Date().toISOString(), "Teste"]
        });
        console.log("INSERT SUCCESS:", res);

        const deleted = await client.execute({
            sql: "DELETE FROM finance WHERE description = ?",
            args: ["Teste de Conexão"]
        });
        console.log("DELETE SUCCESS (Cleanup):", deleted);
    } catch (e) {
        console.error("INSERT FAILED:", e);
    }
    process.exit(0);
}

main();
