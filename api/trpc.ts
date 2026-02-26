import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { appRouter: router } = await import("../server/routers.js");
        const { createContext: context } = await import("../server/_core/context.js");

        // Vercel Request/Response are mostly compatible with Express
        return (createExpressMiddleware({
            router,
            createContext: context,
            onError({ error, path }) {
                console.error(`[tRPC Error] Path: ${path}`, error);
            },
        }) as any)(req as any, res as any, () => { });
    } catch (err: any) {
        console.error("[TRPC BUNDLE/IMPORT ERROR]", err);
        (res as any).status(500).json({
            error: true,
            message: "Falha ao carregar o roteador do servidor",
            details: err.message,
        });
    }
}
