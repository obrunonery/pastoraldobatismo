import { useForm, useFieldArray } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Camera, Upload, X, User, Heart, Baby, MapPin, Phone, Mail, Calendar, Briefcase, Activity, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MemberFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function MemberFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}: MemberFormModalProps) {
    const { register, handleSubmit, reset, setValue, watch, control } = useForm({
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            role: "membro",
            status: "ativo",
            maritalStatus: "solteiro",
            spouseName: "",
            address: "",
            birthDate: "",
            weddingDate: "",
            photoUrl: "",
            hasChildren: false,
            sacraments: { baptism: false, eucharist: false, confirmation: false, marriage: false },
            childrenData: []
        }
    });

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoPreview = watch("photoUrl");

    const { fields, append, remove } = useFieldArray({
        control,
        name: "childrenData"
    });

    const roleValue = watch("role");
    const statusValue = watch("status");
    const maritalStatus = watch("maritalStatus");
    const hasChildren = watch("hasChildren");

    useEffect(() => {
        if (open) {
            if (initialData) {
                const data = { ...initialData };
                if (typeof data.sacraments === 'string') data.sacraments = JSON.parse(data.sacraments) || {};
                if (typeof data.childrenData === 'string') data.childrenData = JSON.parse(data.childrenData) || [];
                if (data.role) data.role = data.role.toLowerCase();
                reset(data);
            } else {
                reset({
                    name: "",
                    email: "",
                    phone: "",
                    role: "membro",
                    status: "ativo",
                    maritalStatus: "solteiro",
                    spouseName: "",
                    address: "",
                    birthDate: "",
                    weddingDate: "",
                    photoUrl: "",
                    hasChildren: false,
                    sacraments: { baptism: false, eucharist: false, confirmation: false, marriage: false },
                    childrenData: []
                });
            }
        }
    }, [initialData, reset, open]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setValue("photoUrl", data.url, { shouldDirty: true });
            }
        } catch (error) {
            console.error("Erro no upload:", error);
        } finally {
            setUploading(false);
        }
    };

    const formatPhone = (value: string) => {
        const v = value.replace(/\D/g, "").slice(0, 11);
        if (v.length > 7) {
            return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
        } else if (v.length > 2) {
            return `(${v.slice(0, 2)}) ${v.slice(2)}`;
        }
        return v;
    };

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const DateSelector = ({ label, fieldName, icon: Icon }: { label: string, fieldName: string, icon?: any }) => {
        const currentVal = watch(fieldName as any) || "";
        const [d, m] = currentVal.includes("/") ? currentVal.split("/") : ["", ""];

        return (
            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                    {Icon && <Icon size={12} className="text-slate-300" />} {label}
                </Label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-1 flex items-center">
                        <Select value={d} onValueChange={(v) => setValue(fieldName as any, `${v}/${m || '01'}`, { shouldDirty: true })}>
                            <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 text-xs font-bold h-10 w-full px-3">
                                <SelectValue placeholder="Dia" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {days.map(day => <SelectItem key={day} value={day} className="text-xs font-bold">{day}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                        <Select value={m} onValueChange={(v) => setValue(fieldName as any, `${d || '01'}/${v}`, { shouldDirty: true })}>
                            <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0 text-xs font-black uppercase text-stats-cyan h-10 w-full px-3">
                                <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {monthNames.map((month, i) => (
                                    <SelectItem key={month} value={String(i + 1).padStart(2, '0')} className="text-xs font-black uppercase">{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        );
    };

    const handleFormSubmit = async (data: any) => {
        const submissionData = {
            ...data,
            role: data.role?.toLowerCase(),
            status: data.status?.toLowerCase(),
            sacraments: JSON.stringify(data.sacraments),
            childrenData: JSON.stringify(data.childrenData)
        };
        await onSubmit(submissionData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden flex flex-col">
                <div className="bg-stats-cyan p-8 text-white relative overflow-hidden shrink-0">
                    <User className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                            <Plus size={28} className="bg-white/20 p-1.5 rounded-xl" />
                            {initialData ? "Editar Membro" : "Novo Membro da Pastoral"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-white/70 text-xs font-medium mt-2">Preencha as informações para manter a base de dados atualizada.</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-8">
                        {/* Foto do Membro */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-slate-50 border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={56} className="text-slate-200" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 h-10 w-10 bg-stats-cyan text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-white"
                                    disabled={uploading}
                                >
                                    <Camera size={18} />
                                </Button>
                                {photoPreview && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => setValue("photoUrl", "")}
                                        className="absolute -top-1 -right-1 h-8 w-8 rounded-full shadow-lg border-4 border-white"
                                    >
                                        <X size={14} />
                                    </Button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Avatar do Perfil</p>
                        </div>

                        {/* Informações Básicas */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-slate-800">
                                <div className="w-1.5 h-4 bg-stats-cyan rounded-full" />
                                <h3 className="text-[12px] font-black uppercase tracking-widest">Identificação</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                        <User size={12} className="text-slate-300" /> Nome Completo
                                    </Label>
                                    <Input id="name" {...register("name", { required: true })} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-bold transition-all" placeholder="Ex: João da Silva" />
                                </div>
                                <DateSelector label="Aniversário" fieldName="birthDate" icon={Calendar} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                        <Mail size={12} className="text-slate-300" /> Email Pessoal
                                    </Label>
                                    <Input id="email" type="email" {...register("email")} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-bold transition-all" placeholder="joao@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                        <Phone size={12} className="text-slate-300" /> WhatsApp / Contato
                                    </Label>
                                    {(() => {
                                        const { onChange, ...rest } = register("phone");
                                        return (
                                            <Input
                                                id="phone"
                                                {...rest}
                                                onChange={(e) => {
                                                    const formatted = formatPhone(e.target.value);
                                                    e.target.value = formatted;
                                                    onChange(e);
                                                }}
                                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-bold transition-all"
                                                placeholder="(00) 00000-0000"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                    <MapPin size={12} className="text-slate-300" /> Localização / Residência
                                </Label>
                                <Input id="address" {...register("address")} className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-bold transition-all" placeholder="Rua, número, bairro, cidade" />
                            </div>
                        </div>

                        {/* Atribuições e Status */}
                        <div className="space-y-6 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-800">
                                <div className="w-1.5 h-4 bg-stats-pink rounded-full" />
                                <h3 className="text-[12px] font-black uppercase tracking-widest">Pastoral e Função</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                        <Briefcase size={12} className="text-slate-300" /> Nível de Atribuição
                                    </Label>
                                    <Select value={roleValue} onValueChange={(v) => setValue("role", v)}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent focus:ring-stats-cyan/20 focus:border-stats-cyan font-black uppercase text-[10px] tracking-widest transition-all">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-50 p-1">
                                            <SelectItem value="coordenador" className="rounded-xl font-bold text-xs">Coordenador(a)</SelectItem>
                                            <SelectItem value="vice_coordenador" className="rounded-xl font-bold text-xs">Vice-Coordenador(a)</SelectItem>
                                            <SelectItem value="membro" className="rounded-xl font-bold text-xs">Membro da Pastoral</SelectItem>
                                            <SelectItem value="secretario" className="rounded-xl font-bold text-xs">Secretário(a)</SelectItem>
                                            <SelectItem value="financeiro" className="rounded-xl font-bold text-xs">Financeiro / Tesoureiro</SelectItem>
                                            <SelectItem value="admin" className="rounded-xl font-bold text-xs">Administrador(a)</SelectItem>
                                            <SelectItem value="celebrante" className="rounded-xl font-bold text-xs">Celebrante</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1 flex items-center gap-2">
                                        <Activity size={12} className="text-slate-300" /> Estado de Atividade
                                    </Label>
                                    <Select value={statusValue} onValueChange={(v) => setValue("status", v)}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-black uppercase text-[10px] tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-50 p-1">
                                            <SelectItem value="ativo" className="rounded-xl font-bold text-xs text-emerald-500">Ativo</SelectItem>
                                            <SelectItem value="inativo" className="rounded-xl font-bold text-xs text-stats-pink">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Família */}
                        <div className="space-y-6 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-800">
                                <div className="w-1.5 h-4 bg-stats-purple rounded-full" />
                                <h3 className="text-[12px] font-black uppercase tracking-widest">Núcleo Familiar</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Estado Civil</Label>
                                    <Select value={maritalStatus} onValueChange={(v) => setValue("maritalStatus", v)}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-50 p-1">
                                            <SelectItem value="solteiro" className="rounded-xl font-bold text-xs">Solteiro(a)</SelectItem>
                                            <SelectItem value="casado" className="rounded-xl font-bold text-xs">Casado(a)</SelectItem>
                                            <SelectItem value="divorciado" className="rounded-xl font-bold text-xs">Divorciado(a)</SelectItem>
                                            <SelectItem value="viuvo" className="rounded-xl font-bold text-xs">Viúvo(a)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <AnimatePresence>
                                    {maritalStatus === "casado" && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-2">
                                            <Label htmlFor="spouseName" className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Nome do Cônjuge</Label>
                                            <Input id="spouseName" {...register("spouseName")} className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold text-sm" placeholder="Nome do esposo(a)" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {maritalStatus === "casado" && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <DateSelector label="Aniversário de Casamento" fieldName="weddingDate" icon={Heart} />
                                </motion.div>
                            )}

                            {/* Filhos */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox id="hasChildren" checked={hasChildren} onCheckedChange={(v) => setValue("hasChildren", !!v)} className="w-5 h-5 rounded-lg border-slate-200" />
                                        <Label htmlFor="hasChildren" className="font-bold text-slate-700">Tem Filhos?</Label>
                                    </div>
                                    {hasChildren && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => append({ name: "", birth: "" })} className="gap-2 h-10 px-4 rounded-xl text-stats-cyan bg-stats-cyan/5 text-[10px] font-black uppercase tracking-widest border border-stats-cyan/10">
                                            <Plus size={16} /> Adicionar Filho
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {hasChildren && fields.map((field, index) => (
                                        <motion.div key={field.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-slate-50/50 rounded-[28px] border border-slate-100/50 relative group">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Nome da Criança</Label>
                                                    <Input {...register(`childrenData.${index}.name` as const)} placeholder="Nome" className="h-11 rounded-xl bg-white border-transparent shadow-sm font-bold text-sm" />
                                                </div>
                                                <div className="relative">
                                                    <DateSelector label="Aniversário do Filho" fieldName={`childrenData.${index}.birth`} icon={Baby} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute -top-1 -right-1 h-8 w-8 text-stats-pink hover:bg-stats-pink/5 rounded-full">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sacramentos */}
                        <div className="space-y-6 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-800">
                                <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                                <h3 className="text-[12px] font-black uppercase tracking-widest">Caminhada Cristã</h3>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-emerald-50/30 rounded-[32px] border border-emerald-100/50 shadow-inner">
                                {[
                                    { id: "baptism", label: "Batismo" },
                                    { id: "eucharist", label: "Eucaristia" },
                                    { id: "confirmation", label: "Crisma" },
                                    { id: "marriage", label: "Matrimônio" }
                                ].map((sac) => (
                                    <div key={sac.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm group hover:shadow-md transition-shadow">
                                        <Checkbox
                                            id={`sac-${sac.id}`}
                                            checked={watch(`sacraments.${sac.id}` as any)}
                                            onCheckedChange={(v) => setValue(`sacraments.${sac.id}` as any, !!v)}
                                            className="w-5 h-5 rounded-lg border-slate-200"
                                        />
                                        <Label htmlFor={`sac-${sac.id}`} className="text-xs font-black uppercase tracking-tighter text-slate-600 cursor-pointer">{sac.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rodapé fixo ou final */}
                        <div className="pt-10 flex gap-4">
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
                                    <Check size={20} />
                                )}
                                {isLoading ? "SALVANDO..." : "CONFIRMAR DADOS"}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
