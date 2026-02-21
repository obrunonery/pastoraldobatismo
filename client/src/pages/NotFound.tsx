import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 hover:rotate-0 transition-transform">
                <FileQuestion className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-gray-800 mb-2">Ops! 404</h1>
            <p className="text-gray-500 mb-8 max-w-md">
                Parece que a página que você procura tomou o caminho errado. Vamos voltar para o ínicio?
            </p>
            <Link href="/">
                <Button className="bg-[#404e67] hover:bg-[#354054] px-8 py-6 h-auto text-lg rounded-xl shadow-lg border-b-4 border-black/20 transition-all active:border-b-0 active:translate-y-1">
                    Voltar para o Painel da Pastoral
                </Button>
            </Link>
        </div>
    );
}
