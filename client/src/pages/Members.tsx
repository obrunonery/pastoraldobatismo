import { Plus, User, Users, Mail, Phone, Search, LayoutGrid, List, Heart, MoreHorizontal, Edit, Trash2, MapPin, Cake } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/hooks/useRole";
import { MemberFormModal } from "@/components/MemberFormModal";
import { MemberDetailsModal } from "@/components/MemberDetailsModal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { motion, AnimatePresence } from "framer-motion";

export default function Members() {
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [detailsMember, setDetailsMember] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [viewLayout, setViewLayout] = useState<"grid" | "list">("grid");
    const { isSecretary, isAdmin } = useRole();
    const utils = trpc.useUtils();
    const { data: members, isLoading } = trpc.pastoralMembers.list.useQuery();

    const createMutation = trpc.pastoralMembers.create.useMutation({
        onSuccess: () => {
            toast.success("Membro cadastrado com sucesso!");
            utils.pastoralMembers.list.invalidate();
        }
    });

    const updateMutation = trpc.pastoralMembers.update.useMutation({
        onSuccess: () => {
            toast.success("Membro atualizado!");
            utils.pastoralMembers.list.invalidate();
        }
    });

    const deleteMutation = trpc.pastoralMembers.delete.useMutation({
        onSuccess: () => {
            toast.success("Membro removido do sistema.");
            utils.pastoralMembers.list.invalidate();
        }
    });

    const handleEdit = (member: any) => {
        setSelectedMember(member);
        setModalOpen(true);
    };

    const handleViewDetails = (member: any) => {
        setDetailsMember(member);
        setDetailsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja remover este membro?")) {
            try {
                await deleteMutation.mutateAsync({ id });
            } catch (error: any) {
                console.error("Erro ao deletar:", error);
                toast.error("Não é possível excluir este membro pois ele possui registros vinculados.");
            }
        }
    };

    const membersArray = Array.isArray(members) ? members : [];

    const filteredMembers = membersArray.filter((member: any) => {
        if (member.role === "celebrante") return false;

        const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const role = member.role?.toLowerCase();
        const matchesCategory = activeCategory === "Todos" ||
            (activeCategory === "Coordenação" && (role === "coordenador" || role === "vice_coordenador" || role === "admin")) ||
            (activeCategory === "Pastoral" && (role === "membro" || role === "member" || role === "pastoral")) ||
            (activeCategory === "Secretaria" && (role === "secretario" || role === "secretary")) ||
            (activeCategory === "Financeiro" && (role === "financeiro" || role === "finance"));

        return matchesSearch && matchesCategory;
    });

    const getRoleLabel = (role: string) => {
        const roles: any = {
            coordenador: "Coordenador(a)", COORDENADOR: "Coordenador(a)",
            vice_coordenador: "Vice-Coordenador(a)", VICE_COORDENADOR: "Vice-Coordenador(a)",
            membro: "Membro da Pastoral", MEMBER: "Membro da Pastoral",
            pastoral: "Membro da Pastoral", secretario: "Secretário(a)",
            SECRETARY: "Secretário(a)", financeiro: "Financeiro",
            FINANCE: "Financeiro", admin: "Administrador(a)",
            ADMIN: "Administrador(a)", celebrante: "Celebrante",
            CELEBRANTE: "Celebrante",
        };
        return roles[role] || role || "Membro";
    };

    return (
        <div className="space-y-8 bg-slate-50/30 min-h-screen p-2 sm:p-6 rounded-[40px]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Equipe Pastoral</h1>
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Gestão de Membros e Voluntários</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-stats-cyan transition-colors" size={16} />
                        <input
                            className="w-full md:w-64 h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-full text-xs font-bold shadow-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-stats-cyan/10 focus:border-stats-cyan/20 transition-all"
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {(isAdmin || isSecretary) && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="h-12 px-8 bg-stats-cyan text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-stats-cyan/20 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                        >
                            <Plus size={16} />
                            Novo Membro
                        </button>
                    )}
                </div>
            </div>

            {/* Categorias - Estilo Pílulas Flutuantes */}
            <div className="px-2">
                <div className="bg-slate-100/50 p-1.5 rounded-[24px] border border-slate-100 inline-flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                    {["Todos", "Coordenação", "Pastoral", "Secretaria", "Financeiro"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-6 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                                cat === activeCategory
                                    ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-100"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabela de Membros */}
            <div className="px-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-stats-cyan rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Carregando Integrantes...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-50 bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Foto</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Nome</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Função</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredMembers.map((member: any) => {
                                            return (
                                                <motion.tr
                                                    key={member.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                    onClick={() => handleViewDetails(member)}
                                                >
                                                    <td className="px-6 py-3">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-50 group-hover:ring-stats-cyan/20 transition-all">
                                                            {member.photoUrl ? (
                                                                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                    <User size={18} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-stats-cyan transition-colors">
                                                            {member.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                                                                {getRoleLabel(member.role)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        {member.phone ? (
                                                            <a
                                                                href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-600 transition-colors"
                                                            >
                                                                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                                    <Phone size={14} fill="currentColor" className="text-emerald-500" />
                                                                </div>
                                                                <span className="text-[11px] font-bold tracking-tight">{member.phone}</span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-300 italic">Não informado</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                            {(isAdmin || isSecretary) && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-stats-cyan hover:bg-stats-cyan/5 rounded-full">
                                                                            <MoreHorizontal size={18} />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-50 p-1">
                                                                        <DropdownMenuItem onClick={() => handleEdit(member)} className="gap-2 font-bold py-2 rounded-lg focus:bg-stats-cyan/5 focus:text-stats-cyan">
                                                                            <Edit size={14} /> Editar
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleDelete(member.id)} className="gap-2 font-bold py-2 rounded-lg text-rose-500 focus:bg-rose-50">
                                                                            <Trash2 size={14} /> Excluir
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!isLoading && filteredMembers.length === 0 && (
                    <div className="py-40 text-center space-y-6">
                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-sm border border-slate-50">
                            <Users className="text-slate-100" size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-slate-800 font-bold">Nenhum integrante encontrado</h3>
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Tente refinar sua busca ou categoria</p>
                        </div>
                    </div>
                )}
            </div>

            <MemberFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedMember(null);
                }}
                onSubmit={async (data) => {
                    try {
                        if (selectedMember) {
                            const { id, ...dataWithoutId } = data;
                            await updateMutation.mutateAsync({ id: selectedMember.id, ...dataWithoutId });
                        } else {
                            const { id, ...dataWithoutId } = data;
                            await createMutation.mutateAsync(dataWithoutId);
                        }
                        setModalOpen(false);
                    } catch (error) {
                        toast.error("Erro ao salvar os dados.");
                    }
                }}
                initialData={selectedMember}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <MemberDetailsModal
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
                member={detailsMember}
                onEdit={() => { setDetailsModalOpen(false); handleEdit(detailsMember); }}
                onDelete={() => { setDetailsModalOpen(false); handleDelete(detailsMember.id); }}
                hasAdminAccess={isAdmin || isSecretary}
            />
        </div>
    );
}
