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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useEffect } from "react";
import { Wallet, DollarSign, Calendar, Tag, Check, X, ArrowUpCircle, ArrowDownCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinanceFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
    initialData?: any;
}

export function FinanceFormModal({
    open,
    onOpenChange,
    onSubmit,
    isLoading,
    initialData
}: FinanceFormModalProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: initialData || {
            description: "",
            value: 0,
            type: "entrada" as "entrada" | "saída",
            category: "Dízimo",
            date: new Date().toISOString().split('T')[0]
        }
    });

    const typeValue = watch("type");

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    description: "",
                    value: 0,
                    type: "entrada",
                    category: "Dízimo",
                    date: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [reset, open, initialData]);

    const handleFormSubmit = async (data: any) => {
        const formattedData = {
            ...data,
            value: Number(data.value)
        };
        await onSubmit(formattedData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
                <div className={cn(
                    "p-8 text-white relative overflow-hidden transition-colors duration-500",
                    typeValue === 'entrada' ? "bg-emerald-500" : "bg-stats-pink"
                )}>
                    <Wallet className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                            <Plus size={28} className="bg-white/20 p-1.5 rounded-xl" />
                            {initialData ? "Editar Transação" : "Novo Lançamento"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-white/70 text-xs font-medium mt-2">Registre entradas ou saídas do caixa pastoral.</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6 bg-white">
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                            <Tag size={12} className="text-slate-300" /> Descrição da Transação
                        </Label>
                        <Input
                            id="description"
                            {...register("description", { required: true })}
                            className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-emerald-500/20 focus:border-emerald-500 font-bold transition-all"
                            placeholder="Ex: Oferta de Batismo"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                <DollarSign size={12} className="text-slate-300" /> Valor (R$)
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                step="0.01"
                                {...register("value", { required: true, valueAsNumber: true })}
                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-emerald-500/20 focus:border-emerald-500 font-black tracking-tighter transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                <Calendar size={12} className="text-slate-300" /> Data
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                {...register("date", { required: true })}
                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-emerald-500/20 focus:border-emerald-500 font-bold transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                {typeValue === 'entrada' ? <ArrowUpCircle size={12} className="text-emerald-500" /> : <ArrowDownCircle size={12} className="text-stats-pink" />} Fluxo
                            </Label>
                            <Select value={typeValue} onValueChange={(v) => setValue("type", v as any)}>
                                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-black uppercase text-[10px] tracking-widest">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-50 p-1">
                                    <SelectItem value="entrada" className="rounded-xl font-bold text-xs text-emerald-500">Entrada (+)</SelectItem>
                                    <SelectItem value="saída" className="rounded-xl font-bold text-xs text-stats-pink">Saída (-)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                <FileText size={12} className="text-slate-300" /> Categoria
                            </Label>
                            <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-50 p-1">
                                    <SelectItem value="Dízimo" className="rounded-xl font-bold text-xs">Dízimo</SelectItem>
                                    <SelectItem value="Oferta" className="rounded-xl font-bold text-xs">Oferta</SelectItem>
                                    <SelectItem value="Taxa de Registro" className="rounded-xl font-bold text-xs">Taxa de Registro</SelectItem>
                                    <SelectItem value="Materiais" className="rounded-xl font-bold text-xs">Materiais</SelectItem>
                                    <SelectItem value="Manutenção" className="rounded-xl font-bold text-xs">Manutenção</SelectItem>
                                    <SelectItem value="Outros" className="rounded-xl font-bold text-xs">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-14 bg-slate-50 text-slate-400 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "flex-[2] h-14 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95",
                                typeValue === 'entrada' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-stats-pink shadow-stats-pink/20"
                            )}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                            ) : (
                                <Check size={20} />
                            )}
                            {isLoading ? "SALVANDO..." : "SALVAR LANÇAMENTO"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const FileText = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
);
