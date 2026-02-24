import type { Request, Response } from "express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import * as schema from "../../drizzle/schema.js";

// Tipo Inferido do Schema
type User = typeof schema.users.$inferSelect;

export type TrpcContext = {
    req: Request;
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
    } catch (error) {
        user = null;
    }

    return {
        req: opts.req,
        res: opts.res,
        user,
    };
}
