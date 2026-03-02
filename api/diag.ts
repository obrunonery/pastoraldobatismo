import { sql } from "drizzle-orm";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { db: database } = await import("../server/db.js");

        const result = await database.select({
            test: sql<number>`1`
        });

        res.status(200).json({
            status: "ok",
            database: "connected",
            result: result[0]
        });

    } catch (err: any) {
        res.status(500).json({
            status: "error",
            message: err.message,
            stack: err.stack
        });
    }
}
