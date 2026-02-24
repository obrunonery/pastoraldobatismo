import "dotenv/config";
import { createClient } from "@libsql/client";

async function test() {
    console.log("URL:", process.env.TURSO_URL);
    console.log("TOKEN_LENGTH:", process.env.TURSO_AUTH_DATABASE?.length);

    if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_DATABASE) {
        console.error("ERRO: Variáveis de ambiente faltando!");
        process.exit(1);
    }

    const client = createClient({
        url: process.env.TURSO_URL,
        authToken: process.env.TURSO_AUTH_DATABASE,
    });

    try {
        const res = await client.execute("SELECT 1");
        console.log("SUCCESS:", res.rows[0]);
    } catch (e) {
        console.error("FAILURE:", e);
    }
}

test().catch(console.error);
