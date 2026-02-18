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

interface RequestFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading?: boolean;
}

export function RequestFormModal({
    open,
    onOpenChange,
    onSubmit,
    isLoading
}: RequestFormModalProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            title: "",
            type: "request",
            urgency: "medium",
            description: ""
        }
    });

    const typeValue = watch("type");
    const urgencyValue = watch("urgency");

    useEffect(() => {
        if (open) {
            reset({
                title: "",
                type: "request",
                urgency: "medium",
                description: ""
            });
        }
    }, [reset, open]);

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Nova Solicitação</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" {...register("title", { required: true })} placeholder="O que precisa ser feito?" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={typeValue} onValueChange={(v) => setValue("type", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="request">Pedido</SelectItem>
                                    <SelectItem value="idea">Ideia</SelectItem>
                                    <SelectItem value="purchase">Compra</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Urgência</Label>
                            <Select value={urgencyValue} onValueChange={(v) => setValue("urgency", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baixa</SelectItem>
                                    <SelectItem value="medium">Média</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" {...register("description")} placeholder="Mais detalhes..." />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-stats-cyan hover:bg-stats-cyan/90">
                            {isLoading ? "Enviando..." : "Criar Solicitação"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
