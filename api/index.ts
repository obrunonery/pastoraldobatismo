import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

// App Express exportado como serverless function para o Vercel
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC API
app.use(
    "/api/trpc",
    createExpressMiddleware({
        router: appRouter,
        createContext,
    })
);

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
