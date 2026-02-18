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
import { Plus, Trash2, Camera, Upload, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

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
                if (typeof data.sacraments === 'string') data.sacraments = JSON.parse(data.sacraments);
                if (typeof data.childrenData === 'string') data.childrenData = JSON.parse(data.childrenData);
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

    const DateSelector = ({ label, fieldName }: { label: string, fieldName: string }) => {
        const currentVal = watch(fieldName as any) || "";
        const [d, m] = currentVal.includes("/") ? currentVal.split("/") : ["", ""];

        return (
            <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 ml-1">{label}</Label>
                <div className="flex gap-1.5 p-1 bg-slate-50/50 rounded-xl border border-slate-100 ring-offset-background focus-within:ring-2 focus-within:ring-stats-cyan/20 transition-all">
                    <Select value={d} onValueChange={(v) => setValue(fieldName as any, `${v}/${m || '01'}`, { shouldDirty: true })}>
                        <SelectTrigger className="w-[65px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-xs font-bold">
                            <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[60px]">
                            {days.map(day => <SelectItem key={day} value={day} className="text-xs">{day}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="w-[1px] h-4 bg-slate-200 self-center" />
                    <Select value={m} onValueChange={(v) => setValue(fieldName as any, `${d || '01'}/${v}`, { shouldDirty: true })}>
                        <SelectTrigger className="flex-1 h-8 border-none bg-transparent shadow-none focus:ring-0 text-xs font-black uppercase text-stats-cyan">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthNames.map((month, i) => (
                                <SelectItem key={month} value={String(i + 1).padStart(2, '0')} className="text-xs font-bold">{month}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    };

    const handleFormSubmit = async (data: any) => {
        // Stringify complex fields for DB
        console.log("MemberFormModal handlesubmit data:", data);
        const submissionData = {
            ...data,
            role: data.role?.toLowerCase(),
            status: data.status?.toLowerCase(),
            sacraments: JSON.stringify(data.sacraments),
            childrenData: JSON.stringify(data.childrenData)
        };
        console.log("submissionData formatted:", submissionData);
        await onSubmit(submissionData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Membro" : "Novo Membro"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
                    <div className="flex flex-col items-center justify-center space-y-4 pb-4 border-b">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-slate-300" />
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
                                className="absolute bottom-0 right-0 rounded-full shadow-md hover:scale-110 transition-transform"
                                disabled={uploading}
                            >
                                <Camera size={16} />
                            </Button>
                            {photoPreview && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setValue("photoUrl", "")}
                                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-md"
                                >
                                    <X size={12} />
                                </Button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        <p className="text-[10px] font-black uppercase text-slate-400">Foto do Membro</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" {...register("name", { required: true })} placeholder="Ex: João da Silva" />
                        </div>
                        <DateSelector label="Data de Nascimento" fieldName="birthDate" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} placeholder="joao@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone / WhatsApp</Label>
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
                                        placeholder="(00) 00000-0000"
                                    />
                                );
                            })()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço Residencial</Label>
                        <Input id="address" {...register("address")} placeholder="Rua, número, bairro, cidade" />
                    </div>
                    <div className="space-y-2">
                        <Label>Função</Label>
                        <Select value={roleValue} onValueChange={(v) => setValue("role", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="coordenador">Coordenador(a)</SelectItem>
                                <SelectItem value="vice_coordenador">Vice-Coordenador(a)</SelectItem>
                                <SelectItem value="membro">Membro da Pastoral</SelectItem>
                                <SelectItem value="secretario">Secretário</SelectItem>
                                <SelectItem value="financeiro">Tesoureiro (Finanças)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Estado Civil</Label>
                            <Select value={maritalStatus} onValueChange={(v) => setValue("maritalStatus", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                    <SelectItem value="casado">Casado(a)</SelectItem>
                                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {maritalStatus === "casado" && (
                            <div className="space-y-2 animate-in slide-in-from-right duration-300">
                                <Label htmlFor="spouseName">Nome do Cônjuge</Label>
                                <Input id="spouseName" {...register("spouseName")} placeholder="Nome do esposo(a)" />
                            </div>
                        )}
                    </div>

                    {maritalStatus === "casado" && (
                        <div className="animate-in slide-in-from-bottom duration-300">
                            <DateSelector label="Data de Casamento" fieldName="weddingDate" />
                        </div>
                    )}

                    <div className="space-y-4 border-t pt-4">
                        <Label className="text-base font-bold">Checklist de Sacramentos</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="sac-baptism" checked={watch("sacraments.baptism")} onCheckedChange={(v) => setValue("sacraments.baptism", !!v)} />
                                <Label htmlFor="sac-baptism" className="text-xs font-medium">Batismo</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="sac-eucharist" checked={watch("sacraments.eucharist")} onCheckedChange={(v) => setValue("sacraments.eucharist", !!v)} />
                                <Label htmlFor="sac-eucharist" className="text-xs font-medium">1ª Eucaristia</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="sac-confirmation" checked={watch("sacraments.confirmation")} onCheckedChange={(v) => setValue("sacraments.confirmation", !!v)} />
                                <Label htmlFor="sac-confirmation" className="text-xs font-medium">Crisma</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="sac-marriage" checked={watch("sacraments.marriage")} onCheckedChange={(v) => setValue("sacraments.marriage", !!v)} />
                                <Label htmlFor="sac-marriage" className="text-xs font-medium">Matrimônio</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox id="hasChildren" checked={hasChildren} onCheckedChange={(v) => setValue("hasChildren", !!v)} />
                                <Label htmlFor="hasChildren" className="font-bold">Tem Filhos?</Label>
                            </div>
                            {hasChildren && (
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", birth: "" })} className="gap-1 h-8 text-[10px] font-black">
                                    <Plus size={14} /> ADICIONAR FILHO
                                </Button>
                            )}
                        </div>

                        {hasChildren && fields.map((field, index) => (
                            <div key={field.id} className="p-4 bg-slate-50 rounded-xl animate-in fade-in duration-300 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3 space-y-1">
                                        <Label className="text-[10px] uppercase font-black text-slate-400">Nome do Filho</Label>
                                        <Input {...register(`childrenData.${index}.name` as const)} placeholder="Nome" className="h-10 bg-white" />
                                    </div>
                                    <div className="flex items-end justify-end">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-10 w-10 text-stats-pink hover:text-stats-pink hover:bg-stats-pink/5">
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-slate-400 pl-1">Data de Nascimento (Dia/Mês)</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={watch(`childrenData.${index}.birth` as const)?.split('/')[0] || ""}
                                            onValueChange={(v) => {
                                                const current = watch(`childrenData.${index}.birth` as const) || "";
                                                const month = current.split('/')[1] || "01";
                                                setValue(`childrenData.${index}.birth` as const, `${v}/${month}`);
                                            }}
                                        >
                                            <SelectTrigger className="w-[80px] bg-white">
                                                <SelectValue placeholder="Dia" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {days.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select
                                            value={watch(`childrenData.${index}.birth` as const)?.split('/')[1] || ""}
                                            onValueChange={(v) => {
                                                const current = watch(`childrenData.${index}.birth` as const) || "";
                                                const day = current.split('/')[0] || "01";
                                                setValue(`childrenData.${index}.birth` as const, `${day}/${v}`);
                                            }}
                                        >
                                            <SelectTrigger className="flex-1 bg-white">
                                                <SelectValue placeholder="Mês" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month, i) => (
                                                    <SelectItem key={month} value={String(i + 1).padStart(2, '0')}>{month}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-stats-cyan hover:bg-stats-cyan/90">
                            {isLoading ? "Salvando..." : "Salvar Membro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
