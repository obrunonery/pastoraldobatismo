import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus, UserMinus, Shield, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScaleManagerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    baptismId: number;
    currentScale: any[];
}

export function ScaleManagerModal({
    open,
    onOpenChange,
    baptismId,
    currentScale
}: ScaleManagerModalProps) {
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<string>("Equipe");

    const utils = trpc.useUtils();
    const { data: members } = trpc.pastoralMembers.list.useQuery();

    const addMutation = trpc.dashboard.addToScale.useMutation({
        onSuccess: () => {
            toast.success("Membro adicionado à escala!");
            utils.dashboard.getSummary.invalidate();
            utils.dashboard.getPresenceScale.invalidate();
            setSelectedUserId("");
        },
        onError: (err) => {
            toast.error("Erro ao adicionar: " + err.message);
        }
    });

    const removeMutation = trpc.dashboard.removeFromScale.useMutation({
        onSuccess: () => {
            toast.success("Membro removido da escala.");
            utils.dashboard.getSummary.invalidate();
            utils.dashboard.getPresenceScale.invalidate();
        },
        onError: (err) => {
            toast.error("Erro ao remover: " + err.message);
        }
    });

    const handleAdd = () => {
        if (!selectedUserId) {
            toast.error("Selecione um membro.");
            return;
        }

        // Verifica se já está na escala
        if (currentScale.some(s => s.userId === selectedUserId)) {
            toast.error("Este membro já está nesta escala.");
            return;
        }

        addMutation.mutate({
            baptismId,
            userId: selectedUserId,
            role: selectedRole
        });
    };

    const handleRemove = (id: number) => {
        if (confirm("Deseja remover este membro da escala?")) {
            removeMutation.mutate({ id });
        }
    };

    // Filtra membros que já não estão na escala
    const availableMembers = Array.isArray(members)
        ? members.filter(m => !currentScale.some(s => s.userId === m.id))
        : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-3xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-stats-cyan/10 text-stats-cyan flex items-center justify-center">
                            <UsersIcon size={20} />
                        </div>
                        Gestão da Equipe
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Lista Atual */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Equipe Escalada</Label>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {currentScale.length > 0 ? currentScale.map((s) => (
                                <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-stats-cyan/20 text-stats-cyan flex items-center justify-center font-bold text-xs">
                                            {s.userName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 leading-tight">{s.userName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.role}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleRemove(s.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <UserMinus size={16} />
                                    </Button>
                                </div>
                            )) : (
                                <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-xs font-bold text-slate-300">Nenhum membro escalado</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Adicionar Novo */}
                    <div className="space-y-4">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Adicionar à Escala</Label>

                        <div className="space-y-3">
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 shadow-sm focus:ring-stats-cyan/20">
                                    <SelectValue placeholder="Selecione um membro..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl">
                                    {availableMembers.map((m: any) => (
                                        <SelectItem key={m.id} value={m.id} className="rounded-xl">
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 shadow-sm focus:ring-stats-cyan/20">
                                    <SelectValue placeholder="Função na escala..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-xl">
                                    <SelectItem value="Celebrante" className="rounded-xl">Celebrante</SelectItem>
                                    <SelectItem value="Equipe" className="rounded-xl">Apoio / Equipe</SelectItem>
                                    <SelectItem value="Música" className="rounded-xl">Música</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleAdd}
                                disabled={addMutation.isPending || !selectedUserId}
                                className="w-full h-12 bg-stats-cyan hover:bg-stats-cyan/90 text-white font-black rounded-2xl gap-2 shadow-lg shadow-stats-cyan/20 transition-all active:scale-95"
                            >
                                <UserPlus size={18} />
                                {addMutation.isPending ? "ADICIONANDO..." : "ADICIONAR À ESCALA"}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full font-bold text-slate-400 hover:text-slate-600 rounded-2xl"
                    >
                        FECHAR
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
