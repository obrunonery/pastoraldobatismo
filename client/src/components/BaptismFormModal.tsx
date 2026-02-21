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
import { trpc } from "@/lib/trpc";
import { Droplet, User, Users, Calendar, MapPin, Info, Check, X, Plus, Baby, Church } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaptismFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function BaptismFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}: BaptismFormModalProps) {
    const { data: members } = trpc.pastoralMembers.list.useQuery();
    const celebrants = Array.isArray(members)
        ? members.filter((m: any) =>
            (m.role === "ADMIN" || m.role === "CELEBRANTE" || m.role === "celebrante") &&
            m.name?.trim().toLowerCase() !== "bruno nery"
        ) : [];

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: initialData || {
            childName: "",
            parentNames: "",
            godparentsNames: "",
            status: "Solicitado",
            scheduledDate: new Date().toISOString().split('T')[0],
            celebrantId: "",
            observations: "",
            gender: "m",
            age: 0,
            city: ""
        }
    });

    const statusValue = watch("status");
    const celebrantIdValue = watch("celebrantId");
    const genderValue = watch("gender");

    const formatDateForInput = (dateStr: string | null | undefined) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "";
            return d.toISOString().split('T')[0];
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    ...initialData,
                    scheduledDate: formatDateForInput(initialData.scheduledDate || initialData.date),
                    celebrantId: initialData.celebrantId || ""
                });
            } else {
                reset({
                    childName: "",
                    parentNames: "",
                    godparentsNames: "",
                    status: "Solicitado",
                    scheduledDate: new Date().toISOString().split('T')[0],
                    celebrantId: "",
                    observations: "",
                    gender: "m",
                    age: 0,
                    city: ""
                });
            }
        }
    }, [initialData, reset, open]);

    const handleFormSubmit = async (data: any) => {
        const sanitized = {
            ...data,
            scheduledDate: data.scheduledDate || undefined
        };
        await onSubmit(sanitized);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-[40px] border-none shadow-2xl p-0 overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto">
                <div className="bg-stats-cyan p-8 text-white relative overflow-hidden">
                    <Droplet className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" fill="currentColor" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                            <Plus size={28} className="bg-white/20 p-1.5 rounded-xl" />
                            {initialData ? "Editar Batismo" : "Novo Registro de Batismo"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-white/70 text-xs font-medium mt-2">Gestão de sacramentos e escalas de celebrantes.</p>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-8 bg-white">
                    {/* Identificação */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-800">
                            <div className="w-1.5 h-4 bg-stats-cyan rounded-full" />
                            <h3 className="text-[12px] font-black uppercase tracking-widest">A Criança / Batizando</h3>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="childName" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                <User size={12} className="text-slate-300" /> Nome Completo
                            </Label>
                            <Input
                                id="childName"
                                {...register("childName", { required: true })}
                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-bold transition-all"
                                placeholder="Nome como consta na certidão"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <Baby size={12} className="text-slate-300" /> Gênero
                                </Label>
                                <Select value={genderValue} onValueChange={(v) => setValue("gender", v as any)}>
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-50 p-1">
                                        <SelectItem value="m" className="rounded-xl font-bold text-xs">Masculino</SelectItem>
                                        <SelectItem value="f" className="rounded-xl font-bold text-xs">Feminino</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <Info size={12} className="text-slate-300" /> Faixa Etária
                                </Label>
                                <Select
                                    value={watch("age") === 1 ? "adulto" : "criança"}
                                    onValueChange={(v) => setValue("age", v === "adulto" ? 1 : 0)}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-50 p-1">
                                        <SelectItem value="criança" className="rounded-xl font-bold text-xs">Criança (Até 7 anos)</SelectItem>
                                        <SelectItem value="adulto" className="rounded-xl font-bold text-xs">Adulto / Catecúmeno</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                <MapPin size={12} className="text-slate-300" /> Cidade de Residência
                            </Label>
                            <Input
                                id="city"
                                {...register("city")}
                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-bold transition-all"
                                placeholder="Ex: Brasília - DF"
                            />
                        </div>
                    </div>

                    {/* Família e Padrinhos */}
                    <div className="space-y-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-slate-800">
                            <div className="w-1.5 h-4 bg-stats-pink rounded-full" />
                            <h3 className="text-[12px] font-black uppercase tracking-widest">Família e Padrinhos</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="parentNames" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <Users size={12} className="text-slate-300" /> Pais
                                </Label>
                                <Input
                                    id="parentNames"
                                    {...register("parentNames")}
                                    className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-sm"
                                    placeholder="Nome dos pais"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="godparentsNames" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <Users size={12} className="text-slate-300" /> Padrinhos
                                </Label>
                                <Input
                                    id="godparentsNames"
                                    {...register("godparentsNames")}
                                    className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-sm"
                                    placeholder="Nome dos padrinhos"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Escala */}
                    <div className="space-y-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-slate-800">
                            <div className="w-1.5 h-4 bg-stats-purple rounded-full" />
                            <h3 className="text-[12px] font-black uppercase tracking-widest">Programação e Escala</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="scheduledDate" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <Calendar size={12} className="text-slate-300" /> Data Prevista
                                </Label>
                                <Input
                                    id="scheduledDate"
                                    type="date"
                                    {...register("scheduledDate")}
                                    className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <Droplet size={12} className="text-slate-300" /> Status do Processo
                                </Label>
                                <Select
                                    value={statusValue}
                                    onValueChange={(v) => setValue("status", v as any)}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-50 p-1">
                                        <SelectItem value="Solicitado" className="rounded-xl font-bold text-xs">Solicitado</SelectItem>
                                        <SelectItem value="Em Triagem" className="rounded-xl font-bold text-xs">Em Triagem</SelectItem>
                                        <SelectItem value="Agendado" className="rounded-xl font-bold text-xs">Agendado</SelectItem>
                                        <SelectItem value="Concluído" className="rounded-xl font-bold text-xs">Concluído</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <Church size={12} className="text-slate-300" /> Celebrante
                                </Label>
                                <Select
                                    value={celebrantIdValue}
                                    onValueChange={(v) => setValue("celebrantId", v)}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-black uppercase text-[10px] tracking-widest">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-50 p-1">
                                        {celebrants.length > 0 ? (
                                            celebrants.map((c: any) => (
                                                <SelectItem key={c.id} value={String(c.id)} className="rounded-xl font-bold text-xs">{c.name}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-[10px] font-black text-slate-300 uppercase italic">Nenhum celebrante encontrado</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="observations" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                <Info size={12} className="text-slate-300" /> Observações Internas
                            </Label>
                            <textarea
                                id="observations"
                                {...register("observations")}
                                className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-medium text-sm transition-all resize-none"
                                placeholder="Notas sobre documentação, transferências ou casos especiais..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-14 bg-slate-50 text-slate-400 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Voltar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] h-14 bg-stats-cyan text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-stats-cyan/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                            ) : (
                                <Check size={24} />
                            )}
                            {isLoading ? "SALVANDO..." : "CONFIRMAR REGISTRO"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
