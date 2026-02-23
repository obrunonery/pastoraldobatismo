import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Users, Calendar, FileCheck, CheckCircle, ChevronRight, Search, LayoutGrid, List, Baby, AlertCircle, Edit, Trash2, MoreHorizontal, Target, Settings2, TrendingUp, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaptismFormModal } from "@/components/BaptismFormModal";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { motion, AnimatePresence } from "framer-motion";

export default function Baptisms() {
    const { isSecretary, isAdmin } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBaptism, setSelectedBaptism] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const utils = trpc.useUtils();

    const { data: baptismsResponse, isLoading } = trpc.baptism.list.useQuery();
    const baptisms = Array.isArray(baptismsResponse) ? baptismsResponse : [];

    const createMutation = trpc.baptism.create.useMutation({
        onSuccess: () => {
            toast.success("Batismo cadastrado!");
            utils.baptism.list.invalidate();
            setModalOpen(false);
        },
        onError: (error) => {
            toast.error(`Erro ao cadastrar: ${error.message}`);
        }
    });

    const updateMutation = trpc.baptism.update.useMutation({
        onSuccess: () => {
            toast.success("Dados atualizados!");
            utils.baptism.list.invalidate();
            setModalOpen(false);
            setSelectedBaptism(null);
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar: ${error.message}`);
        }
    });

    const deleteMutation = trpc.baptism.delete.useMutation({
        onSuccess: () => {
            toast.success("Registro de batismo removido.");
            utils.baptism.list.invalidate();
        },
        onError: (error) => {
            toast.error(`Erro ao excluir: ${error.message}`);
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
        onError: (error) => {
            toast.error(`Erro ao atualizar status: ${error.message}`);
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
        updateStatusMutation.mutate({ id, [field]: !current });
    };

    // Annual Goal Logic
    const currentYearNum = new Date().getFullYear();
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalInputValue, setGoalInputValue] = useState(100);

    const { data: serverGoal, refetch: refetchGoal } = trpc.dashboard.getAnnualGoal.useQuery();
    const { data: evolutionData } = trpc.dashboard.getEvolutionData.useQuery({ year: String(currentYearNum) });

    const goalToDisplay = serverGoal ?? 100;
    const currentYearTotal = useMemo(() => {
        if (!Array.isArray(evolutionData)) return 0;
        return evolutionData
            .filter((d: any) => d.year === currentYearNum)
            .reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
    }, [evolutionData, currentYearNum]);

    const progressPercentage = Math.min(100, (currentYearTotal / goalToDisplay) * 100);

    const monthPace = useMemo(() => {
        const currentMonth = new Date().getMonth() + 1;
        const expectedTarget = (goalToDisplay * currentMonth) / 12;
        const paceRatio = currentYearTotal / expectedTarget;

        if (progressPercentage >= 100) return { color: "bg-emerald-500", text: "text-emerald-500" };
        if (paceRatio < 0.6) return { color: "bg-rose-500", text: "text-rose-500" };
        if (paceRatio < 0.9) return { color: "bg-stats-orange", text: "text-stats-orange" };
        return { color: "bg-stats-cyan", text: "text-stats-cyan" };
    }, [currentYearTotal, goalToDisplay, progressPercentage]);

    const goalMutation = trpc.dashboard.updateAnnualGoal.useMutation({
        onSuccess: () => {
            toast.success("Meta atualizada com sucesso!");
            refetchGoal();
            setIsEditingGoal(false);
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar meta: ${error.message}`);
        }
    });

    const handleSaveGoal = () => {
        goalMutation.mutate({ goal: goalInputValue });
    };

    return (
        <div className="space-y-10 bg-slate-50/30 min-h-screen p-2 sm:p-6 rounded-[40px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 text-center md:text-left">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Batizados</h1>
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Gestão Documental e Escalas</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <button
                        onClick={() => { setSelectedBaptism(null); setModalOpen(true); }}
                        className="h-12 px-8 bg-stats-cyan text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-stats-cyan/20 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all mx-auto md:mx-0"
                    >
                        <Plus size={18} />
                        Novo Batismo
                    </button>
                )}
            </div>

            {/* Stats Cards Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                {[
                    { label: "Total Registros", value: counts.total, icon: Baby, color: "bg-stats-cyan/10 text-stats-cyan" },
                    { label: "Documentação Pendente", value: counts.pending, icon: AlertCircle, color: "bg-stats-orange/10 text-stats-orange" },
                    { label: "Batismos Concluídos", value: counts.completed, icon: FileCheck, color: "bg-emerald-50 text-emerald-500" }
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex items-center justify-between transition-all hover:shadow-md">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{item.label}</p>
                            <h3 className="text-3xl font-black text-slate-800 leading-none">{item.value}</h3>
                        </div>
                        <div className={cn("w-14 h-14 rounded-[22px] flex items-center justify-center transition-transform hover:rotate-6", item.color)}>
                            <item.icon size={26} />
                        </div>
                    </div>
                ))}

                {/* Compact Progress Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between transition-all hover:shadow-md group relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-stats-cyan/5 rounded-full blur-2xl group-hover:bg-stats-cyan/10 transition-colors" />
                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Meta {currentYearNum}</p>
                                <h3 className="text-3xl font-black text-slate-800 leading-none">{currentYearTotal}<span className="text-xs text-slate-300 font-bold ml-1">/ {goalToDisplay}</span></h3>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => { setGoalInputValue(goalToDisplay); setIsEditingGoal(true); }}
                                    className="w-8 h-8 bg-slate-50 text-slate-300 hover:text-stats-cyan hover:bg-stats-cyan/5 rounded-xl flex items-center justify-center transition-all"
                                >
                                    <Settings2 size={14} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1.5 }}
                                    className={cn("h-full rounded-full transition-colors duration-500", monthPace.color)}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                <span className={cn("transition-colors duration-500", monthPace.text)}>{Math.round(progressPercentage)}% CONCLUÍDO</span>
                                {progressPercentage < 100 ? (
                                    <span className="text-slate-300">FALTAM {goalToDisplay - currentYearTotal}</span>
                                ) : (
                                    <span className="text-emerald-500 flex items-center gap-1">META! 🏆</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtro e Listagem */}
            <div className="space-y-6 px-2">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-full text-xs font-bold shadow-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-stats-cyan/10 transition-all"
                            placeholder="Buscar por nome da criança ou pais..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-4">
                        Exibindo {baptisms.filter(b => b.childName?.toLowerCase().includes(searchTerm.toLowerCase())).length} registros
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {baptisms.length > 0 ? (
                            baptisms
                                .filter((b: any) => {
                                    const search = (searchTerm || "").trim().toLowerCase();
                                    if (!search) return true;
                                    return (b.childName || "").toLowerCase().includes(search);
                                })
                                .map((baptism: any) => (
                                    <motion.div
                                        key={baptism.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={cn(
                                            "group bg-white rounded-[32px] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.01)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.05)] transition-all overflow-hidden flex flex-col h-full",
                                            expandedId === baptism.id ? "ring-2 ring-stats-cyan/20" : "cursor-pointer"
                                        )}
                                        onClick={() => setExpandedId(expandedId === baptism.id ? null : baptism.id)}
                                    >
                                        <div className="p-6 space-y-4 flex-1">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight truncate leading-tight group-hover:text-stats-cyan transition-colors">
                                                        {baptism.childName || "Criança sem nome"}
                                                    </h3>
                                                    {(baptism.scheduledDate || baptism.date) && (
                                                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
                                                            {formatDate(baptism.scheduledDate || baptism.date)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {(isAdmin || isSecretary) && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <button className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-stats-cyan hover:text-white transition-all">
                                                                    <MoreHorizontal size={14} />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="rounded-2xl p-1 border-slate-100 shadow-xl">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => { e.stopPropagation(); handleEdit(baptism); }}
                                                                    className="rounded-xl flex items-center gap-2 text-xs font-bold text-slate-600 focus:bg-stats-cyan/10 focus:text-stats-cyan"
                                                                >
                                                                    <Edit size={12} /> Editar Registro
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(baptism.id); }}
                                                                    className="rounded-xl flex items-center gap-2 text-xs font-bold text-rose-500 focus:bg-rose-50"
                                                                >
                                                                    <Trash2 size={12} /> Remover Batismo
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {expandedId === baptism.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="space-y-4 pt-2">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pais</p>
                                                                    <p className="text-xs font-bold text-slate-600 truncate">{baptism.parentNames || "Não informado"}</p>
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Padrinhos</p>
                                                                    <p className="text-xs font-bold text-slate-600 truncate">{baptism.godparentsNames || "Não informado"}</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3 p-4 bg-slate-50/50 rounded-[24px] border border-slate-50">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Celebrante</p>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <User size={10} className="text-stats-cyan" />
                                                                        <p className="text-xs font-bold text-slate-600 truncate">{getCelebrantName(baptism.celebrantId)}</p>
                                                                    </div>
                                                                </div>

                                                                {baptism.agents?.length > 0 && (
                                                                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                                                            <Users size={10} /> Equipe Escalada
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {baptism.agents.map((agent: any) => (
                                                                                <span key={agent.id} className="text-[9px] font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-100 text-slate-500">
                                                                                    {agent.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="pt-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleStatus(baptism.id, baptism.docsOk, 'docsOk'); }}
                                                                    className={cn(
                                                                        "w-full flex items-center justify-between p-3 rounded-2xl border transition-all",
                                                                        baptism.docsOk
                                                                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-600"
                                                                            : "bg-stats-orange/5 border-stats-orange/10 text-stats-orange"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {baptism.docsOk ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                                        <span className="text-[10px] font-black uppercase tracking-wider">
                                                                            {baptism.docsOk ? "Documentação OK" : "Pendências Docs"}
                                                                        </span>
                                                                    </div>
                                                                    <ChevronRight size={14} className={cn("transition-transform", baptism.docsOk && "rotate-90")} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))
                        ) : (
                            <div className="col-span-full py-40 text-center space-y-6">
                                <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center mx-auto shadow-sm border border-slate-50">
                                    <Baby size={44} className="text-slate-100" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-800 font-bold">Nenhum batismo registrado</h3>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Comece agendando o primeiro batismo do mês</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <BaptismFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedBaptism(null);
                }}
                initialData={selectedBaptism}
                onSubmit={async (data) => {
                    const { id, date, ...rest } = data;
                    if (selectedBaptism) {
                        await updateMutation.mutateAsync({
                            id: selectedBaptism.id,
                            ...rest
                        });
                    } else {
                        await createMutation.mutateAsync(rest);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
                <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-stats-cyan p-8 text-white relative overflow-hidden">
                        <Target className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                                <Target size={28} /> Ajustar Meta
                            </DialogTitle>
                        </DialogHeader>
                        <p className="text-white/70 text-xs font-medium mt-2">Defina o objetivo de batizados para o ano de {currentYearNum}.</p>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Anual de Batizados</Label>
                            <Input
                                type="number"
                                value={goalInputValue}
                                onChange={(e) => setGoalInputValue(Number(e.target.value))}
                                className="h-16 text-3xl font-black rounded-2xl border-slate-100 bg-slate-50 focus:ring-stats-cyan focus:border-stats-cyan text-center transition-all"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditingGoal(false)}
                                className="flex-1 h-14 bg-slate-50 text-slate-400 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveGoal}
                                className="flex-[2] h-14 bg-stats-cyan text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-stats-cyan/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={20} /> Confirmar Meta
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
