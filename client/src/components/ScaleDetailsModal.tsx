
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Unlock, Users, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/clerk-react";
import { useRole } from "@/hooks/useRole";

interface Member {
    id: number;
    userId: string;
    userName: string;
    userRole: string;
    ceremonyRole: string;
    presenceStatus: "confirmado" | "ausente" | "pendente";
}

interface ScaleDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    baptism: {
        id: number;
        childName: string;
        date: string;
    };
    members: Member[];
    onConfirm: (id: number, status: "confirmado" | "ausente" | "pendente") => void;
    onManageScale: () => void;
}

export function ScaleDetailsModal({
    open,
    onOpenChange,
    baptism,
    members,
    onConfirm,
    onManageScale
}: ScaleDetailsModalProps) {
    const { user } = useUser();
    const { isAdmin, isSecretary } = useRole();
    const canManageSchedules = isAdmin || isSecretary;

    const celebrante = members.find(m => m.userRole === "CELEBRANTE" || m.ceremonyRole === "Celebrante");
    const pastoralMembers = members.filter(m => m.userRole !== "CELEBRANTE" && m.ceremonyRole !== "Celebrante");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-stats-cyan text-white relative">
                    <div className="flex items-center gap-3 opacity-70 mb-2">
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Escala do Batismo</span>
                    </div>
                    <DialogTitle className="text-2xl font-black">{baptism.childName}</DialogTitle>
                    <p className="text-white/80 font-bold text-sm mt-1">
                        {(() => {
                            const d = new Date((baptism.date || "") + "T12:00:00");
                            return isNaN(d.getTime())
                                ? "Data não disponível"
                                : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                        })()}
                    </p>

                    {canManageSchedules && (
                        <Button
                            onClick={() => {
                                onOpenChange(false);
                                onManageScale();
                            }}
                            size="icon"
                            variant="ghost"
                            className="absolute top-8 right-8 text-white hover:bg-white/20 rounded-xl"
                        >
                            <Settings2 size={20} />
                        </Button>
                    )}
                </DialogHeader>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto bg-white">
                    {/* Celebrante */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Celebrante</p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            {celebrante ? (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-stats-orange text-white flex items-center justify-center font-bold shadow-sm">
                                            {celebrante.userName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 tracking-tight">{celebrante.userName}</span>
                                            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">Celebrante</span>
                                        </div>
                                    </div>
                                    <PresenceControls
                                        member={celebrante}
                                        isMe={celebrante.userId === user?.id}
                                        canManage={canManageSchedules}
                                        onConfirm={onConfirm}
                                    />
                                </>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Nenhum celebrante atribuído.</p>
                            )}
                        </div>
                    </div>

                    {/* Membros da Pastoral */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipe de Apoio</p>
                        <div className="space-y-3">
                            {pastoralMembers.length > 0 ? (
                                pastoralMembers.map(member => (
                                    <div key={member.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-stats-cyan/10 text-stats-cyan flex items-center justify-center font-bold border border-stats-cyan/20">
                                                {member.userName.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 tracking-tight">{member.userName}</span>
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">{member.ceremonyRole || "Equipe"}</span>
                                            </div>
                                        </div>
                                        <PresenceControls
                                            member={member}
                                            isMe={member.userId === user?.id}
                                            canManage={canManageSchedules}
                                            onConfirm={onConfirm}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-medium">Nenhum membro escalado.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PresenceControls({
    member,
    isMe,
    canManage,
    onConfirm
}: {
    member: Member;
    isMe: boolean;
    canManage: boolean;
    onConfirm: (id: number, status: "confirmado" | "ausente" | "pendente") => void
}) {
    if (!isMe && !canManage) {
        return (
            <Badge className={cn(
                "text-[9px] font-black px-2 py-1 rounded-lg border-none shadow-sm",
                member.presenceStatus === "confirmado" ? "bg-stats-cyan text-white" :
                    member.presenceStatus === "ausente" ? "bg-stats-pink text-white" :
                        "bg-slate-200 text-slate-500"
            )}>
                {member.presenceStatus.toUpperCase()}
            </Badge>
        );
    }

    if (member.presenceStatus === "pendente") {
        return (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    onClick={() => onConfirm(member.id, "confirmado")}
                    className="bg-stats-cyan text-[10px] font-black h-8 px-3 rounded-xl shadow-md shadow-stats-cyan/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Check size={14} strokeWidth={3} />
                </Button>
                <Button
                    size="sm"
                    onClick={() => onConfirm(member.id, "ausente")}
                    variant="outline"
                    className="text-stats-pink border-slate-200 bg-white text-[10px] font-black h-8 px-3 rounded-xl hover:bg-stats-pink/5 hover:border-stats-pink/30 hover:scale-105 active:scale-95 transition-all"
                >
                    <X size={14} strokeWidth={3} />
                </Button>
            </div>
        );
    }

    return (
        <div
            onClick={() => canManage && onConfirm(member.id, "pendente")}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 bg-white shadow-sm transition-all",
                canManage ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default",
                member.presenceStatus === "confirmado" ? "text-stats-cyan" : "text-stats-pink"
            )}
        >
            {member.presenceStatus === "confirmado" ? (
                <span className="text-[10px] font-black flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> CONFIRMADO
                </span>
            ) : (
                <span className="text-[10px] font-black flex items-center gap-1">
                    <X size={12} strokeWidth={3} /> AUSENTE
                </span>
            )}
            {canManage && <Unlock size={10} className="text-slate-300" />}
        </div>
    );
}
