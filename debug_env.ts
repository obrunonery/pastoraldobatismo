
import dotenv from "dotenv";
const result = dotenv.config();
console.log("Dotenv result:", result.parsed ? "Success" : "Failed");
console.log("TURSO_URL:", process.env.TURSO_URL);
import { createClient } from "@libsql/client";
try {
    const client = createClient({ url: process.env.TURSO_URL!, authToken: process.env.TURSO_AUTH_DATABASE });
    console.log("Client created successfully");
} catch (e) {
    console.error("Client creation failed:", e);
}
