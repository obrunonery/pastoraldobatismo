import NotFound from "@/pages/NotFound";
import Home from "./pages/Home";
import Agenda from "./pages/Agenda";
import Baptisms from "./pages/Baptisms";
import Requests from "./pages/Requests";
import Meetings from "./pages/Meetings";
import Members from "./pages/Members";
import Formation from "./pages/Formation";
import Finance from "./pages/Finance";
import Events from "./pages/Events";
import Communication from "./pages/Communication";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
    SignedIn,
    SignedOut,
    SignIn,
    SignUp,
    useUser
} from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { trpc } from "@/lib/trpc";

// Fallback UI para o Error Boundary
function ErrorFallback({ error }: { error: Error }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Ops! Algo deu errado</h2>
                <p className="text-slate-600 mb-6 text-sm">
                    O aplicativo encontrou um erro inesperado. Tente recarregar a página.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 overflow-auto max-h-40">
                    <code className="text-[10px] text-red-500 font-mono break-all">
                        {error.message}
                    </code>
                </div>
                <Button
                    onClick={() => window.location.reload()}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl h-12"
                >
                    RECARREGAR PÁGINA
                </Button>
            </div>
        </div>
    );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}

const ThemeProvider = ({ children }: { children: React.ReactNode, defaultTheme?: string }) => <div className="min-h-screen bg-[#f6f7fb]">{children}</div>;

function Router() {
    console.log("[Router] Rendering routes...");
    return (
        <DashboardLayout>
            <Switch>
                <Route path="/" component={Home} />
                <Route path="/agenda" component={Agenda} />
                <Route path="/baptisms" component={Baptisms} />
                <Route path="/requests" component={Requests} />
                <Route path="/finance" component={Finance} />
                <Route path="/meetings" component={Meetings} />
                <Route path="/formation" component={Formation} />
                <Route path="/events" component={Events} />
                <Route path="/members" component={Members} />
                <Route path="/communication" component={Communication} />
                <Route path="/sign-in">
                    <div className="flex items-center justify-center min-h-screen">
                        <SignIn routing="path" path="/sign-in" />
                    </div>
                </Route>
                <Route path="/sign-up">
                    <div className="flex items-center justify-center min-h-screen">
                        <SignUp routing="path" path="/sign-up" />
                    </div>
                </Route>
                <Route component={NotFound} />
            </Switch>
        </DashboardLayout>
    );
}

function App() {
    const { user, isLoaded } = useUser();
    const utils = trpc.useUtils();
    const syncUser = trpc.auth.syncUser.useMutation({
        onSuccess: () => {
            console.log("[App] Sync success, invalidating profile...");
            utils.auth.getProfile.invalidate();
        },
        onError: (err) => {
            console.error("[App] Sync failed:", err);
        }
    });

    useEffect(() => {
        // Só sincroniza se estiver carregado, tiver usuário e NÃO estiver pendente nem tiver tido erro/sucesso nessa sessão
        if (isLoaded && user && !syncUser.isPending && !syncUser.isSuccess && !syncUser.isError) {
            console.log("[App] Effect: Syncing user data for", user.id);
            syncUser.mutate({
                id: user.id,
                name: user.fullName || user.username || "Usuário",
                email: user.primaryEmailAddress?.emailAddress || "",
            });
        }
    }, [isLoaded, user, syncUser.isPending, syncUser.isSuccess, syncUser.isError]);

    console.log("[App] Rendering state:", { isLoaded, isSignedIn: !!user });

    return (
        <ErrorBoundary>
            <ThemeProvider defaultTheme="light">
                <TooltipProvider>
                    <Toaster position="top-center" />
                    <SignedIn>
                        <Router />
                    </SignedIn>
                    <SignedOut>
                        <Switch>
                            <Route path="/login" component={Login} />
                            <Route>
                                <Login />
                            </Route>
                        </Switch>
                    </SignedOut>
                </TooltipProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
