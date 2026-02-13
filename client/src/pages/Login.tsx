import { Button } from "@/components/ui/button";
import { SignIn } from "@clerk/clerk-react";
import { useState } from "react";

export default function Login() {
    const [showClerk, setShowClerk] = useState(false);

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000"
                style={{
                    backgroundImage: 'url("/background-login.jpg")',
                    filter: 'brightness(0.4) contrast(1.1)'
                }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 bg-black/40" />

            <div className="relative z-20 flex flex-col items-center text-center p-6 max-w-2xl w-full">
                {!showClerk ? (
                    <div className="animate-in fade-in zoom-in duration-700 space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-stats-cyan/20 p-6 rounded-full backdrop-blur-md border border-white/10">
                                <img src="/dove.png" alt="Pastoral do Batismo" className="w-24 h-24 object-contain" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                                Gerenciamento <br />
                                <span className="text-stats-cyan">Pastoral do Batismo</span>
                            </h1>
                            <p className="text-xl md:text-2xl font-bold text-white/80 tracking-tight">
                                Paróquia São João Paulo II
                            </p>
                        </div>

                        <div className="pt-8">
                            <Button
                                onClick={() => setShowClerk(true)}
                                className="h-16 px-12 text-xl font-black rounded-2xl bg-gradient-to-r from-stats-cyan to-blue-600 hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] border-none uppercase"
                            >
                                FAZER LOGIN
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 w-full flex flex-col items-center">
                        <SignIn
                            afterSignInUrl="/"
                            appearance={{
                                elements: {
                                    card: "bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl",
                                    headerTitle: "text-2xl font-black text-slate-800",
                                    headerSubtitle: "text-slate-500 font-medium",
                                    socialButtonsBlockButton: "border-gray-100 hover:bg-gray-50 rounded-xl",
                                    formButtonPrimary: "bg-stats-cyan hover:bg-stats-cyan/90 text-white font-bold rounded-xl h-11 uppercase",
                                    footerActionLink: "text-stats-cyan hover:text-stats-cyan/80 font-bold"
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
                    2026 | Pastoral do Batismo - Paróquia SJPII
                </p>
            </div>
        </div>
    );
}
