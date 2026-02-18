import { createClerkClient } from "@clerk/backend";
import { Request as ExpressRequest } from "express";
import * as db from "../db";
import * as schema from "../../drizzle/schema";
import { ForbiddenError } from "../../shared/_core/errors";

const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

export class SDKServer {
    /**
     * Autentica uma requisição Express usando o Clerk.
     * Clerk authenticateRequest exige uma URL absoluta no ambiente Node.
     */
    async authenticateRequest(req: ExpressRequest): Promise<typeof schema.users.$inferSelect> {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            console.log("[SDK] No token provided");
            throw ForbiddenError("Token de autenticação ausente");
        }

        try {
            console.log("[SDK] Verifying token with Clerk...");

            // Clerk authenticateRequest exige uma URL absoluta no ambiente Node.
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:5000';

            // Usamos originalUrl para garantir o path completo desde a raiz /api/trpc
            let path = req.originalUrl || req.url;
            if (!path.startsWith('/')) path = '/' + path;

            const fullUrl = `${protocol}://${host}${path}`;
            console.log("[SDK] Auth Request:", path);

            // Simulamos o objeto Request que o Clerk espera (padrão Web standard)
            const clerkRequest = new Request(fullUrl, {
                headers: new Headers(req.headers as any),
                method: req.method,
            });

            // Verifica o token com o Clerk usando o objeto Request absoluto
            const verifiedToken = await clerk.authenticateRequest(clerkRequest, {
                jwtKey: process.env.CLERK_JWT_KEY,
            });

            if (!verifiedToken.isSignedIn) {
                console.log("[SDK] Clerk session invalid");
                throw ForbiddenError("Sessão inválida");
            }

            const clerkUserId = verifiedToken.toAuth().userId!;
            console.log("[SDK] User identified:", clerkUserId);

            // Busca ou cria o usuário no nosso banco para manter as roles (ADMIN/MEMBER)
            let user = await db.getUserByClerkId(clerkUserId);
            console.log("[SDK] User in DB:", !!user);

            if (!user) {
                console.log("[SDK] User not found in local DB, fetching from Clerk...");
                // Se não existir, buscamos os detalhes no Clerk e sincronizamos
                const clerkUser = await clerk.users.getUser(clerkUserId);

                await db.upsertUser({
                    id: clerkUserId,
                    name: clerkUser.fullName || clerkUser.username || "Usuário",
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                });

                user = await db.getUserByClerkId(clerkUserId);
            }

            if (!user) {
                throw ForbiddenError("Erro ao sincronizar usuário");
            }

            return user;
        } catch (error) {
            console.error("[Auth] Erro na autenticação Clerk:", error);
            throw ForbiddenError("Falha na autenticação");
        }
    }
}

export const sdk = new SDKServer();
