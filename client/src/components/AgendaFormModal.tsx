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
import { useEffect } from "react";
import { Calendar, Tag, FileText, Check, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgendaFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function AgendaFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}: AgendaFormModalProps) {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: initialData || {
            title: "",
            date: new Date().toISOString().split('T')[0],
            observations: ""
        }
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
            } else {
                reset({
                    title: "",
                    date: new Date().toISOString().split('T')[0],
                    observations: ""
                });
            }
        }
    }, [initialData, reset, open]);

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-stats-purple p-8 text-white relative overflow-hidden">
                    <Calendar className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                            <Plus size={28} className="bg-white/20 p-1.5 rounded-xl" />
                            {initialData ? "Editar Evento" : "Novo Evento Geral"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-white/70 text-xs font-medium mt-2">Agende atividades, treinamentos ou avisos importantes.</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6 bg-white">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                            <Tag size={12} className="text-slate-300" /> Título do Evento
                        </Label>
                        <Input
                            id="title"
                            {...register("title", { required: true })}
                            className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-purple/20 focus:border-stats-purple font-bold transition-all"
                            placeholder="Ex: Treinamento de Padrinhos"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                            <Calendar size={12} className="text-slate-300" /> Data do Evento
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            {...register("date", { required: true })}
                            className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-purple/20 focus:border-stats-purple font-bold transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observations" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                            <FileText size={12} className="text-slate-300" /> Observações (Opcional)
                        </Label>
                        <textarea
                            id="observations"
                            {...register("observations")}
                            className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-purple/20 focus:border-stats-purple font-medium text-sm transition-all resize-none"
                            placeholder="Detalhes adicionais sobre o preparo ou requisitos..."
                        />
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
                            className="flex-[2] h-14 bg-stats-purple text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-stats-purple/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                            ) : (
                                <Check size={20} />
                            )}
                            {isLoading ? "SALVANDO..." : "SALVAR EVENTO"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
