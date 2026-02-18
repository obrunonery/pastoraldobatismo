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
        const matchesFilter = filterType === "all" || r.type === filterType;
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Solicitações & Tarefas</h1>
                    <p className="text-slate-600 mt-1 font-medium">Gestão centralizada de solicitações da pastoral</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <Button onClick={() => { setSelectedRequest(null); setModalOpen(true); }} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
                        <Plus size={18} />
                        Nova Solicitação
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-stats-pink/5 border-l-4 border-l-stats-pink">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-black text-stats-pink uppercase mb-1">Pendentes</p>
                                <h3 className="text-3xl font-black text-slate-800">{stats.open}</h3>
                            </div>
                            <AlertCircle className="text-stats-pink/20" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-stats-green/5 border-l-4 border-l-stats-green">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-black text-stats-green uppercase mb-1">Concluídas</p>
                                <h3 className="text-3xl font-black text-slate-800">{stats.completed}</h3>
                            </div>
                            <CheckCircle2 className="text-stats-green/20" size={32} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-stats-cyan/5 border-l-4 border-l-stats-cyan">
                    <CardContent className="p-6">
                        <p className="text-[10px] font-black text-stats-cyan uppercase mb-2">Progresso Geral</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-stats-cyan/10">
                                <div className="h-full bg-stats-cyan transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-lg font-black text-stats-cyan">{Math.round(progress)}%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    <Button
                        variant={filterType === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType("all")}
                        className={cn("rounded-full font-bold", filterType === "all" && "bg-slate-800")}
                    >
                        Tudo
                    </Button>
                    {Object.entries(typeLabels).map(([key, label]) => (
                        <Button
                            key={key}
                            variant={filterType === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterType(key)}
                            className={cn("rounded-full font-bold", filterType === key && "bg-slate-800")}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 rounded-full bg-slate-50 border-none text-xs font-medium"
                        placeholder="Pesquisar solicitações..."
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stats-pink"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map((req: any) => (
                            <Card key={req.id} className={cn(
                                "border border-slate-50 shadow-sm transition-all hover:shadow-md group",
                                req.status === 'Concluído' ? "bg-slate-50/80" : "bg-white"
                            )}>
                                <CardContent className="p-5 flex items-center gap-5">
                                    <div className="pt-0">
                                        <Checkbox
                                            checked={req.status === 'Concluído'}
                                            onCheckedChange={() => toggleComplete(req)}
                                            disabled={!isAdmin && !isSecretary}
                                            className="w-6 h-6 rounded-lg border-2 border-slate-200 data-[state=checked]:bg-stats-green data-[state=checked]:border-stats-green"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={cn("text-[8px] font-black uppercase border-none px-2 h-5 flex items-center", typeColors[req.type as keyof typeof typeColors])}>
                                                {typeLabels[req.type as keyof typeof typeLabels]}
                                            </Badge>
                                            {req.urgency && (
                                                <Badge className={cn("text-[8px] font-black uppercase border px-2 h-5 flex items-center", urgencyColors[req.urgency as keyof typeof urgencyColors])}>
                                                    {urgencyLabels[req.urgency as keyof typeof urgencyLabels]}
                                                </Badge>
                                            )}
                                        </div>
                                        <h4 className={cn("text-lg font-black text-slate-800", req.status === 'Concluído' && "line-through text-slate-400")}>
                                            {req.title}
                                        </h4>
                                        {req.description && (
                                            <p className="text-sm text-slate-500 font-medium">
                                                {req.description}
                                            </p>
                                        )}
                                    </div>

                                    {(isAdmin || isSecretary) && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:bg-white hover:shadow-sm rounded-full"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </Button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                align="end"
                                                className="w-40 rounded-2xl shadow-xl border-slate-100 p-1"
                                                >
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(req)}
                                                    className="text-blue-600 gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-blue-50"
                                                >
                                                    <Pencil size={14} /> Editar
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(req.id)}
                                                    className="text-rose-600 gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-rose-50"
                                                >
                                                    <Trash2 size={14} /> Excluir
                                                </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma tarefa encontrada</p>
                        </div>
                    )}
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
    );
}
