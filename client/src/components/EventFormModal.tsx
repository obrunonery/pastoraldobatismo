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
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface EventFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isLoading?: boolean;
}

export function EventFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}: EventFormModalProps) {
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: initialData || {
            title: "",
            date: new Date().toISOString().split('T')[0],
            time: "",
            location: "",
            description: "",
            status: "Agendado"
        }
    });

    const statusValue = watch("status");

    useEffect(() => {
        if (open) {
            reset(initialData || {
                title: "",
                date: new Date().toISOString().split('T')[0],
                time: "",
                location: "",
                description: "",
                status: "Agendado"
            });
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
                    <DialogTitle>{initialData ? "Editar Evento" : "Novo Evento"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className={cn(errors.title && "text-rose-500")}>
                            Título do Evento <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            {...register("title", { required: "O título do evento é obrigatório" })}
                            placeholder="Ex: Mutirão de Limpeza"
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
                            <Label htmlFor="date">Data</Label>
                            <Input id="date" type="date" {...register("date", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Hora (opcional)</Label>
                            <Input id="time" type="time" {...register("time")} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Local</Label>
                        <Input id="location" {...register("location")} placeholder="Ex: Salão Paroquial" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={statusValue} onValueChange={(v) => setValue("status", v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Previsto">Previsto</SelectItem>
                                <SelectItem value="Agendado">Agendado</SelectItem>
                                <SelectItem value="Confirmado">Confirmado</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <textarea
                            id="description"
                            {...register("description")}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Detalhes sobre o evento..."
                        />
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
