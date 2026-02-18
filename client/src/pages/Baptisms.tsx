import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Users, Calendar, FileCheck, CheckCircle, ChevronRight, Search, LayoutGrid, List, Baby, AlertCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { BaptismFormModal } from "@/components/BaptismFormModal";
import { toast } from "sonner";

export default function Baptisms() {
    const { isSecretary, isAdmin } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBaptism, setSelectedBaptism] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const utils = trpc.useUtils();

    const { data: baptismsResponse, isLoading, refetch } = trpc.baptism.list.useQuery();
    const baptisms = Array.isArray(baptismsResponse) ? baptismsResponse : [];

    const createMutation = trpc.baptism.create.useMutation({
        onSuccess: () => {
            toast.success("Batismo cadastrado!");
            utils.baptism.list.invalidate();
            setModalOpen(false);
        },
        onError: (err) => {
            console.error("[TRPC] Error creating baptism:", err);
            toast.error("Erro ao criar batismo: " + err.message);
        }
    });

    const updateMutation = trpc.baptism.update.useMutation({
        onSuccess: () => {
            toast.success("Dados atualizados!");
            utils.baptism.list.invalidate();
            setModalOpen(false);
            setSelectedBaptism(null);
        },
        onError: (err) => {
            console.error("[TRPC] Error updating baptism:", err);
            toast.error("Erro ao atualizar batismo: " + err.message);
        }
    });

    const deleteMutation = trpc.baptism.delete.useMutation({
        onSuccess: () => {
            toast.success("Registro de batismo removido.");
            utils.baptism.list.invalidate();
        }
    });

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const { data: members } = trpc.pastoralMembers.list.useQuery();

    const getCelebrantName = (id: string | null) => {
        if (!id) return "Não atribuído";
        const member = members?.find((m: any) => m.id === id);
        return member?.name || "Desconhecido";
    };

    const updateStatusMutation = trpc.baptism.update.useMutation({
        onSuccess: () => {
            toast.success("Status atualizado!");
            utils.baptism.list.invalidate();
        },
        onError: (err) => {
            toast.error("Erro ao atualizar status: " + err.message);
        }
    });

    const counts = {
        total: baptisms.length,
        pending: baptisms.filter((b: any) => !b.docsOk).length,
        completed: baptisms.filter((b: any) => b.status === "Concluído").length,
    };

    const handleEdit = (baptism: any) => {
        setSelectedBaptism(baptism);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir o registro deste batismo?")) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    const toggleStatus = (id: number, current: any, field: string) => {
        if (!isAdmin && !isSecretary) return;
        const val = !current;
        updateStatusMutation.mutate({ id, [field]: val });
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Batismos</h1>
                    <p className="text-slate-600 mt-1">Gerenciamento do ciclo de vida dos batismos</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <Button onClick={() => { setSelectedBaptism(null); setModalOpen(true); }} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Registros", value: counts.total, icon: Baby, color: "bg-stats-cyan" },
                    { label: "Pendências", value: counts.pending, icon: AlertCircle, color: "bg-stats-orange" },
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

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        className="pl-9 h-11 rounded-2xl bg-white border-slate-100 shadow-sm text-sm focus:ring-stats-cyan/20"
                        placeholder="Buscar por nome da criança..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Exibindo {baptisms.filter(b => b.childName?.toLowerCase().includes(searchTerm.toLowerCase())).length} registros
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                {baptisms.length > 0 ? (
                    baptisms
                        .filter((b: any) => b.childName?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((baptism: any) => {
                            const isExpanded = expandedId === baptism.id;
                            return (
                                <Card key={baptism.id} className="shadow-sm border-slate-50 border overflow-hidden hover:border-slate-200 transition-all group">
                                    {/* HEADER - Sempre Visível */}
                                    <div className="p-4 flex items-center justify-between cursor-default">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="min-w-[200px] text-left">
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight truncate">
                                                    {baptism.childName || "Sem Nome"}
                                                </h3>
                                                {(baptism.scheduledDate || baptism.date) && (
                                                    <p className="text-[15px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                        {formatDate(baptism.scheduledDate || baptism.date)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Hover Actions */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                                {(isAdmin || isSecretary) && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:bg-white hover:shadow-sm rounded-full"
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-40 rounded-2xl shadow-xl border-slate-100 p-1"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() => handleEdit(baptism)}
                                                                className="gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-stats-cyan/10"
                                                            >
                                                                <Edit size={14} />
                                                                Editar
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(baptism.id)}
                                                                className="gap-2 cursor-pointer font-medium py-2 rounded-xl text-rose-600 focus:bg-rose-50"
                                                            >
                                                                <Trash2 size={14} />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                            {/* Expand Toggle */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleExpand(baptism.id)}
                                                className={cn("h-8 w-8 text-slate-300 transition-transform duration-200", isExpanded && "rotate-180")}
                                            >
                                                <ChevronRight size={18} className="rotate-90" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* BODY - Expansível */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-4 animate-in slide-in-from-top-2 duration-300 bg-white border-t border-slate-100">
                                            {/* Grid de Informações - Ultra Compacto */}
                                            <div className="grid grid-cols-4 gap-2 mb-5">
                                                <div className="flex flex-col">
                                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1 leading-none">Pais</p>
                                                    <p className="text-[13px] font-bold text-slate-700 truncate leading-tight">{baptism.parentNames || "-"}</p>
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] sm:text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1 leading-none">Padrinho</p>
                                                    <p className="text-[13px] font-bold text-slate-700 truncate leading-tight">{baptism.godparentsNames || "-"}</p>
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1 leading-none">Celebrante</p>
                                                    <p className="text-[13px] font-bold text-slate-700 truncate leading-tight">{getCelebrantName(baptism.celebrantId)}</p>
                                                </div>
                                            </div>

                                            {/* Botões de Ação de Status - Estilo Mockup Compacto */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleStatus(baptism.id, baptism.docsOk, 'docsOk'); }}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all shadow-sm",
                                                        baptism.docsOk
                                                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-100/5"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-stats-orange/30 hover:bg-stats-orange/5"
                                                    )}
                                                >
                                                    {baptism.docsOk ? <CheckCircle size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-stats-orange" />}
                                                    <span className="text-[11px] font-bold tracking-tight">
                                                        {baptism.docsOk ? "Documentação OK" : "Documentação Pendente"}
                                                    </span>
                                                </button>

                                            </div>

                                            {/* Observações Dinâmicas */}
                                            {baptism.observations && (
                                                <div className="mt-6 text-xs text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                                    <span className="font-bold not-italic text-[10px] uppercase block mb-1 text-slate-300">Observações:</span>
                                                    {baptism.observations}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-50 shadow-sm">
                        <Baby size={64} className="mx-auto text-slate-100 mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">Nenhum batismo encontrado</h3>
                        <p className="text-sm text-slate-300">Tente buscar por outro nome ou adicione um novo registro.</p>
                    </div>
                )}
            </div>
            <BaptismFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedBaptism(null);
                }}
                initialData={selectedBaptism}
                onSubmit={async (data) => {
                    if (selectedBaptism) {
                        await updateMutation.mutateAsync({ id: selectedBaptism.id, ...data });
                    } else {
                        // Remove id and old date field to avoid conflict with auto-increment and backend schema
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id, date, ...cleanData } = data;
                        console.log("[PAGE] Creating with cleanData:", cleanData);
                        await createMutation.mutateAsync(cleanData);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
