import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '../../shared/const.js';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context.js";

const t = initTRPC.context<TrpcContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error, ctx, path, type }) {
        if (error.code === 'INTERNAL_SERVER_ERROR') {
            const cause = error.cause as any;
            const stack = (cause?.stack || error.stack || '').split('\n').slice(0, 5).join(' | ');
            console.error(`[tRPC INTERNAL ERROR] ${JSON.stringify({ path, type, message: error.message, causeMsg: cause?.message, stack })}`);
        }
        return shape;
    },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
        const authErrorMsg = ctx.req.authError ? `AuthError: ${ctx.req.authError.message}` : UNAUTHED_ERR_MSG;
        throw new TRPCError({ code: "UNAUTHORIZED", message: authErrorMsg });
    }

    return next({
        ctx: {
            ...ctx,
            user: ctx.user,
        },
    });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
    t.middleware(async opts => {
        const { ctx, next } = opts;

        if (!ctx.user || ctx.user.role !== 'ADMIN') { // Adaptado para o enum ["ADMIN", "MEMBER"] do novo schema
            throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
        }

        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
            },
        });
    }),
);
