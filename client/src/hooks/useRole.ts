import { useUser } from "@clerk/clerk-react";
import { trpc } from "@/lib/trpc";

export function useRole() {
    const { user, isLoaded } = useUser();

    const { data: profile, isLoading: isQueryLoading } = trpc.auth.getProfile.useQuery(
        { id: user?.id || "" },
        { enabled: !!user?.id }
    );

    // Fallback de Role baseado no email para evitar bloqueio por sincronização
    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    const isAdminEmail = userEmail === "lbrunonery@gmail.com";

    const role = profile?.role || (isAdminEmail ? "ADMIN" : "MEMBER");

    // Consideramos carregando apenas se o Clerk não carregou OU 
    // se o perfil não existe E a query ainda está rodando, mas com um limite
    const isLoading = !isLoaded || (isQueryLoading && !profile && !isAdminEmail);

    if (isLoaded) {
        console.log("[useRole] State:", {
            clerkLoaded: isLoaded,
            queryLoading: isQueryLoading,
            hasProfile: !!profile,
            isAdminEmail,
            finalIsLoading: isLoading,
            finalRole: role,
            userId: user?.id
        });
    }

    return {
        role,
        isAdmin: role === "ADMIN",
        isSecretary: role === "SECRETARY" || role === "ADMIN",
        isFinance: role === "FINANCE" || role === "ADMIN",
        isMember: role === "MEMBER",
        isLoading,
        user
    };
}
