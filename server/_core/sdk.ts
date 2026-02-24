import { createClerkClient } from "@clerk/backend";
import { Request as ExpressRequest } from "express";
import * as db from "../db.js";
import * as schema from "../../drizzle/schema.js";
import { ForbiddenError } from "../../shared/_core/errors.js";

if (!process.env.CLERK_SECRET_KEY) {
    console.error("[SDK] CRITICAL: CLERK_SECRET_KEY is missing!");
}

const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY || "",
});

export class SDKServer {
    /**
     * Autentica uma requisição Express usando o Clerk.
     * Clerk authenticateRequest exige uma URL absoluta no ambiente Node.
     */
    async authenticateRequest(req: ExpressRequest): Promise<typeof schema.users.$inferSelect> {
        // Usando cast para any para garantir acesso às propriedades do Express que o TS está perdendo
        const request = req as any;
        const authHeader = request.headers?.authorization;
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            console.log("[SDK] No token provided");
            throw ForbiddenError("Token de autenticação ausente");
        }

        try {
            console.log("[SDK] Verifying token with Clerk...");

            // Clerk authenticateRequest exige uma URL absoluta no ambiente Node.
            const protocol = request.headers?.['x-forwarded-proto'] || 'http';
            const host = request.headers?.host || 'localhost:5000';

            // Usamos originalUrl para garantir o path completo desde a raiz /api/trpc
            let path = request.originalUrl || request.url || "/";
            if (!path.startsWith('/')) path = '/' + path;

            const fullUrl = `${protocol}://${host}${path}`;
            console.log("[SDK] Auth Request:", path);

            // In standard Node 18+ (Vercel), Request and Headers are global.
            // We use the global constructors to create a Request object for Clerk.
            const RequestConstructor = globalThis.Request;
            const HeadersConstructor = globalThis.Headers;

            if (!RequestConstructor || !HeadersConstructor) {
                console.error("[SDK] CRITICAL: Global Request or Headers missing! Node version:", process.version);
                throw new Error("Ambiente incompatível: Request ou Headers não encontrados.");
            }

            const clerkRequest = new RequestConstructor(fullUrl, {
                headers: new HeadersConstructor(request.headers as any),
                method: request.method || "GET",
            });

            // Verifica o token com o Clerk usando o objeto Request absoluto
            const verifiedToken = await clerk.authenticateRequest(clerkRequest);

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
