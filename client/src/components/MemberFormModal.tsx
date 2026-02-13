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
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            role: "membro",
            status: "ativo"
        }
    });

    const roleValue = watch("role");
    const statusValue = watch("status");

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                name: "",
                email: "",
                phone: "",
                role: "membro",
                status: "ativo"
            });
        }
    }, [initialData, reset, open]);

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Membro" : "Novo Membro"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" {...register("name", { required: true })} placeholder="Ex: João da Silva" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} placeholder="joao@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone / WhatsApp</Label>
                            <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Função</Label>
                            <Select
                                value={roleValue}
                                onValueChange={(v) => setValue("role", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="celebrante">Celebrante</SelectItem>
                                    <SelectItem value="membro">Membro da Pastoral</SelectItem>
                                    <SelectItem value="secretario">Secretário</SelectItem>
                                    <SelectItem value="financeiro">Tesoureiro (Finanças)</SelectItem>
                                    <SelectItem value="coordenador">Coordenador</SelectItem>
                                    <SelectItem value="apoio">Apoio</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={statusValue}
                                onValueChange={(v) => setValue("status", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Membro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
