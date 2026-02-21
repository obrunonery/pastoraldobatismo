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
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                description: z.string().optional(),
                value: z.number().optional(),
                type: z.enum(["entrada", "saída"]).optional(),
                category: z.string().optional(),
                date: z.string().optional(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return await db.updateTransaction(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteTransaction(input.id);
            }),
    }),

    // Agenda Router (Eventos Gerais)
    agenda: router({
        list: protectedProcedure.query(async () => {
            return await db.listAllAgendaItems();
        }),
        create: protectedProcedure
            .input(z.object({
                title: z.string(),
                date: z.string(),
                time: z.string().optional(),
                location: z.string().optional(),
                description: z.string().optional(),
            }))
            .mutation(async ({ input }) => {
                return await db.createGeneralEvent(input);
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                title: z.string().optional(),
                date: z.string().optional(),
                time: z.string().optional(),
                location: z.string().optional(),
                description: z.string().optional(),
                status: z.string().optional(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return await db.updateGeneralEvent(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteGeneralEvent(input.id);
            }),
    }),

    // Batismo Router
    baptism: router({
        list: protectedProcedure.query(async () => {
            return await db.listBaptisms();
        }),
        create: protectedProcedure
            .input(z.object({
                childName: z.string().nullish(),
                parentNames: z.string().nullish(),
                godparentsNames: z.string().nullish(),
                status: z.enum(["Solicitado", "Em Triagem", "Agendado", "Concluído"]),
                date: z.string().nullish(),
                scheduledDate: z.string().nullish(),
                celebrantId: z.string().nullish(),
                courseDone: z.boolean().optional(),
                docsOk: z.boolean().optional(),
                observations: z.string().nullish(),
                gender: z.enum(["m", "f"]).nullish(),
                age: z.number().nullish(),
                city: z.string().nullish(),
            }))
            .mutation(async ({ input }) => {
                console.log("[SERVER] Creating baptism with input:", input);
                return await db.createBaptism(input);
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                childName: z.string().nullish(),
                parentNames: z.string().nullish(),
                godparentsNames: z.string().nullish(),
                status: z.enum(["Solicitado", "Em Triagem", "Agendado", "Concluído"]).optional(),
                date: z.string().nullish(),
                scheduledDate: z.string().nullish(),
                celebrantId: z.string().nullish(),
                courseDone: z.boolean().optional(),
                docsOk: z.boolean().optional(),
                observations: z.string().nullish(),
                gender: z.enum(["m", "f"]).nullish(),
                age: z.number().nullish(),
                city: z.string().nullish(),
            }))
            .mutation(async ({ input }) => {
                console.log("[SERVER] Updating baptism with input:", input);
                const { id, ...data } = input;
                return await db.updateBaptism(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteBaptism(input.id);
            }),
    }),

    // Reunião Router
    meeting: router({
        list: protectedProcedure.query(async () => {
            return await db.listMeetings();
        }),
        create: protectedProcedure
            .input(z.object({
                meetingDate: z.string(),
                title: z.string().optional().nullable(),
                type: z.string().optional().nullable(),
                responsibleId: z.string().optional().nullable(),
                location: z.string().optional().nullable(),
                meetingTime: z.string().optional().nullable(),
                content: z.string().optional().nullable(),
                fileUrl: z.string().optional().nullable()
            }))
            .mutation(async ({ input, ctx }) => {
                const authorId = ctx.user?.id || "anonymous";
                return await db.createMeeting({ ...input, authorId });
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                meetingDate: z.string().optional().nullable(),
                title: z.string().optional().nullable(),
                type: z.string().optional().nullable(),
                responsibleId: z.string().optional().nullable(),
                location: z.string().optional().nullable(),
                meetingTime: z.string().optional().nullable(),
                content: z.string().optional().nullable(),
                fileUrl: z.string().optional().nullable()
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return await db.updateMeeting(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteMeeting(input.id);
            }),
    }),

    // Evento Router (Geral)
    event: router({
        list: protectedProcedure.query(async () => {
            return await db.listGeneralEvents();
        }),
        create: protectedProcedure
            .input(z.object({
                title: z.string(),
                date: z.string(),
                time: z.string().optional(),
                location: z.string().optional(),
                description: z.string().optional(),
                status: z.string().optional()
            }))
            .mutation(async ({ input }) => {
                return await db.createGeneralEvent(input);
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                title: z.string().optional(),
                date: z.string().optional(),
                time: z.string().optional(),
                location: z.string().optional(),
                description: z.string().optional(),
                status: z.string().optional(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return await db.updateGeneralEvent(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteGeneralEvent(input.id);
            }),
    }),

    // Pedido Router
    request: router({
        list: protectedProcedure.query(async () => {
            return await db.listRequests();
        }),
        create: protectedProcedure
            .input(z.object({
                title: z.string(),
                type: z.string(),
                urgency: z.string(),
                description: z.string().optional(),
            }))
            .mutation(async ({ input, ctx }) => {
                return await db.createRequest({
                    ...input,
                    authorId: ctx.user?.id || "anonymous",
                    status: "Pendente"
                });
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                title: z.string().optional(),
                type: z.string().optional(),
                urgency: z.string().optional(),
                description: z.string().optional(),
                status: z.string().optional(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return await db.updateRequest(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteRequest(input.id);
            }),
    }),

    // Formação Router
    formation: router({
        list: protectedProcedure.query(async () => {
            return await db.listFormations();
        }),
        create: protectedProcedure
            .input(z.object({
                title: z.string(),
                date: z.string(),
                facilitator: z.string().optional(),
                content: z.string().optional(),
                fileUrl: z.string().optional()
            }))
            .mutation(async ({ input }) => {
                return await db.createFormation(input);
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                title: z.string().optional(),
                date: z.string().optional(),
                facilitator: z.string().optional(),
                content: z.string().optional(),
                fileUrl: z.string().optional(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return await db.updateFormation(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteFormation(input.id);
            }),
    }),

    // Dashboard Router
    dashboard: router({
        getSummary: protectedProcedure.query(async () => {
            return await db.getDashboardSummary();
        }),
        getPresenceScale: protectedProcedure.query(async () => {
            return await db.getPresenceScale();
        }),
        updatePresenceStatus: protectedProcedure
            .input(z.object({
                id: z.number(),
                status: z.enum(["confirmado", "ausente", "pendente"]),
            }))
            .mutation(async ({ input }) => {
                return await db.updatePresenceStatus(input.id, input.status);
            }),
        addToScale: protectedProcedure
            .input(z.object({
                baptismId: z.number(),
                userId: z.string(),
                role: z.string().optional()
            }))
            .mutation(async ({ input }) => {
                return await db.addToScale(input.baptismId, input.userId, input.role);
            }),
        removeFromScale: protectedProcedure
            .input(z.object({
                id: z.number()
            }))
            .mutation(async ({ input }) => {
                return await db.removeFromScale(input.id);
            }),
        getEvolutionData: protectedProcedure
            .input(z.object({
                gender: z.string().optional(),
                city: z.string().optional(),
                year: z.string().optional(),
                ageGroup: z.string().optional()
            }).optional())
            .query(async ({ input }) => {
                return await db.getEvolutionData(input);
            }),
        getFinanceBI: protectedProcedure.query(async () => {
            return await db.getFinanceBI();
        }),
        getAnnualGoal: protectedProcedure
            .query(async () => {
                const goal = await db.getConfig("annual_goal", "100");
                return Number(goal);
            }),
        updateAnnualGoal: protectedProcedure
            .input(z.object({ goal: z.number() }))
            .mutation(async ({ input }) => {
                return await db.setConfig("annual_goal", String(input.goal));
            }),
        getUniqueCities: protectedProcedure
            .query(async () => {
                return await db.listUniqueCities();
            }),
    }),

    // Comunicação Router
    communication: router({
        list: protectedProcedure.query(async () => {
            return await db.listCommunications();
        }),
        create: protectedProcedure
            .input(z.object({
                title: z.string(),
                content: z.string(),
                fileUrl: z.string().optional(),
                date: z.string()
            }))
            .mutation(async ({ input, ctx }) => {
                return await db.createCommunication({
                    ...input,
                    authorId: ctx.user?.id || "anonymous"
                });
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.number(),
                title: z.string().optional(),
                content: z.string().optional(),
                fileUrl: z.string().optional(),
                date: z.string().optional()
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                return await db.updateCommunication(id, data);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteCommunication(input.id);
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
                    role: z.enum(["membro", "secretario", "coordenador", "vice_coordenador", "voluntario", "financeiro", "admin", "celebrante"]),
                    email: z.string().optional(),
                    phone: z.string().optional().nullable(),
                    status: z.enum(["ativo", "inativo"]).default("ativo"),
                    address: z.string().optional().nullable(),
                    birthDate: z.string().optional().nullable(),
                    maritalStatus: z.string().optional().nullable(),
                    spouseName: z.string().optional().nullable(),
                    weddingDate: z.string().optional().nullable(),
                    hasChildren: z.boolean().optional(),
                    childrenData: z.string().optional().nullable(),
                    sacraments: z.string().optional().nullable(),
                    photoUrl: z.string().optional().nullable(),
                })
            )
            .mutation(async ({ input }) => {
                const roleMap: Record<string, "ADMIN" | "SECRETARY" | "FINANCE" | "MEMBER" | "COORDENADOR" | "VICE_COORDENADOR" | "CELEBRANTE"> = {
                    "secretario": "SECRETARY",
                    "coordenador": "COORDENADOR",
                    "vice_coordenador": "VICE_COORDENADOR",
                    "financeiro": "FINANCE",
                    "membro": "MEMBER",
                    "voluntario": "MEMBER",
                    "admin": "ADMIN",
                    "celebrante": "CELEBRANTE"
                };
                const dbRole = roleMap[input.role] || "MEMBER";

                return await db.upsertUser({
                    id: `manual_${Date.now()}`,
                    ...input,
                    role: dbRole,
                    email: input.email || "",
                } as any);
            }),
        update: protectedProcedure
            .input(z.object({
                id: z.string(),
                name: z.string().optional(),
                role: z.enum(["membro", "secretario", "coordenador", "vice_coordenador", "voluntario", "financeiro", "admin", "celebrante"]).optional(),
                email: z.string().optional(),
                phone: z.string().optional().nullable(),
                status: z.enum(["ativo", "inativo"]).optional(),
                address: z.string().optional().nullable(),
                birthDate: z.string().optional().nullable(),
                maritalStatus: z.string().optional().nullable(),
                spouseName: z.string().optional().nullable(),
                weddingDate: z.string().optional().nullable(),
                hasChildren: z.boolean().optional(),
                childrenData: z.string().optional().nullable(),
                sacraments: z.string().optional().nullable(),
                photoUrl: z.string().optional().nullable(),
            }))
            .mutation(async ({ input }) => {
                const { id, ...data } = input;
                const updateData: any = { ...data };
                if (data.role) {
                    const roleMap: Record<string, "ADMIN" | "SECRETARY" | "FINANCE" | "MEMBER" | "COORDENADOR" | "VICE_COORDENADOR" | "CELEBRANTE"> = {
                        "secretario": "SECRETARY",
                        "coordenador": "COORDENADOR",
                        "vice_coordenador": "VICE_COORDENADOR",
                        "financeiro": "FINANCE",
                        "membro": "MEMBER",
                        "voluntario": "MEMBER",
                        "admin": "ADMIN",
                        "celebrante": "CELEBRANTE"
                    };
                    updateData.role = roleMap[data.role] || "MEMBER";
                }
                return await db.updateUser(id, updateData);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.string() }))
            .mutation(async ({ input }) => {
                return await db.deleteUser(input.id);
            }),
    }),

    // Uploads Router
    uploads: router({
        list: protectedProcedure.query(async () => {
            return await db.listUploads();
        }),
        create: protectedProcedure
            .input(z.object({
                name: z.string(),
                filename: z.string(),
                url: z.string(),
                category: z.string().optional()
            }))
            .mutation(async ({ input }) => {
                return await db.createUpload(input);
            }),
        delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                return await db.deleteUpload(input.id);
            }),
    }),
});

export type AppRouter = typeof appRouter;
