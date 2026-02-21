import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, AlertCircle, ShoppingCart, CheckCircle2, Search, Pencil, Trash2, Filter, MoreHorizontal, BookOpen, FileText, Download, ChevronRight, PlayCircle, User, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FormationFormModal } from "@/components/FormationFormModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Formation() {
    const { isAdmin, isSecretary, isLoading: isRoleLoading } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState<any>(null);
    const utils = trpc.useUtils();

    const { data: formationsResponse, isLoading: isDataLoading } = trpc.formation.list.useQuery();
    const formations = Array.isArray(formationsResponse) ? formationsResponse : [];

    const createMutation = trpc.formation.create.useMutation({
        onSuccess: () => {
            toast.success("Novo encontro agendado com sucesso!");
            utils.formation.list.invalidate();
            setModalOpen(false);
        }
    });

    const updateMutation = trpc.formation.update.useMutation({
        onSuccess: () => {
            toast.success("Dados do encontro atualizados!");
            utils.formation.list.invalidate();
            setModalOpen(false);
            setSelectedFormation(null);
        }
    });

    const deleteMutation = trpc.formation.delete.useMutation({
        onSuccess: () => {
            toast.success("Encontro removido do cronograma.");
            utils.formation.list.invalidate();
        }
    });

    const handleEdit = (formation: any) => {
        setSelectedFormation(formation);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Deseja excluir este encontro?")) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    const canManage = isAdmin || isSecretary;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Encontro de Pais e Padrinhos</h1>
                </div>
                {canManage && (
                    <Button onClick={() => { setSelectedFormation(null); setModalOpen(true); }} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
                        <Plus size={18} />
                        Novo Encontro
                    </Button>
                )}
            </div>

            {(isDataLoading || isRoleLoading) && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-green"></div>
                </div>
            )}

            <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
                {/* List Header */}
                <div className="hidden md:grid grid-cols-[100px_1fr_300px_48px] items-center gap-4 px-6 py-2 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Data</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Encontro & Detalhes</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Equipe Escalada</p>
                    <div />
                </div>

                <div className="divide-y divide-slate-50">
                    {!isDataLoading && formations.map((formation: any) => {
                        const facilitator = (formation as any).facilitator || "";
                        const teamNames = String(facilitator).split(/[;,]/).map(s => s.trim()).filter(Boolean);

                        return (
                            <div
                                key={formation.id}
                                className="group transition-all hover:bg-slate-50/50 flex flex-col md:grid md:grid-cols-[100px_1fr_300px_48px] md:items-center gap-2 md:gap-4 px-4 md:px-6 py-2 hover:shadow-[inset_4px_0_0_0_#0ea5e9] transition-all"
                            >
                                {/* Date Column */}
                                <div className="flex items-center md:justify-center">
                                    <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100 flex items-center justify-center h-6">
                                        <p className="text-[11px] font-black text-slate-600 tracking-tight leading-none">
                                            {formatDate(formation.date)}
                                        </p>
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="space-y-0.5 min-w-0">
                                    <h4 className="text-sm font-medium text-slate-600 truncate tracking-tight">
                                        {formation.title}
                                    </h4>
                                    {formation.content && (
                                        <p className="text-[10px] text-slate-400 truncate font-medium">
                                            {formation.content}
                                        </p>
                                    )}
                                </div>

                                {/* Team Column */}
                                <div className="flex flex-wrap md:justify-center items-center gap-1.5 md:border-l md:border-r md:border-slate-50 md:h-full py-1">
                                    {teamNames.length > 0 ? (
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Users size={12} className="text-slate-300 shrink-0" />
                                            <p className="text-[11px] font-medium text-slate-500 leading-tight">
                                                {teamNames.join(', ')}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 font-bold italic tracking-tighter">Sem escala</span>
                                    )}
                                </div>

                                {/* Actions Column */}
                                <div className="flex justify-end md:justify-center">
                                    {canManage && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-stats-cyan hover:bg-stats-cyan/5 rounded-xl transition-all">
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 rounded-2xl shadow-xl border-slate-100 p-1">
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(formation)}
                                                    className="gap-2 focus:bg-stats-cyan/10 focus:text-stats-cyan rounded-xl text-xs font-bold text-slate-600"
                                                >
                                                    <Pencil size={12} /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(formation.id)}
                                                    className="gap-2 focus:bg-rose-50 text-rose-500 rounded-xl text-xs font-bold"
                                                >
                                                    <Trash2 size={12} /> Remover
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {!isDataLoading && formations.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
                                <Users size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-400">Nenhum encontro agendado</p>
                                <p className="text-xs text-slate-300">Tudo limpo por aqui</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <FormationFormModal
                key={modalOpen ? (selectedFormation?.id || 'new') : 'closed'}
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedFormation(null);
                }}
                initialData={selectedFormation}
                onSubmit={async (data) => {
                    console.log("[DEBUG] Formation Page onSubmit Data:", data);
                    if (selectedFormation) {
                        await updateMutation.mutateAsync({ id: selectedFormation.id, ...data });
                    } else {
                        await createMutation.mutateAsync(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div >
    );
}
