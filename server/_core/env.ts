export const ENV = {
    appId: process.env.VITE_APP_ID ?? "",
    cookieSecret: process.env.JWT_SECRET ?? "",
    databaseUrl: process.env.TURSO_URL ?? "",
    // Variáveis do Clerk (Adicionadas para o novo fluxo)
    clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY ?? "",
    // Mantendo compatibilidade com o que o usuário enviou
    isProduction: process.env.NODE_ENV === "production",
    forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
    forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
