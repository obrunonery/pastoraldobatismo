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
    }, [initialData, reset, open]);

    const handleFormSubmit = async (data: any) => {
        console.log("[MODAL] Submitting form data:", data);
        // Garante que a data não seja null para o backend, se estiver vazia vira undefined
        const sanitized = {
            ...data,
            scheduledDate: data.scheduledDate || undefined
        };
        await onSubmit(sanitized);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Batismo" : "Novo Batismo"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="childName">Nome da Criança</Label>
                        <Input id="childName" {...register("childName", { required: true })} placeholder="Nome completo" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="parentNames">Pais</Label>
                            <Input id="parentNames" {...register("parentNames")} placeholder="Nome dos pais" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="godparentsNames">Padrinhos</Label>
                            <Input id="godparentsNames" {...register("godparentsNames")} placeholder="Nome dos padrinhos" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Gênero</Label>
                            <Select value={watch("gender")} onValueChange={(v) => setValue("gender", v as any, { shouldDirty: true, shouldValidate: true })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="m">Masculino</SelectItem>
                                    <SelectItem value="f">Feminino</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Idade</Label>
                            <Select value={watch("age") === 1 ? "adulto" : "criança"} onValueChange={(v) => setValue("age", v === "adulto" ? 1 : 0, { shouldDirty: true, shouldValidate: true })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="criança">Criança</SelectItem>
                                    <SelectItem value="adulto">Adulto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" {...register("city")} placeholder="Ex: Brasília" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="scheduledDate">Data do Batismo</Label>
                        <Input id="scheduledDate" type="date" {...register("scheduledDate")} />
                    </div>

                    <div className="space-y-2">
                        <Label>Celebrante</Label>
                        <Select
                            value={celebrantIdValue}
                            onValueChange={(v) => setValue("celebrantId", v, { shouldDirty: true, shouldValidate: true })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um celebrante..." />
                            </SelectTrigger>
                            <SelectContent>
                                {celebrants.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observations">Observações</Label>
                        <Input id="observations" {...register("observations")} placeholder="Notas adicionais..." />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-stats-cyan hover:bg-stats-cyan/90">
                            {isLoading ? "Salvando..." : "Salvar Batismo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
