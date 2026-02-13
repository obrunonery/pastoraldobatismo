import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, FileText, Download, ChevronRight, PlayCircle, Lightbulb, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export default function Formation() {
    const { isAdmin } = useRole();
    const { data: formationsResponse, isLoading } = trpc.formation.list.useQuery();
    const formations = Array.isArray(formationsResponse) ? formationsResponse : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Formação</h1>
                    <p className="text-slate-600 mt-1">Biblioteca de conhecimento e capacitação</p>
                </div>
                {isAdmin && (
                    <Button className="gap-2 bg-stats-green hover:bg-stats-green/90 shadow-md transform active:scale-95 transition-all">
                        <Plus size={18} />
                        Novo Tema
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-green"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formations.map((formation: any) => (
                    <Card key={formation.id} className="border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white">
                        <div className="h-32 bg-gradient-to-br from-stats-green/20 to-stats-cyan/20 flex items-center justify-center relative">
                            <BookOpen size={48} className="text-white/40 absolute group-hover:scale-110 transition-transform" />
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-white/80 text-stats-green backdrop-blur-sm border-none font-black text-[10px]">
                                    {formatDate(formation.studyDate)}
                                </Badge>
                            </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-stats-green transition-colors">
                                    {formation.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium line-clamp-3 leading-relaxed">
                                    {formation.description || "Sem descrição disponível para este tema de formação."}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User size={12} />
                                </div>
                                {formation.facilitator || "Convidado Especial"}
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button className="flex-1 bg-gray-50 hover:bg-stats-green/10 text-gray-600 hover:text-stats-green border-none shadow-none text-[10px] font-black uppercase tracking-widest gap-2">
                                    <PlayCircle size={14} /> ESTUDAR
                                </Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-gray-100 text-gray-400 hover:text-stats-cyan">
                                    <Download size={14} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {formations.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl opacity-50 border-2 border-dashed border-gray-100">
                        <Lightbulb size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-400 font-bold">Nenhum tema de formação disponível.</p>
                    </div>
                )}
            </div>

            <Card className="border-none shadow-lg bg-[#404e67] text-white">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-stats-orange rounded-3xl flex items-center justify-center shrink-0 rotate-3 shadow-xl">
                        <FileText size={40} className="text-white" />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-2xl font-black italic">Repositório de Documentos</h4>
                        <p className="text-white/60 text-sm font-medium">Acesse manuais, rituais e orientações da CNBB e da Diocese em um só lugar.</p>
                    </div>
                    <Button className="md:ml-auto bg-white text-[#404e67] hover:bg-stats-orange hover:text-white font-black px-8 py-6 h-auto rounded-2xl shadow-lg transition-all active:translate-y-1">
                        ACESSAR ARQUIVOS
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
