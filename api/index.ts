console.log("[VERCEL] api/index.ts loading...");
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sql } from "drizzle-orm";
// import { appRouter } from "../server/routers";
// import { createContext } from "../server/_core/context";

// App Express exportado como serverless function para o Vercel
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC API
app.use(
    "/api/trpc",
    async (req, res, next) => {
        try {
            const { appRouter: router } = await import("../server/routers");
            const { createContext: context } = await import("../server/_core/context");
            return createExpressMiddleware({
                router,
                createContext: context,
                onError({ error, path }) {
                    console.error(`[tRPC Error] Path: ${path}`, error);
                },
            })(req, res, next);
        } catch (err: any) {
            console.error("[TRPC BUNDLE/IMPORT ERROR]", err);
            res.status(500).json({
                error: true,
                message: "Falha ao carregar o roteador do servidor",
                details: err.message,
                stack: process.env.NODE_ENV === "development" ? err.stack : undefined
            });
        }
    }
);

// Ultra-minimal Diagnostic (No DB, No Auth)
app.get("/api/minimal-diag", (_req, res) => {
    res.json({
        status: "ok",
        message: "Express is running",
        node: process.version,
        time: new Date().toISOString()
    });
});

// Diagnostic Endpoint
app.get("/api/diag", async (_req, res) => {
    try {
        const { db: database } = await import("../server/db");
        // Test basic query
        const result = await database.execute(sql`SELECT 1 as test`);
        res.json({
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
});

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
});

// Global Error Handler (CRITICAL for Vercel JSON responses)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[VERCEL GLOBAL ERROR]");
    console.error(err);

    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        error: true,
        message: err.message || "Internal Server Error",
        code: err.code || "INTERNAL_ERROR",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export default app;
