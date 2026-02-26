import { sql } from "drizzle-orm";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { db: database } = await import("../server/db.js");
        // Test basic query
        const result = await (database as any).execute(sql`SELECT 1 as test`);
        res.status(200).json({
            status: "ok",
            database: "connected",
            nodeVersion: process.version,
            env: {
                hasTursoUrl: !!process.env.TURSO_URL,
                hasTursoAuth: !!process.env.TURSO_AUTH_DATABASE,
                hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
            },
            result: result.rows[0]
        });
    } catch (err: any) {
        console.error("[DIAG ERROR]", err);
        res.status(500).json({
            status: "error",
            message: err.message,
            stack: err.stack,
            envKeys: Object.keys(process.env).filter(k => k.includes("TURSO") || k.includes("CLERK"))
        });
    }
}
