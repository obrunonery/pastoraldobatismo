import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import * as schema from "../../drizzle/schema";

// Tipo Inferido do Schema
type User = typeof schema.users.$inferSelect;

export type TrpcContext = {
    req: CreateExpressContextOptions["req"];
    res: CreateExpressContextOptions["res"];
    user: User | null;
};

export async function createContext(
    opts: CreateExpressContextOptions
): Promise<TrpcContext> {
    let user: User | null = null;

    try {
        const { sdk } = await import("./sdk");
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
