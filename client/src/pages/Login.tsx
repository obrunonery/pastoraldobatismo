import { useSignIn } from "@clerk/clerk-react";
import { useState } from "react";
import { ChevronRight, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
    const { signIn, isLoaded } = useSignIn();
    const [step, setStep] = useState<"initial" | "email" | "password">("initial");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleLogin = async () => {
        if (!isLoaded) return;
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err: any) {
            setError("Erro ao conectar com o Google. Tente novamente.");
        }
    };

    const handleEmailContinue = async () => {
        if (!email) return;
        setError("");
        setStep("password");
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || !email || !password) return;
        setLoading(true);
        setError("");
        try {
            const result = await signIn.create({ identifier: email, password });
            if (result.status === "complete") {
                window.location.href = "/";
            }
        } catch (err: any) {
            const msg = err?.errors?.[0]?.message;
            if (msg?.includes("password")) {
                setError("Senha incorreta. Tente novamente.");
            } else if (msg?.includes("identifier")) {
                setError("E-mail não encontrado. Verifique e tente novamente.");
            } else {
                setError(msg || "Erro ao fazer login. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative"
            style={{
                backgroundColor: "#f0f2f5",
                backgroundImage: 'url("/login-bg-pattern.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Overlay para suavizar o padrão */}
            <div className="absolute inset-0 bg-[#f0f2f5]/70 pointer-events-none" />
            <div className="relative z-10 max-w-6xl w-full bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white flex flex-col lg:flex-row overflow-hidden min-h-[600px]">

                {/* Lado Esquerdo: Formulário */}
                <div className="flex-1 p-8 sm:p-16 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50">
                    <div className="space-y-10">
                        {/* Marca */}
                        <div className="inline-block">
                            <div className="flex flex-col leading-none">
                                <span className="text-xl sm:text-2xl font-light text-stats-cyan tracking-wide">
                                    Pastoral do
                                </span>
                                <h1 className="text-5xl sm:text-6xl font-black text-slate-800 tracking-tight uppercase -mt-1">
                                    BATISMO
                                </h1>
                            </div>
                            <div className="w-14 h-1 bg-stats-cyan rounded-full mt-3" />
                        </div>

                        {/* Formulário customizado */}
                        <div className="space-y-6 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                                    Bem-vindo(a) à área <br />
                                    <span className="text-stats-cyan">administrativa.</span>
                                </h2>
                                <p className="text-slate-400 text-sm font-medium pt-1">
                                    Gerencie batismos, reuniões e eventos da Pastoral do Batismo com uma ferramenta moderna e eficiente.
                                </p>
                            </div>

                            {/* Botão Google */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full h-13 px-6 py-3.5 border border-slate-100 bg-white hover:bg-slate-50 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                                    Continuar com o Google
                                </span>
                            </button>

                            {/* Divisor */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">ou</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            {/* Formulário E-mail / Senha */}
                            <form onSubmit={step === "password" ? handleSignIn : (e) => { e.preventDefault(); handleEmailContinue(); }} className="space-y-4">
                                {/* Campo E-mail */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                                        <Mail size={10} />
                                        Endereço de e-mail
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                            placeholder="seuemail@exemplo.com"
                                            required
                                            readOnly={step === "password"}
                                            className="w-full h-12 px-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-stats-cyan/20 focus:border-stats-cyan/40 transition-all read-only:opacity-60 read-only:cursor-not-allowed"
                                        />
                                        {step === "password" && (
                                            <button
                                                type="button"
                                                onClick={() => { setStep("email"); setPassword(""); setError(""); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-stats-cyan tracking-widest hover:underline"
                                            >
                                                Alterar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Campo Senha */}
                                {step === "password" && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                                            <Lock size={10} />
                                            Senha
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPass ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                                placeholder="••••••••"
                                                required
                                                autoFocus
                                                className="w-full h-12 px-4 pr-12 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-stats-cyan/20 focus:border-stats-cyan/40 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(!showPass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                            >
                                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Erro */}
                                {error && (
                                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl animate-in fade-in duration-300">
                                        <AlertCircle size={14} />
                                        <span className="text-xs font-bold">{error}</span>
                                    </div>
                                )}

                                {/* Botão */}
                                <button
                                    type="submit"
                                    disabled={loading || !isLoaded}
                                    className="w-full h-12 bg-stats-cyan text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-stats-cyan/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {step === "email" ? "Continuar" : "Entrar no Sistema"}
                                            <ChevronRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Rodapé */}
                    <div className="pt-12 text-slate-300">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em]">
                            © 2026 • Paróquia São João Paulo II
                        </p>
                    </div>
                </div>

                {/* Lado Direito: Imagem de Impacto */}
                <div className="hidden lg:block flex-1 relative p-6">
                    <div
                        className="w-full h-full rounded-[32px] overflow-hidden bg-center bg-cover shadow-2xl relative"
                        style={{ backgroundImage: 'url("/background-login.jpg")' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/20" />
                        <div className="absolute bottom-12 left-12 right-12 text-white">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[24px] space-y-4">
                                <div className="w-12 h-1 bg-stats-cyan rounded-full" />
                                <h3 className="text-2xl font-black tracking-tight leading-tight">
                                    "A serviço da vida através do Batismo."
                                </h3>
                                <p className="text-white/70 text-sm font-medium leading-relaxed italic">
                                    Organizando com amor o início da caminhada cristã.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
