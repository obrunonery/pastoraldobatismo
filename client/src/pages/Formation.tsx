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
    const { isAdmin } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFormation, setSelectedFormation] = useState<any>(null);
    const utils = trpc.useUtils();

    const { data: formationsResponse, isLoading } = trpc.formation.list.useQuery();
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Encontro de Pais e Padrinhos</h1>
                </div>
                {isAdmin && (
                    <Button onClick={() => { setSelectedFormation(null); setModalOpen(true); }} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
                        <Plus size={18} />
                        Novo Encontro
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-green"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formations.map((formation: any) => {
                    return (
                        <Card key={formation.id} className="border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white h-full flex flex-col">
                            <div className="h-32 bg-gradient-to-br from-stats-green/20 to-stats-cyan/20 flex items-center justify-center relative shrink-0">
                                <BookOpen size={48} className="text-white/40 absolute group-hover:scale-110 transition-transform" />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/80 text-stats-green backdrop-blur-sm border-none font-black text-[10px]">
                                        {formatDate(formation.date)}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                                <div className="space-y-2 flex-1">
                                    <h3 className="text-lg font-black text-gray-800 leading-tight group-hover:text-stats-green transition-colors">
                                        {formation.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium line-clamp-3 leading-relaxed">
                                        {formation.content || "Nenhuma observação registrada para este encontro."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            <Users size={12} className="text-slate-400" />
                                            <span>Escala:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 min-h-[20px]">
                                            {(() => {
                                                const scaleValue = (formation as any).facilitator || "";
                                                const names = String(scaleValue).split(/[;,]/).map(s => s.trim()).filter(Boolean);

                                                if (names.length === 0) {
                                                    return (
                                                        <span className="text-[10px] text-slate-400 font-medium italic">Sem escala definida</span>
                                                    );
                                                }

                                                return names.map((name: string) => (
                                                    <Badge
                                                        key={name}
                                                        variant="secondary"
                                                        className="bg-stats-cyan/10 text-stats-cyan border-none px-2 py-0 h-5 text-[9px] font-black rounded-md"
                                                    >
                                                        {name}
                                                    </Badge>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    {isAdmin && (
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
                                                        onClick={() => handleEdit(formation)}
                                                        className="text-blue-600 gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-blue-50"
                                                    >
                                                        <Pencil size={14} /> Editar
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(formation.id)}
                                                        className="text-rose-600 gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-rose-50"
                                                    >
                                                        <Trash2 size={14} /> Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {formations.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Lightbulb size={48} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum encontro agendado</p>
                    </div>
                )}
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
