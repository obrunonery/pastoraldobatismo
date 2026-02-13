import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Baby, FileCheck, AlertCircle, Calendar, User, Users, ChevronRight, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const statusColors = {
    awaiting_documentation: "bg-stats-orange/10 text-stats-orange border-stats-orange/20",
    completed: "bg-stats-green/10 text-stats-green border-stats-green/20",
    scheduled: "bg-stats-cyan/10 text-stats-cyan border-stats-cyan/20",
};

const statusLabels = {
    awaiting_documentation: "Aguardando Doc.",
    completed: "Realizado",
    scheduled: "Agendado",
};

export default function Baptisms() {
    const { isSecretary } = useRole();
    const { data: baptismsResponse, isLoading } = trpc.baptism.list.useQuery();
    const baptisms = Array.isArray(baptismsResponse) ? baptismsResponse : [];

    const counts = {
        total: baptisms.length,
        pending: baptisms.filter((b: any) => b.status === "awaiting_documentation" || !b.documentationComplete).length,
        completed: baptisms.filter((b: any) => b.status === "completed").length,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Batismos</h1>
                    <p className="text-slate-600 mt-1">Gerenciamento do ciclo de vida dos batismos</p>
                </div>
                {isSecretary && (
                    <Button className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
                        <Plus size={18} />
                        Novo Batismo
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-cyan"></div>
                </div>
            )}

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Registros", value: counts.total, icon: Baby, color: "bg-stats-cyan" },
                    { label: "Pendências de Doc.", value: counts.pending, icon: AlertCircle, color: "bg-stats-orange" },
                    { label: "Concluídos", value: counts.completed, icon: FileCheck, color: "bg-stats-green" }
                ].map((item, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden group">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{item.label}</p>
                                <h3 className="text-3xl font-black text-gray-800">{item.value}</h3>
                            </div>
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner transition-transform group-hover:rotate-6", item.color)}>
                                <item.icon size={24} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-md border-none">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6">
                    <CardTitle className="text-lg font-bold text-gray-700">Listagem Geral</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input className="pl-9 h-9 rounded-full bg-gray-50 border-none text-xs" placeholder="Buscar por nome da criança..." />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {baptisms.length > 0 ? (
                            baptisms.map((baptism: any) => (
                                <div key={baptism.id} className="p-6 hover:bg-gray-50/50 transition-all group">
                                    <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                                        {/* Primary Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-800 truncate">{baptism.childName}</h3>
                                                <Badge className={cn("text-[10px] font-bold border", statusColors[baptism.status as keyof typeof statusColors])}>
                                                    {statusLabels[baptism.status as keyof typeof statusLabels]}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><User size={12} /> Pais: {baptism.parentNames || "-"}</span>
                                                <span className="flex items-center gap-1"><Users size={12} /> Padrinhos: {baptism.godparentsNames || "-"}</span>
                                            </div>
                                        </div>

                                        {/* Date & Team */}
                                        <div className="flex flex-wrap gap-4 text-xs">
                                            <div className="bg-white border shadow-sm rounded-xl p-3 flex items-center gap-3">
                                                <Calendar className="text-stats-cyan h-5 w-5" />
                                                <div>
                                                    <p className="text-gray-400 font-bold uppercase text-[9px]">Data Prevista</p>
                                                    <p className="text-gray-800 font-black">{formatDate(baptism.scheduledDate)}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white border shadow-sm rounded-xl p-3 flex items-center gap-3 pr-6">
                                                <FileCheck className={cn("h-5 w-5", baptism.documentationComplete ? "text-stats-green" : "text-stats-orange")} />
                                                <div>
                                                    <p className="text-gray-400 font-bold uppercase text-[9px]">Documentação</p>
                                                    <p className={cn("font-black", baptism.documentationComplete ? "text-stats-green" : "text-stats-orange")}>
                                                        {baptism.documentationComplete ? "COMPLETA" : "PENDENTE"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="ghost" size="icon" className="hidden lg:flex text-gray-300 group-hover:text-stats-cyan">
                                            <ChevronRight size={24} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <Baby size={64} className="mx-auto text-gray-100 mb-4" />
                                <p className="text-gray-400 font-bold">Nenhum batismo registrado no sistema.</p>
                                <Button variant="link" className="text-stats-cyan font-bold mt-2">Adicionar o primeiro registro</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
