import { z } from "zod";
// import { notifyOwner } from "./notification"; // Será migrado depois
import { adminProcedure, publicProcedure, router } from "./trpc.js";

export const systemRouter = router({
    health: publicProcedure
        .input(
            z.object({
                timestamp: z.number().min(0, "timestamp cannot be negative"),
            })
        )
        .query(() => ({
            ok: true,
        })),

    notifyOwner: adminProcedure
        .input(
            z.object({
                title: z.string().min(1, "title is required"),
                content: z.string().min(1, "content is required"),
            })
        )
        .mutation(async ({ input }) => {
            // Por enquanto, apenas loga. Migraremos notification.ts depois.
            console.log(`[Notification] Title: ${input.title}, Content: ${input.content}`);
            return {
                success: true,
            } as const;
        }),
});
