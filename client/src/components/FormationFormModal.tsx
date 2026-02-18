import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormationFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function FormationFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}: FormationFormModalProps) {
    const { register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            title: "",
            date: new Date().toISOString().split('T')[0],
            facilitator: "",
            content: ""
        }
    });

    // Esta função garante que os dados carreguem sempre que você abrir o modal
    // sem entrar no loop infinito que causava o erro "Maximum update depth"
    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    title: initialData.title || "",
                    date: initialData.date || new Date().toISOString().split('T')[0],
                    facilitator: initialData.facilitator || "",
                    content: initialData.content || ""
                });
            } else {
                reset({
                    title: "",
                    date: new Date().toISOString().split('T')[0],
                    facilitator: "",
                    content: ""
                });
            }
        }
    }, [open, initialData, reset]);

    const selectedFacilitatorStr = watch("facilitator") || "";
    const selectedMembers = useMemo(() =>
        selectedFacilitatorStr ? selectedFacilitatorStr.split(/[;,]/).map(s => s.trim()).filter(Boolean) : []
        , [selectedFacilitatorStr]);

    const { data: membersResponse } = trpc.pastoralMembers.list.useQuery(undefined, {
        enabled: open,
        staleTime: 5 * 60 * 1000 // Cache for 5 mins
    });

    // Filtra membros da pastoral excluindo celebrantes
    const pastoralMembers = useMemo(() =>
        Array.isArray(membersResponse)
            ? membersResponse.filter((m: any) => m.role !== "CELEBRANTE")
            : []
        , [membersResponse]);

    const toggleMember = (fullName: string) => {
        const firstName = fullName.split(' ')[0];
        let newSelection: string[];
        if (selectedMembers.includes(firstName)) {
            newSelection = selectedMembers.filter(m => m !== firstName);
        } else {
            newSelection = [...selectedMembers, firstName];
        }
        setValue("facilitator", newSelection.join(", "));
    };

    const handleFormSubmit = async (data: any) => {
        console.log("[DEBUG] Modal Form Submit Data:", data);
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-3xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Encontro" : "Novo Encontro de Pais e Padrinhos"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <input type="hidden" {...register("facilitator")} />
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold text-slate-400 uppercase">Título do Encontro</Label>
                        <Input id="title" {...register("title", { required: true })} placeholder="Ex: Encontro Mensal de Pais" className="rounded-xl bg-slate-50 border-none h-11" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-xs font-bold text-slate-400 uppercase">Data</Label>
                            <Input id="date" type="date" {...register("date", { required: true })} className="rounded-xl bg-slate-50 border-none h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase">Participantes (Equipe)</Label>
                            <div className="text-[10px] text-slate-400 italic font-medium">Marcados: {selectedMembers.length}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-400 uppercase">Escala Selecionada</Label>
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl min-h-[44px]">
                            {selectedMembers.length > 0 ? (
                                selectedMembers.map(name => (
                                    <Badge key={name} variant="secondary" className="bg-white text-stats-cyan border-slate-100 py-1 px-2 rounded-lg flex items-center gap-1 animate-in zoom-in-95">
                                        {name}
                                        <X size={12} className="cursor-pointer hover:text-rose-500" onClick={() => toggleMember(name)} />
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 py-1 italic">Ninguém escalado ainda...</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase">Membros Disponíveis</Label>
                        {/* Com apenas o primeiro nome, podemos voltar para 3 colunas e economizar espaço */}
                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                            {pastoralMembers.map((member: any) => {
                                // A MÁGICA: Extrai apenas o que vem antes do primeiro espaço
                                const firstName = member.name.split(' ')[0];
                                const isSelected = selectedMembers.includes(firstName);

                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => toggleMember(member.name)}
                                        className={cn(
                                            "flex flex-row items-center gap-2 p-2 rounded-xl border transition-all text-left group",
                                            isSelected
                                                ? "bg-stats-cyan/10 border-stats-cyan/40 shadow-sm"
                                                : "bg-slate-50 border-transparent hover:bg-slate-100"
                                        )}
                                    >
                                        {/* Círculo de seleção menor para ser mais minimalista */}
                                        <div className={cn(
                                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                            isSelected ? "bg-stats-cyan border-stats-cyan" : "border-slate-300 bg-white"
                                        )}>
                                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>

                                        {/* Apenas o Primeiro Nome */}
                                        <span className={cn(
                                            "text-[12px] font-bold truncate flex-1",
                                            isSelected ? "text-stats-cyan" : "text-slate-600"
                                        )}>
                                            {firstName}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-xs font-bold text-slate-400 uppercase">Observações / Detalhes</Label>
                        <textarea
                            id="content"
                            {...register("content")}
                            className="flex min-h-[80px] w-full rounded-2xl border-none bg-slate-50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Informações adicionais sobre o encontro..."
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-stats-cyan hover:bg-stats-cyan/90 rounded-xl px-8 shadow-md">
                            {isLoading ? "Salvando..." : "Salvar Encontro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
