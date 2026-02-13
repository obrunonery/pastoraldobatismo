import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Lightbulb, AlertCircle, ShoppingCart, CheckCircle2, Search, ArrowUpRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const typeColors = {
    request: "bg-stats-cyan/10 text-stats-cyan border-stats-cyan/20",
    idea: "bg-stats-pink/10 text-stats-pink border-stats-pink/20",
    purchase: "bg-stats-green/10 text-stats-green border-stats-green/20",
    task: "bg-stats-orange/10 text-stats-orange border-stats-orange/20",
};

const typeLabels = {
    request: "📋 Pedido",
    idea: "💡 Ideia",
    purchase: "🛍️ Compra",
    task: "✓ Tarefa",
};

const urgencyColors = {
    low: "bg-emerald-50 text-emerald-600 border-emerald-100",
    medium: "bg-amber-50 text-amber-600 border-amber-100",
    high: "bg-rose-50 text-rose-600 border-rose-100",
};

const urgencyLabels = {
    low: "🟢 Baixa",
    medium: "🟡 Média",
    high: "🔴 Alta",
};

export default function Requests() {
    const { isSecretary } = useRole();
    const { data: requestsResponse, isLoading } = trpc.request.list.useQuery();
    const requests = Array.isArray(requestsResponse) ? requestsResponse : [];
    const [filterType, setFilterType] = useState<string>("all");

    const filteredRequests = filterType === "all"
        ? requests
        : requests.filter((r: any) => r.type === filterType);

    const stats = {
        total: requests.length,
        open: requests.filter((r: any) => r.status !== 'completed').length,
        completed: requests.filter((r: any) => r.status === 'completed').length,
    };

    const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Solicitações & Tarefas</h1>
                    <p className="text-slate-600 mt-1">Gestão de pendências e melhorias</p>
                </div>
                {isSecretary && (
                    <Button className="gap-2 bg-stats-pink hover:bg-stats-pink/90">
                        <Plus size={18} />
                        Nova Solicitação
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-pink"></div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-[#404e67] to-[#354054] text-white">
                        <CardContent className="p-6">
                            <p className="text-white/60 text-xs font-bold uppercase mb-4 tracking-widest">Progresso Geral</p>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-black">{Math.round(progress)}%</span>
                                <span className="text-xs text-white/50">CONCLUÍDO</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-stats-green h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="mt-4 flex justify-between text-[10px] font-bold text-white/40">
                                <span>{stats.completed} TAREFAS OK</span>
                                <span>{stats.open} PENDENTES</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Filtros de Tipo</p>
                        {Object.entries(typeLabels).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setFilterType(filterType === key ? "all" : key)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border-2 transition-all font-bold text-xs",
                                    filterType === key ? "border-stats-cyan bg-white shadow-sm" : "border-transparent bg-gray-100/50 text-gray-500 border-gray-100"
                                )}
                            >
                                {label}
                                <Badge variant="secondary" className="bg-gray-200 text-gray-600 h-5 min-w-[20px] px-1">{requests.filter(r => r.type === key).length}</Badge>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <Input className="h-14 pl-12 pr-6 rounded-2xl bg-white border-none shadow-sm text-sm focus-visible:ring-stats-cyan/30" placeholder="Pesquisar em todas as tarefas e solicitações..." />
                    </div>

                    <div className="space-y-3">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((req: any) => (
                                <Card key={req.id} className={cn("border-none shadow-sm transition-all hover:translate-x-1 group", req.status === 'completed' && "opacity-60")}>
                                    <CardContent className="p-5 flex items-start gap-5">
                                        <div className="pt-1">
                                            <Checkbox checked={req.status === 'completed'} className="border-2 border-gray-200" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge className={cn("text-[9px] font-bold border rounded-full px-2", typeColors[req.type as keyof typeof typeColors])}>
                                                    {typeLabels[req.type as keyof typeof typeLabels]}
                                                </Badge>
                                                {req.urgency && (
                                                    <Badge className={cn("text-[9px] font-bold border rounded-full px-2 shadow-none", urgencyColors[req.urgency as keyof typeof urgencyColors])}>
                                                        {urgencyLabels[req.urgency as keyof typeof urgencyLabels]}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className={cn("text-base font-bold text-gray-800 leading-tight", req.status === 'completed' && "line-through")}>
                                                {req.title}
                                            </h4>
                                            {req.description && (
                                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                    {req.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-gray-200 group-hover:text-stats-cyan transition-colors">
                                            <ArrowUpRight size={20} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl opacity-50 border-2 border-dashed border-gray-100">
                                <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-200" />
                                <p className="text-gray-400 font-bold">Nenhuma tarefa encontrada neste filtro.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
