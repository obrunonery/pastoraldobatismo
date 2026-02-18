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

interface CommunicationFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
    initialData?: any;
}

export function CommunicationFormModal({
    open,
    onOpenChange,
    onSubmit,
    isLoading,
    initialData
}: CommunicationFormModalProps) {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            title: "",
            content: "",
            date: new Date().toISOString().split('T')[0],
            fileUrl: ""
        }
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    title: initialData.title || "",
                    content: initialData.content || "",
                    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    fileUrl: initialData.fileUrl || ""
                });
            } else {
                reset({
                    title: "",
                    content: "",
                    date: new Date().toISOString().split('T')[0],
                    fileUrl: ""
                });
            }
        }
    }, [reset, open, initialData]);

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Comunicado" : "Nova Comunicação"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título / Assunto</Label>
                        <Input id="title" {...register("title", { required: true })} placeholder="Ex: Aviso sobre o Curso de Pais" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data de Publicação</Label>
                        <Input id="date" type="date" {...register("date", { required: true })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo da Mensagem</Label>
                        <textarea
                            id="content"
                            {...register("content", { required: true })}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Descreva o conteúdo..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fileUrl">Link do Arquivo / Arte (opcional)</Label>
                        <Input id="fileUrl" {...register("fileUrl")} placeholder="Ex: Link para imagem no Google Drive" />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-stats-cyan hover:bg-stats-cyan/90">
                            {isLoading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Criar Comunicação")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
