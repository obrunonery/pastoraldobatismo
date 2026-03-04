import type { Request, Response } from "express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import * as schema from "../../drizzle/schema.js";

// Tipo Inferido do Schema
type User = typeof schema.users.$inferSelect;

export type TrpcContext = {
    req: Request & { authError?: any };
    res: Response;
    user: User | null;
};

export async function createContext(
    opts: CreateExpressContextOptions
): Promise<TrpcContext> {
    let user: User | null = null;

    try {
        const { sdk } = await import("./sdk.js");
        user = await sdk.authenticateRequest(opts.req);
    } catch (error: any) {
        console.error('[CONTEXT ERROR] sdk.authenticateRequest failed:', error?.name, error?.message);
        console.error('[CONTEXT ERROR] Stack:', error?.stack);
        // Retain the error in context to throw a more specific message in TRPC middleware
        opts.req.authError = error;
        user = null;
    }

    return {
        req: opts.req,
        res: opts.res,
        user,
    };
}
