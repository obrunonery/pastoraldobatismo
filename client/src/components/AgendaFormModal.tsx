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
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                title: "",
                date: new Date().toISOString().split('T')[0],
                observations: ""
            });
        }
    }, [initialData, reset, open]);

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Evento" : "Novo Evento"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título do Evento</Label>
                        <Input id="title" {...register("title", { required: true })} placeholder="Ex: Treinamento de Padrinhos" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input id="date" type="date" {...register("date", { required: true })} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observations">Observações</Label>
                        <Input id="observations" {...register("observations")} />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-stats-cyan hover:bg-stats-cyan/90">
                            {isLoading ? "Salvando..." : "Salvar Evento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
