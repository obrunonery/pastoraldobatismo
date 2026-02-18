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
        // Converter valor para número caso venha como string
        const formattedData = {
            ...data,
            value: Number(data.value)
        };
        await onSubmit(formattedData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" {...register("description", { required: true })} placeholder="Ex: Oferta de Batismo" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Valor (R$)</Label>
                            <Input id="value" type="number" step="0.01" {...register("value", { required: true, valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Data</Label>
                            <Input id="date" type="date" {...register("date", { required: true })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={watch("type")} onValueChange={(v) => setValue("type", v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entrada">Entrada (+)</SelectItem>
                                    <SelectItem value="saída">Saída (-)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dízimo">Dízimo</SelectItem>
                                    <SelectItem value="Oferta">Oferta</SelectItem>
                                    <SelectItem value="Taxa de Registro">Taxa de Registro</SelectItem>
                                    <SelectItem value="Materiais">Materiais</SelectItem>
                                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                                    <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-stats-green hover:bg-stats-green/90">
                            {isLoading ? "Salvando..." : "Salvar Transação"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
