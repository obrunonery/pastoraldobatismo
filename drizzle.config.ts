import { defineConfig } from "drizzle-kit";

const connectionString = process.env.TURSO_URL;
if (!connectionString) {
    throw new Error("TURSO_URL is required to run drizzle commands");
}

export default defineConfig({
    schema: "./drizzle/schema.ts",
    out: "./drizzle",
    dialect: "turso",
    dbCredentials: {
        url: connectionString,
        authToken: process.env.TURSO_AUTH_DATABASE,
    },
});
