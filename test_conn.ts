import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@libsql/client";

async function run() {
    const url = process.env.TURSO_URL;
    const token = process.env.TURSO_AUTH_DATABASE;
    console.log("URL:", url);
    console.log("TOKEN_LENGTH:", token?.length);

    try {
        const client = createClient({ url: url!, authToken: token });
        const res = await client.execute("SELECT 1");
        console.log("SUCCESS:", res.rows[0]);
    } catch (e) {
        console.error("FAIL:", e);
    }
}

run();
