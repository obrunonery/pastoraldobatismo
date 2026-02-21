import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Lightbulb, AlertCircle, ShoppingCart, CheckCircle2, Search, Pencil, Trash2, Filter, MoreHorizontal } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { RequestFormModal } from "@/components/RequestFormModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const typeColors = {
    request: "bg-stats-cyan/10 text-stats-cyan border-stats-cyan/20",
    idea: "bg-stats-cyan/10 text-stats-cyan border-stats-cyan/20",
    purchase: "bg-stats-green/10 text-stats-green border-stats-green/20",
    task: "bg-stats-orange/10 text-stats-orange border-stats-orange/20",
};

const typeLabels = {
    request: "Pedido",
    idea: "Ideia",
    purchase: "Compra",
    task: "Tarefa",
};

const urgencyColors = {
    low: "bg-emerald-50 text-emerald-600 border-emerald-100",
    medium: "bg-amber-50 text-amber-600 border-amber-100",
    high: "bg-rose-50 text-rose-600 border-rose-100",
};

const urgencyLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
};

export default function Requests() {
    const { isSecretary, isAdmin } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [filterType, setFilterType] = useState<string>("all");
    const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const utils = trpc.useUtils();
    const { data: requestsResponse, isLoading } = trpc.request.list.useQuery();
    const requests = Array.isArray(requestsResponse) ? requestsResponse : [];

    const createMutation = trpc.request.create.useMutation({
        onSuccess: () => {
            toast.success("Solicitação enviada!");
            utils.request.list.invalidate();
            setModalOpen(false);
        }
    });

    const updateMutation = trpc.request.update.useMutation({
        onSuccess: () => {
            toast.success("Solicitação atualizada!");
            utils.request.list.invalidate();
            setModalOpen(false);
            setSelectedRequest(null);
        }
    });

    const deleteMutation = trpc.request.delete.useMutation({
        onSuccess: () => {
            toast.success("Solicitação removida.");
            utils.request.list.invalidate();
        }
    });

    const filteredRequests = requests.filter((r: any) => {
        const matchesType = filterType === "all" || r.type === filterType;
        const matchesUrgency = urgencyFilter === "all" || r.urgency === urgencyFilter;
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesUrgency && matchesSearch;
    });

    const stats = {
        total: requests.length,
        open: requests.filter((r: any) => r.status !== 'Concluído').length,
        completed: requests.filter((r: any) => r.status === 'Concluído').length,
    };

    const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    const handleEdit = (req: any) => {
        setSelectedRequest(req);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Deseja excluir esta solicitação?")) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    const toggleComplete = async (req: any) => {
        const newStatus = req.status === 'Concluído' ? 'Pendente' : 'Concluído';
        await updateMutation.mutateAsync({ id: req.id, status: newStatus });
    };

    return (
        <div className="space-y-10 bg-slate-50/30 min-h-screen p-2 sm:p-6 rounded-[40px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 text-center md:text-left">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Solicitações & Tarefas</h1>
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Gestão centralizada de demandas</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <button
                        onClick={() => { setSelectedRequest(null); setModalOpen(true); }}
                        className="h-12 px-8 bg-stats-cyan text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-stats-cyan/20 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all mx-auto md:mx-0"
                    >
                        <Plus size={18} />
                        Nova Solicitação
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                {[
                    { label: "Pendentes", value: stats.open, icon: AlertCircle, color: "bg-stats-pink/10 text-stats-pink" },
                    { label: "Concluídas", value: stats.completed, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-500" }
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center justify-between transition-all hover:shadow-md">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{item.label}</p>
                            <h3 className="text-3xl font-black text-slate-800 leading-none">{item.value}</h3>
                        </div>
                        <div className={cn("w-14 h-14 rounded-[22px] flex items-center justify-center", item.color)}>
                            <item.icon size={26} />
                        </div>
                    </div>
                ))}

                <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-center transition-all hover:shadow-md group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-stats-cyan/5 rounded-full blur-2xl transition-colors" />
                    <div className="space-y-3 relative z-10">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Progresso Geral</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-stats-cyan rounded-full"
                                />
                            </div>
                            <span className="text-lg font-black text-stats-cyan">{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Filter Section */}
            <div className="space-y-8 px-2">
                <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
                        {/* Type Filters */}
                        <div className="bg-white p-1.5 rounded-full border border-slate-100 shadow-sm inline-flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                            <button
                                onClick={() => setFilterType("all")}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                                    filterType === "all"
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                Tudo
                            </button>
                            {Object.entries(typeLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setFilterType(key)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                                        filterType === key
                                            ? "bg-stats-cyan text-white shadow-md"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Urgency Filters */}
                        <div className="bg-slate-100/50 p-1 rounded-full border border-slate-100 inline-flex items-center gap-1">
                            <button
                                onClick={() => setUrgencyFilter("all")}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                                    urgencyFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                                )}
                            >
                                Urgência
                            </button>
                            {["high", "medium", "low"].map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setUrgencyFilter(u)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                        urgencyFilter === u
                                            ? (u === 'high' ? "bg-rose-500 text-white shadow-md" : u === 'medium' ? "bg-amber-500 text-white shadow-md" : "bg-emerald-500 text-white shadow-md")
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {urgencyLabels[u as keyof typeof urgencyLabels]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full xl:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-full text-xs font-bold shadow-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-stats-cyan/10 transition-all"
                            placeholder="Pesquisar solicitações..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stats-pink"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
                        {/* List Header */}
                        <div className="hidden md:grid grid-cols-[48px_1fr_120px_100px_48px] items-center gap-4 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                            <div /> {/* Removed Square */}
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Título & Descrição</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Categoria</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Urgência</p>
                            <div />
                        </div>

                        <div className="divide-y divide-slate-50">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req: any) => (
                                    <div
                                        key={req.id}
                                        className={cn(
                                            "group transition-all hover:bg-slate-50/50 flex flex-col md:grid md:grid-cols-[48px_1fr_120px_100px_48px] md:items-center gap-2 md:gap-4 px-4 md:px-6 py-3",
                                            req.status === 'Concluído' ? "opacity-60" : "opacity-100"
                                        )}
                                    >
                                        {/* Status / Checkbox */}
                                        <div className="hidden md:flex justify-center">
                                            <Checkbox
                                                checked={req.status === 'Concluído'}
                                                onCheckedChange={() => toggleComplete(req)}
                                                disabled={!isAdmin && !isSecretary}
                                                className="w-4 h-4 rounded-md border-2 border-slate-200 data-[state=checked]:bg-stats-green data-[state=checked]:border-stats-green transition-all"
                                            />
                                        </div>

                                        {/* Title & Info */}
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-3">
                                                <div className="md:hidden">
                                                    <Checkbox
                                                        checked={req.status === 'Concluído'}
                                                        onCheckedChange={() => toggleComplete(req)}
                                                        className="w-4 h-4 rounded-md border-2 border-slate-200"
                                                    />
                                                </div>
                                                <h4 className={cn(
                                                    "text-sm font-medium text-slate-600 truncate tracking-tight",
                                                    req.status === 'Concluído' && "line-through text-slate-400"
                                                )}>
                                                    {req.title}
                                                </h4>
                                            </div>
                                            {req.description && (
                                                <p className="text-[10px] text-slate-400 truncate pl-8 md:pl-0 font-medium">
                                                    {req.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Category Badge */}
                                        <div className="flex items-center pl-8 md:pl-0">
                                            <Badge className={cn(
                                                "text-[8px] font-black uppercase border-none px-2 h-5 rounded-full transition-all",
                                                typeColors[req.type as keyof typeof typeColors]
                                            )}>
                                                {typeLabels[req.type as keyof typeof typeLabels]}
                                            </Badge>
                                        </div>

                                        {/* Urgency */}
                                        <div className="flex items-center pl-8 md:pl-0">
                                            {req.urgency ? (
                                                <div className={cn(
                                                    "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border",
                                                    urgencyColors[req.urgency as keyof typeof urgencyColors]
                                                )}>
                                                    <div className={cn(
                                                        "w-1 h-1 rounded-full animate-pulse",
                                                        req.urgency === 'high' ? "bg-rose-500" : req.urgency === 'medium' ? "bg-amber-500" : "bg-emerald-500"
                                                    )} />
                                                    <span className="text-[8px] font-black uppercase tracking-wider">
                                                        {urgencyLabels[req.urgency as keyof typeof urgencyLabels]}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-slate-300 font-bold italic tracking-tighter">N/A</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-end md:justify-center">
                                            {(isAdmin || isSecretary) && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-stats-cyan hover:bg-stats-cyan/5 rounded-xl transition-all">
                                                            <MoreHorizontal size={14} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-2xl shadow-xl border-slate-100 p-1">
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(req)}
                                                            className="gap-2 focus:bg-stats-cyan/10 focus:text-stats-cyan rounded-xl text-xs font-bold text-slate-600"
                                                        >
                                                            <Pencil size={12} /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(req.id)}
                                                            className="gap-2 focus:bg-rose-50 text-rose-500 rounded-xl text-xs font-bold"
                                                        >
                                                            <Trash2 size={12} /> Remover
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                                        <Search size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-400">Nenhuma solicitação encontrada</p>
                                        <p className="text-xs text-slate-300">Tente ajustar seus filtros de busca</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <RequestFormModal
                    open={modalOpen}
                    onOpenChange={(open) => {
                        setModalOpen(open);
                        if (!open) setSelectedRequest(null);
                    }}
                    initialData={selectedRequest}
                    onSubmit={async (data) => {
                        if (selectedRequest) {
                            await updateMutation.mutateAsync({ id: selectedRequest.id, ...data });
                        } else {
                            await createMutation.mutateAsync(data);
                        }
                    }}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            </div>
        </div>
    );
}
