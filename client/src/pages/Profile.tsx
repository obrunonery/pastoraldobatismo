import { useUser, useClerk } from "@clerk/clerk-react";
import {
    ChevronLeft,
    AtSign,
    Smartphone,
    MapPin,
    Camera,
    MinusCircle,
    X,
    Users,
    ChevronRight,
    Heart,
    Cake,
    Calendar,
    MessageCircle,
    Lock,
    ShieldCheck,
    HelpCircle,
    LogOut,
    ChevronDown,
    Monitor,
    Link2,
    Trash2
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { EditProfileModal, ChangePasswordModal, ActiveDevicesModal } from "@/components/CustomUserModals";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Profile() {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("personal");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isActiveDevicesOpen, setIsActiveDevicesOpen] = useState(false);
    const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
    const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);

    const { data: dbProfile, isLoading: dbLoading } = trpc.auth.getProfile.useQuery(
        { id: clerkUser?.id || "" },
        { enabled: !!clerkUser?.id }
    );

    if (!clerkLoaded || dbLoading || !clerkUser) return (
        <div className="h-full w-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-stats-cyan rounded-full animate-spin" />
        </div>
    );

    const formatPartialDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        if (dateStr.includes("/")) {
            const [d, m] = dateStr.split("/");
            const months = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];
            const monthIndex = parseInt(m) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                return `${d} de ${months[monthIndex]}`;
            }
        }
        return dateStr;
    };

    const getRoleLabel = (role: string | undefined) => {
        const roles: any = {
            ADMIN: "Administrador(a)",
            SECRETARY: "Secretário(a)",
            FINANCE: "Financeiro",
            MEMBER: "Membro da Pastoral",
            COORDENADOR: "Coordenador(a)",
            VICE_COORDENADOR: "Vice-Coordenador(a)",
            CELEBRANTE: "Celebrante",
        };
        return roles[role || ""] || "Membro";
    };

    const childrenData = dbProfile?.childrenData ? (typeof dbProfile.childrenData === 'string' ? JSON.parse(dbProfile.childrenData) : dbProfile.childrenData) : [];
    const hasFamilyData = (dbProfile?.maritalStatus && dbProfile.maritalStatus !== 'solteiro') || childrenData.length > 0;

    const { signOut } = useClerk();
    const handleLogout = async () => {
        try {
            await signOut();
            setLocation("/login");
        } catch (error) {
            console.error("Erro ao sair:", error);
            toast.error("Erro ao encerrar sessão.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto pb-20 pt-2 sm:pt-6"
        >
            {/* Header Sticky-ish */}
            <div className="flex items-center justify-between px-4 mb-10">
                <button
                    onClick={() => setLocation("/")}
                    className="p-2.5 hover:bg-white bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
                >
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-base font-bold text-slate-800">Meu Perfil</h1>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-stats-cyan font-black text-xs uppercase tracking-widest hover:brightness-90 transition-all active:scale-95"
                >
                    Editar
                </button>
            </div>

            {/* Profile Info Card */}
            <div className="px-6 flex items-center gap-6 mb-12">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 ring-4 ring-white shadow-2xl transition-transform group-hover:scale-105 duration-500">
                        <img
                            src={clerkUser.imageUrl}
                            alt={clerkUser.fullName || "User"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute -bottom-0.5 -left-0.5 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-stats-cyan transition-all"
                    >
                        <Camera size={16} />
                    </button>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                        {clerkUser.fullName || clerkUser.username || "Usuário"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            <MinusCircle size={14} className="text-slate-600" />
                            <span className="text-[11px] font-bold text-slate-600">{getRoleLabel(dbProfile?.role)}</span>
                        </div>
                        <button className="p-1 text-slate-300 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Design */}
            <Tabs
                defaultValue="personal"
                onValueChange={setActiveTab}
                className="w-full"
            >
                <div className="px-6 mb-8">
                    <TabsList className="w-full bg-slate-100/50 p-1 rounded-2xl border border-slate-100 shadow-inner">
                        <TabsTrigger
                            value="personal"
                            className="flex-1 rounded-[14px] font-bold text-xs py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md transition-all duration-300"
                        >
                            Informações
                        </TabsTrigger>
                        {hasFamilyData && (
                            <TabsTrigger
                                value="family"
                                className="flex-1 rounded-[14px] font-bold text-xs py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md transition-all duration-300"
                            >
                                Família
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    <TabsContent value="personal" key="personal" className="px-6 outline-none m-0 shadow-none border-none">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 space-y-9">
                                <InfoItem
                                    icon={AtSign}
                                    label="Email Institucional"
                                    value={dbProfile?.email || clerkUser.primaryEmailAddress?.emailAddress || "Não informado"}
                                />
                                <InfoItem
                                    icon={Smartphone}
                                    label="Contato WhatsApp"
                                    value={dbProfile?.phone || "Adicionar um número"}
                                    isPlaceholder={!dbProfile?.phone}
                                    isWhatsApp={!!dbProfile?.phone}
                                />
                                <InfoItem
                                    icon={MapPin}
                                    label="Localização"
                                    value={dbProfile?.address || "Adicionar uma localização"}
                                    isPlaceholder={!dbProfile?.address}
                                />
                                <InfoItem
                                    icon={Cake}
                                    label="Data de Nascimento"
                                    value={formatPartialDate(dbProfile?.birthDate) || "Adicionar data"}
                                    isPlaceholder={!dbProfile?.birthDate}
                                />
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="family" key="family" className="px-6 outline-none m-0">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 space-y-9">
                                <InfoItem
                                    icon={Heart}
                                    label="Status Conjugal"
                                    value={dbProfile?.maritalStatus || "Solteiro(a)"}
                                    subValue={dbProfile?.maritalStatus === 'casado' ? dbProfile?.spouseName : undefined}
                                />
                                {dbProfile?.weddingDate && (
                                    <InfoItem
                                        icon={Calendar}
                                        label="Aniversário de Casamento"
                                        value={formatPartialDate(dbProfile.weddingDate) || ""}
                                    />
                                )}
                                {childrenData.length > 0 ? (
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-4 px-1">
                                            <div className="h-px bg-slate-100 flex-1" />
                                            <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Filhos</span>
                                            <div className="h-px bg-slate-100 flex-1" />
                                        </div>
                                        {childrenData.map((child: any, idx: number) => (
                                            <InfoItem
                                                key={idx}
                                                icon={Users}
                                                label={child.name}
                                                value={formatPartialDate(child.birth) || "Data não informada"}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <InfoItem
                                        icon={Users}
                                        label="Filhos"
                                        value="Informação não cadastrada"
                                        isPlaceholder
                                    />
                                )}
                            </div>
                        </motion.div>
                    </TabsContent>

                </AnimatePresence>
            </Tabs>

            {/* Opção B: Seção de Suporte e Segurança */}
            <div className="px-6 space-y-8 mt-12 mb-20">
                {/* Suporte */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] px-1">Suporte</h3>
                    <div className="bg-white rounded-[32px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-[24px] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-stats-orange/10 rounded-xl flex items-center justify-center text-stats-orange">
                                    <HelpCircle size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700">Central de Ajuda</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suporte e Tira-dúvidas</p>
                                </div>
                            </div>
                            <span className="bg-slate-100 text-slate-400 text-[9px] font-black uppercase px-2 py-1 rounded-lg">Em breve</span>
                        </button>
                    </div>
                </div>

                {/* Segurança e Privacidade */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] px-1">Segurança e Privacidade</h3>
                    <div className="bg-white rounded-[32px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 space-y-1">

                        {/* Conexões Dropdown-like */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsConnectionsOpen(!isConnectionsOpen)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-[24px] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-stats-cyan/10 rounded-xl flex items-center justify-center text-stats-cyan">
                                        <Link2 size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-700">Conexões</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessões e Contas</p>
                                    </div>
                                </div>
                                <ChevronDown size={18} className={cn("text-slate-300 transition-transform", isConnectionsOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isConnectionsOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden px-2 pb-2"
                                    >
                                        <div className="bg-slate-50/50 rounded-[20px] p-1 flex flex-col gap-1">
                                            <button className="flex items-center justify-between p-3 hover:bg-white rounded-[16px] transition-all text-left">
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheck size={14} className="text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-500">Contas Conectadas</span>
                                                </div>
                                                <span className="text-[8px] font-black uppercase text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded">Breve</span>
                                            </button>
                                            <button
                                                onClick={() => setIsActiveDevicesOpen(true)}
                                                className="flex items-center justify-between p-3 hover:bg-white rounded-[16px] transition-all text-left group/sub"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Monitor size={14} className="text-slate-400 group-hover/sub:text-stats-cyan" />
                                                    <span className="text-xs font-bold text-slate-500 group-hover/sub:text-slate-700">Dispositivos Ativos</span>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Alterar Senha */}
                        {clerkUser?.passwordEnabled && (
                            <button
                                onClick={() => setIsChangePasswordModalOpen(true)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-[24px] transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-stats-cyan group-hover:text-white transition-all">
                                        <Lock size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-700">Alterar Senha</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atualizar Credenciais</p>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </button>
                        )}

                        {/* Zona de Perigo */}
                        <button
                            onClick={() => setIsDeleteAccountOpen(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-[24px] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                                    <Trash2 size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-red-600">Zona de Perigo</p>
                                    <p className="text-[10px] font-black uppercase text-red-300 tracking-widest">Excluir Minha Conta</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-red-200" />
                        </button>
                    </div>
                </div>

                {/* Botão de Logout */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-10 py-4 bg-stats-cyan text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-2xl shadow-stats-cyan/30 active:scale-95 border-b-4 border-blue-600/20"
                    >
                        <LogOut size={16} className="text-white/80" />
                        Sair da Conta
                    </button>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onOpenChange={setIsChangePasswordModalOpen}
            />

            <ActiveDevicesModal
                isOpen={isActiveDevicesOpen}
                onOpenChange={setIsActiveDevicesOpen}
            />

            <AlertDialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                <AlertDialogContent className="rounded-[32px] border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-slate-800">Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                            Esta ação não pode ser desfeita diretamente pelo aplicativo. Para sua segurança, a exclusão definitiva deve ser solicitada à administração da pastoral.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3 mt-6">
                        <AlertDialogCancel className="rounded-full border-none bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest px-8 h-12">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                toast.error("Para excluir sua conta, acesse o painel de segurança principal da paróquia.");
                            }}
                            className="rounded-full bg-stats-cyan hover:brightness-110 text-white font-black text-xs uppercase tracking-[0.2em] px-8 shadow-xl shadow-stats-cyan/20 transition-all active:scale-95 h-12"
                        >
                            Prosseguir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
    subValue,
    isPlaceholder = false,
    isWhatsApp = false
}: {
    icon: any,
    label: string,
    value: string,
    subValue?: string,
    isPlaceholder?: boolean,
    isWhatsApp?: boolean
}) {
    const content = (
        <div className="flex items-center gap-6 group">
            <div className={cn(
                "w-12 h-12 rounded-[20px] bg-slate-50 border border-slate-100/50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl group-hover:border-white",
                isWhatsApp ? "text-emerald-500 group-hover:text-emerald-600" : "text-slate-400 group-hover:text-stats-cyan"
            )}>
                <Icon size={20} className="transition-colors duration-500" />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] leading-none mb-1">
                    {label}
                </span>
                <span className={cn(
                    "text-[13px] font-bold transition-all truncate",
                    isPlaceholder ? "text-slate-400" : "text-slate-700",
                    isWhatsApp && "text-emerald-600"
                )}>
                    {value}
                </span>
                {subValue && (
                    <span className="text-[11px] font-bold text-slate-400 truncate whitespace-nowrap overflow-hidden">
                        {subValue}
                    </span>
                )}
            </div>
        </div>
    );

    if (isWhatsApp) {
        return (
            <a
                href={`https://wa.me/55${value.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline"
            >
                {content}
            </a>
        );
    }

    return content;
}
