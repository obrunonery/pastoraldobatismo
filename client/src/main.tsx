import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ptBR } from "@clerk/localizations";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import React, { useMemo } from "react";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
    if (!(error instanceof TRPCClientError)) return;
    if (typeof window === "undefined") return;

    const isUnauthorized = error.message === UNAUTHED_ERR_MSG || error.data?.code === "UNAUTHORIZED" || error.data?.httpStatus === 403;

    if (!isUnauthorized) return;

    window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") {
        const error = event.query.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Query Error]", error);
    }
});

if (typeof window !== "undefined") {
    window.onerror = (message, source, lineno, colno, error) => {
        console.error("[Global Error]", { message, source, lineno, colno, error });
    };
    window.onunhandledrejection = (event) => {
        console.error("[Unhandled Promise Rejection]", event.reason);
    };
}

queryClient.getMutationCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") {
        const error = event.mutation.state.error;
        redirectToLoginIfUnauthorized(error);
        console.error("[API Mutation Error]", error);
    }
});

function TRPCProvider({ children }: { children: React.ReactNode }) {
    const { getToken } = useAuth();

    const trpcClient = useMemo(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: "/api/trpc",
                transformer: superjson as any,
                async headers() {
                    const token = await getToken();
                    return {
                        Authorization: token ? `Bearer ${token}` : undefined,
                    };
                },
            }),
        ],
    }), [getToken]);

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            {children}
        </trpc.Provider>
    );
}

createRoot(document.getElementById("root")!).render(
    <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        localization={ptBR}
    >
        <TRPCProvider>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </TRPCProvider>
    </ClerkProvider>
);
