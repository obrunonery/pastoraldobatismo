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
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { FileDown, FileUp, X, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

interface MeetingFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function MeetingFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}: MeetingFormModalProps) {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState(initialData?.fileUrl || "");
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: members } = trpc.pastoralMembers.list.useQuery();

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: initialData || {
            title: "",
            meetingDate: new Date().toISOString().split('T')[0],
            meetingTime: "19:30",
            location: "Salão Paroquial",
            fileUrl: ""
        }
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset(initialData);
                setFileUrl(initialData.fileUrl || "");
                setFileName(initialData.fileUrl ? "Documento Armazenado" : "");
            } else {
                reset({
                    title: "",
                    meetingDate: new Date().toISOString().split('T')[0],
                    meetingTime: "19:30",
                    location: "Salão Paroquial",
                    fileUrl: ""
                });
                setFileUrl("");
                setFileName("");
            }
        }
    }, [initialData, reset, open]);

    const currentType = watch("type");

    useEffect(() => {
        if (currentType !== "Reunião Presencial (Administrativa)" && fileUrl) {
            setFileUrl("");
            setFileName("");
            setValue("fileUrl", "");
        }
    }, [currentType, fileUrl, setValue]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Por favor, envie apenas arquivos em formato PDF.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            const response = await axios.post("/api/upload", formData);
            const { url, originalName } = response.data;
            setFileUrl(url);
            setFileName(originalName);
            setValue("fileUrl", url);
            toast.success("Documento carregado com sucesso!");
        } catch (error) {
            console.error("Erro ao subir arquivo:", error);
            toast.error("Falha ao carregar o documento. Tente novamente.");
        } finally {
            setUploading(false);
        }
    };

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Reunião" : "Nova Reunião"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className={cn(errors.title && "text-rose-500")}>
                            Título / Assunto <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            {...register("title", { required: "O título da reunião é obrigatório" })}
                            placeholder="Ex: Planejamento Mensal"
                            className={cn(errors.title && "border-rose-300 focus-visible:ring-rose-500 bg-rose-50/30")}
                        />
                        {errors.title && (
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                <AlertCircle size={10} />
                                {errors.title.message as string}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Reunião</Label>
                            <select
                                id="type"
                                {...register("type")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Selecione o tipo</option>
                                <option value="Reunião Presencial (Administrativa)">Reunião Presencial (Administrativa)</option>
                                <option value="Reunião Presencial (Formação)">Reunião Presencial (Formação)</option>
                                <option value="Reunião Presencial (Convivência)">Reunião Presencial (Convivência)</option>
                                <option value="Reunião Online (Formação)">Reunião Online (Formação)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responsibleId">Responsável</Label>
                            <select
                                id="responsibleId"
                                {...register("responsibleId")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Selecione o responsável</option>
                                {members?.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="meetingDate">Data da Reunião</Label>
                            <Input id="meetingDate" type="date" {...register("meetingDate", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meetingTime">Horário</Label>
                            <Input id="meetingTime" type="time" {...register("meetingTime")} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Local</Label>
                        <Input id="location" {...register("location")} placeholder="Ex: Salão Paroquial, Sala 2" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Pauta / Observações (Opcional)</Label>
                        <textarea
                            id="content"
                            {...register("content")}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Descreva brevemente os assuntos tratados..."
                        />
                    </div>

                    {watch("type") === "Reunião Presencial (Administrativa)" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <Label className="flex items-center gap-2">
                                Documento da Ata (PDF)
                                <Badge variant="outline" className="text-[9px] font-bold uppercase border-stats-cyan text-stats-cyan">Obrigatório para Administrativa</Badge>
                            </Label>
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer",
                                    fileUrl
                                        ? "bg-stats-cyan/5 border-stats-cyan/30"
                                        : "bg-slate-50 border-slate-200 hover:border-stats-cyan/50 hover:bg-white"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".pdf"
                                />

                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-cyan"></div>
                                        <span className="text-xs font-bold text-slate-500 animate-pulse uppercase tracking-widest">Enviando Documento...</span>
                                    </>
                                ) : fileUrl ? (
                                    <>
                                        <div className="w-12 h-12 bg-stats-cyan/20 rounded-2xl flex items-center justify-center text-stats-cyan">
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-stats-cyan">Arquivo Pronto!</p>
                                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5">
                                                {fileName || "documento_vinculado.pdf"}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl uppercase tracking-tighter"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFileUrl("");
                                                setFileName("");
                                                setValue("fileUrl", "");
                                            }}
                                        >
                                            Remover e trocar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                            <FileUp size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black text-slate-700">Clique para subir a Ata</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest">Apenas arquivos PDF são aceitos</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || uploading} className="bg-stats-cyan hover:bg-stats-cyan/90">
                            {(isLoading || uploading) ? "Processando..." : (initialData ? "Atualizar Reunião" : "Salvar Reunião")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
