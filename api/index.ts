import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import type { Request, Response } from "express";

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

// Rota de health check
app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
});

export default app;
