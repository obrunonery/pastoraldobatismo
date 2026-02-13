import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    system: systemRouter,
    auth: router({
        me: publicProcedure.query(opts => opts.ctx.user),
        syncUser: publicProcedure
            .input(z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                phone: z.string().optional(),
            }))
            .mutation(async ({ input }) => {
                return await db.upsertUser({
                    id: input.id,
                    name: input.name,
                    email: input.email,
                    phone: input.phone,
                });
            }),
        getProfile: publicProcedure
            .input(z.object({ id: z.string() }))
            .query(async ({ input }) => {
                const user = await db.getUserByClerkId(input.id);
                if (user) {
                    console.log("[TRPC] Profile found for:", input.id, "(role:", user.role, ")");
                } else {
                    console.log("[TRPC] Profile not found in DB for:", input.id);
                }
                return user;
            }),
        logout: publicProcedure.mutation(({ ctx }) => {
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
            return {
                success: true,
            } as const;
        }),
    }),

    // Finance Router
    finance: router({
        list: protectedProcedure.query(async () => {
            return await db.listTransactions();
        }),
        create: protectedProcedure
            .input(z.object({
                description: z.string().min(1),
                value: z.number(),
                type: z.enum(["entrada", "saída"]),
                category: z.string().optional(),
                date: z.string(),
            }))
            .mutation(async ({ input }) => {
                return await db.createTransaction(input);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteTransaction(input.id);
            }),
    }),

    // Agenda Router
    agenda: router({
        list: protectedProcedure.query(async () => {
            return await db.listAgendaEvents();
        }),
    }),

    // Batismo Router
    baptism: router({
        list: protectedProcedure.query(async () => {
            return await db.listBaptisms();
        }),
    }),

    // Reunião Router
    meeting: router({
        list: protectedProcedure.query(async () => {
            return await db.listMeetings();
        }),
    }),

    // Evento Router
    event: router({
        list: protectedProcedure.query(async () => {
            return [];
        }),
    }),

    // Checklist Router
    checklist: router({
        list: protectedProcedure.query(async () => {
            return [];
        }),
    }),

    // Pedido Router
    request: router({
        list: protectedProcedure.query(async () => {
            return [];
        }),
    }),

    // Formação Router
    formation: router({
        list: protectedProcedure.query(async () => {
            return [];
        }),
    }),

    // Comunicação Router
    communication: router({
        list: protectedProcedure.query(async () => {
            return [];
        }),
    }),

    // Pastoral Members Router
    pastoralMembers: router({
        list: protectedProcedure.query(async () => {
            return await db.listPastoralMembers();
        }),
        create: protectedProcedure
            .input(
                z.object({
                    name: z.string().min(1),
                    role: z.enum(["celebrante", "membro", "secretario", "coordenador", "voluntario"]),
                    email: z.string().email().optional(),
                    phone: z.string().optional(),
                    status: z.enum(["ativo", "inativo"]),
                })
            )
            .mutation(async ({ input }) => {
                return await db.upsertUser({
                    id: `manual_${Date.now()}`,
                    name: input.name,
                    email: input.email || "",
                    role: "MEMBER",
                    phone: input.phone,
                });
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.string(),
                name: z.string().optional(),
                role: z.enum(["celebrante", "membro", "secretario", "coordenador", "voluntario", "financeiro"]).optional(),
                email: z.string().email().optional(),
                phone: z.string().optional(),
                status: z.enum(["ativo", "inativo"]).optional(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                const updateData: any = { ...data };
                if (data.role) {
                    if (data.role === "financeiro") updateData.role = "FINANCE";
                    else if (data.role === "secretario") updateData.role = "SECRETARY";
                    else if (data.role === "membro") updateData.role = "MEMBER";
                    else updateData.role = data.role.toUpperCase();
                }
                return await db.updateUser(id, updateData);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return await db.deleteUser(input.id);
            }),
    }),
});

export type AppRouter = typeof appRouter;
