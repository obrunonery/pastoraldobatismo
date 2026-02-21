import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { User as UserIcon, Lock, Camera, Mail, Phone, MapPin, Cake, Monitor, Smartphone, Laptop, ShieldCheck, Globe, Trash2 } from "lucide-react";

interface ActiveDevicesModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ActiveDevicesModal({ isOpen, onOpenChange }: ActiveDevicesModalProps) {
    const { user } = useUser();
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSessions = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const userSessions = await user.getSessions();
            setSessions(userSessions);
        } catch (error) {
            console.error("Erro ao buscar sessões:", error);
            toast.error("Erro ao carregar dispositivos ativos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSessions();
        }
    }, [isOpen, user]);

    const handleRevoke = async (sessionId: string) => {
        try {
            const sessionToRevoke = sessions.find(s => s.id === sessionId);
            if (sessionToRevoke) {
                await sessionToRevoke.revoke();
                toast.success("Sessão encerrada com sucesso!");
                fetchSessions();
            }
        } catch (error) {
            console.error("Erro ao revogar sessão:", error);
            toast.error("Não foi possível encerrar a sessão.");
        }
    };

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType?.toLowerCase()) {
            case "mobile": return <Smartphone size={18} />;
            case "tablet": return <Smartphone size={18} />;
            case "desktop": return <Monitor size={18} />;
            default: return <Laptop size={18} />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] rounded-[32px] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <div className="bg-slate-100 p-2 rounded-xl">
                            <ShieldCheck className="text-slate-600" size={20} />
                        </div>
                        Dispositivos Ativos
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Buscando sessões...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "p-5 rounded-3xl border transition-all flex items-start justify-between gap-4",
                                        session.status === "active" ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50 border-transparent opacity-60"
                                    )}
                                >
                                    <div className="flex gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                            session.status === "active" ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                                        )}>
                                            {getDeviceIcon(session.latestActivity?.deviceType)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-slate-800 text-sm">
                                                    {session.latestActivity?.browserName || "Navegador"} no {session.latestActivity?.osName || "Sistema"}
                                                </p>
                                                {session.id === user?.lastSignInAt && (
                                                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Atual</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <Globe size={12} />
                                                    <span className="text-[11px] font-bold">
                                                        {session.latestActivity?.ipAddress} {session.latestActivity?.city ? `• ${session.latestActivity.city}` : ""}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                    Ativo em: {new Date(session.lastActiveAt).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {session.id !== user?.lastSignInAt && session.status === "active" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRevoke(session.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold text-[10px] uppercase h-9"
                                        >
                                            Encerrar
                                        </Button>
                                    )}
                                </div>
                            ))}

                            {sessions.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 font-bold text-sm">Nenhuma sessão encontrada.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full rounded-full bg-stats-cyan hover:brightness-110 text-white font-black text-xs uppercase tracking-[0.2em] h-12 shadow-xl shadow-stats-cyan/20 transition-all active:scale-95"
                    >
                        Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}

interface EditProfileModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ isOpen, onOpenChange }: EditProfileModalProps) {
    const { user } = useUser();
    const utils = trpc.useUtils();
    const [isUpdating, setIsUpdating] = useState(false);

    const { data: dbProfile } = trpc.auth.getProfile.useQuery(
        { id: user?.id || "" },
        { enabled: !!user?.id }
    );

    const updateProfile = trpc.pastoralMembers.update.useMutation({
        onSuccess: () => {
            toast.success("Perfil atualizado com sucesso!");
            utils.auth.getProfile.invalidate();
            onOpenChange(false);
        },
        onError: (error) => {
            console.error("Erro ao atualizar perfil:", error);
            toast.error("Erro ao salvar alterações no banco de dados.");
        }
    });

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        birthDate: ""
    });

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: dbProfile?.phone || "",
                address: dbProfile?.address || "",
                birthDate: dbProfile?.birthDate || ""
            });
        }
    }, [user, dbProfile, isOpen]);

    const handleSave = async () => {
        if (!user) return;
        setIsUpdating(true);
        try {
            // Atualiza no Clerk (Nome/Sobrenome)
            await user.update({
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            // Atualiza no DB local
            updateProfile.mutate({
                id: user.id,
                phone: formData.phone,
                address: formData.address,
                birthDate: formData.birthDate
            });
        } catch (error) {
            console.error("Erro ao atualizar Clerk:", error);
            toast.error("Erro ao atualizar informações básicas.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <div className="bg-slate-100 p-2 rounded-xl">
                            <UserIcon className="text-slate-600" size={20} />
                        </div>
                        Ajustes de Perfil
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-5 py-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sobrenome</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp</Label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Endereço</Label>
                        <Input
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Data de Nascimento</Label>
                        <Input
                            value={formData.birthDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                            placeholder="DD/MM/AAAA"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full font-black text-xs uppercase tracking-widest text-slate-400"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isUpdating || updateProfile.isPending}
                        className="rounded-full bg-stats-cyan hover:brightness-110 text-white font-black text-xs uppercase tracking-[0.2em] px-8 shadow-xl shadow-stats-cyan/20 transition-all active:scale-95"
                    >
                        {isUpdating ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface ChangePasswordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({ isOpen, onOpenChange }: ChangePasswordModalProps) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [isUpdating, setIsUpdating] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChangePassword = async () => {
        if (!user) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("As novas senhas não coincidem!");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("A nova senha deve ter pelo menos 8 caracteres.");
            return;
        }

        setIsUpdating(true);
        try {
            if (!user.passwordEnabled) {
                toast.error("Sua conta utiliza login social (Google). Use as configurações de segurança da sua conta Google para gerenciar sua senha.");
                onOpenChange(false);
                return;
            }

            await user.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Senha alterada com sucesso!");
            onOpenChange(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            console.error("Erro ao alterar senha:", error);
            const errorMessage = error.errors?.[0]?.longMessage || "Erro ao alterar senha. Verifique sua senha atual.";
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <div className="bg-slate-100 p-2 rounded-xl">
                            <Lock className="text-slate-600" size={20} />
                        </div>
                        Alterar Minha Senha
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    {!user?.passwordEnabled ? (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl space-y-2 text-center py-8">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Login Social Detectado</p>
                            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                Você acessa o sistema através do Google. <br />
                                Para criar uma senha própria ou gerenciar acessos, <br />
                                utilize as configurações de segurança da sua conta.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 border-amber-200 text-amber-800 font-bold rounded-xl"
                                onClick={() => toast.info("Acesse myaccount.google.com para gerenciar sua segurança.")}
                            >
                                Informações de Segurança
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha Atual</Label>
                                <Input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nova Senha</Label>
                                <Input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar Nova Senha</Label>
                                <Input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full font-black text-xs uppercase tracking-widest text-slate-400"
                    >
                        Cancelar
                    </Button>
                    {user?.passwordEnabled && (
                        <Button
                            onClick={handleChangePassword}
                            disabled={isUpdating}
                            className="rounded-full bg-stats-cyan hover:brightness-110 text-white font-black text-xs uppercase tracking-[0.2em] px-8 shadow-xl shadow-stats-cyan/20 transition-all active:scale-95"
                        >
                            {isUpdating ? "Alterando..." : "Alterar Senha"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
