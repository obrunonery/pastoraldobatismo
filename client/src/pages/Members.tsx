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
    const { data: members, isLoading, refetch } = trpc.pastoralMembers.list.useQuery();

    const createMutation = trpc.pastoralMembers.create.useMutation({
        onSuccess: () => {
            toast.success("Membro cadastrado com sucesso!");
            refetch();
        }
    });

    const updateMutation = trpc.pastoralMembers.update.useMutation({
        onSuccess: () => {
            toast.success("Membro atualizado!");
            refetch();
        }
    });

    const deleteMutation = trpc.pastoralMembers.delete.useMutation({
        onSuccess: () => {
            toast.success("Membro removido do sistema.");
            refetch();
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
                toast.error("Não é possível excluir este membro pois ele possui registros vinculados (escalas, atas ou batismos).");
            }
        }
    };

    const membersArray = Array.isArray(members) ? members : [];

    const filteredMembers = membersArray.filter((member: any) => {
        // Ocultar celebrantes permanentemente desta visualização
        if (member.role === "celebrante") return false;

        const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = activeCategory === "Todos" ||
            (activeCategory === "Coordenação" && (member.role === "coordenador" || member.role === "vice_coordenador")) ||
            (activeCategory === "Pastoral" && member.role === "membro") ||
            (activeCategory === "Secretaria" && member.role === "secretario") ||
            (activeCategory === "Financeiro" && member.role === "financeiro");

        return matchesSearch && matchesCategory;
    });

    const getRoleLabel = (role: string) => {
        const roles: any = {
            coordenador: "Coordenador(a)",
            vice_coordenador: "Vice-Coordenador(a)",
            membro: "Pastoral",
            secretario: "Secretário",
            financeiro: "Financeiro",
        };
        return roles[role] || role || "Membro";
    };

    const formatPartialDate = (dateStr: string) => {
        if (!dateStr) return null;
        if (dateStr.includes("/")) {
            const [d, m] = dateStr.split("/");
            const months = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];
            return `${d} de ${months[parseInt(m) - 1]}`;
        }
        return dateStr;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Equipe Pastoral</h1>
                    <p className="text-slate-500 mt-1 font-medium">Gestão de membros, celebrantes e voluntários</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewLayout("grid")}
                        className={cn(
                            "bg-white border-slate-200 font-bold gap-2 shadow-sm",
                            viewLayout === "grid" ? "text-stats-cyan border-stats-cyan/30" : "text-slate-400"
                        )}
                    >
                        <LayoutGrid size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewLayout("list")}
                        className={cn(
                            "bg-white border-slate-200 font-bold gap-2 shadow-sm",
                            viewLayout === "list" ? "text-stats-cyan border-stats-cyan/30" : "text-slate-400"
                        )}
                    >
                        <List size={16} />
                    </Button>
                    {(isAdmin || isSecretary) && (
                        <Button onClick={() => setModalOpen(true)} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-lg shadow-stats-cyan/20">
                            <Plus size={18} />
                            Novo Membro
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 border-none shadow-sm bg-slate-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                className="pl-10 bg-white border-none shadow-sm h-11 text-sm font-medium"
                                placeholder="Buscar por nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-400 pl-1">Função</Label>
                            <div className="grid grid-cols-1 gap-1">
                                {["Todos", "Coordenação", "Pastoral", "Secretaria", "Financeiro"].map((cat) => (
                                    <Button
                                        key={cat}
                                        variant="ghost"
                                        onClick={() => setActiveCategory(cat)}
                                        className={cn(
                                            "justify-start h-9 text-xs font-bold",
                                            cat === activeCategory ? "bg-white text-stats-cyan shadow-sm" : "text-slate-500"
                                        )}
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-3">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stats-cyan"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {viewLayout === "grid" ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {filteredMembers.map((member: any) => (
                                        <Card
                                            key={member.id}
                                            onClick={() => handleViewDetails(member)}
                                            className="border-none shadow-md hover:shadow-xl transition-all group overflow-hidden bg-white cursor-pointer"
                                        >
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                                            {member.photoUrl ? (
                                                                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User size={28} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-slate-800 leading-tight">{member.name}</h3>
                                                            <Badge variant="secondary" className="mt-1 text-[10px] font-black uppercase bg-slate-50 text-slate-400 border-none">
                                                                {getRoleLabel(member.role)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 text-xs font-medium text-gray-500">
                                                    <div className="flex flex-wrap gap-2">
                                                        {member.sacraments && typeof member.sacraments === 'string' && (
                                                            <>
                                                                {Object.entries(JSON.parse(member.sacraments))
                                                                    .filter(([_, value]) => value === true)
                                                                    .map(([key]) => (
                                                                        <Badge key={key} variant="outline" className="text-[8px] font-black uppercase text-slate-400 border-slate-100">
                                                                            {key === 'baptism' ? 'Batismo' : key === 'eucharist' ? 'Eucaristia' : key === 'confirmation' ? 'Crisma' : 'Matrimônio'}
                                                                        </Badge>
                                                                    ))
                                                                }
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {member.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-300" /> {member.email}</div>}
                                                        {member.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-300" /> {member.phone}</div>}
                                                        {member.address && <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-300" /> {member.address}</div>}
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                        {member.birthDate && (
                                                            <div className="flex items-center gap-2 text-stats-cyan font-bold">
                                                                <Cake size={14} /> {formatPartialDate(member.birthDate)}
                                                            </div>
                                                        )}
                                                        {member.maritalStatus === 'casado' && member.weddingDate && (
                                                            <div className="flex items-center gap-2 text-stats-pink font-bold">
                                                                <Heart size={14} /> {formatPartialDate(member.weddingDate)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {member.maritalStatus === 'casado' && member.spouseName && (
                                                        <div className="flex items-center gap-2 text-slate-400 italic">
                                                            <Users size={14} className="text-slate-300" /> Cônjuge: {member.spouseName}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-2 flex justify-between items-center border-t border-gray-50">
                                                    <Badge className={cn("text-[9px] uppercase font-black px-2",
                                                        member.status === 'ativo' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-50" : "bg-slate-50 text-slate-400 hover:bg-slate-50"
                                                    )}>
                                                        {member.status}
                                                    </Badge>
                                                    {(isAdmin || isSecretary) && (
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                                        <MoreHorizontal size={14} />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEdit(member)} className="gap-2 text-stats-cyan font-bold text-xs cursor-pointer">
                                                                        <Edit size={14} /> Editar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDelete(member.id)} className="gap-2 text-stats-pink font-bold text-xs cursor-pointer">
                                                                        <Trash2 size={14} /> Excluir
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-none shadow-sm overflow-hidden bg-white">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Membro</th>
                                                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Função</th>
                                                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Contato</th>
                                                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Aniversários</th>
                                                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMembers.map((member: any) => (
                                                    <tr
                                                        key={member.id}
                                                        onClick={() => handleViewDetails(member)}
                                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner overflow-hidden">
                                                                    {member.photoUrl ? (
                                                                        <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <User size={18} />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-800 text-sm">{member.name}</div>
                                                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{member.status}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-xs font-bold text-slate-500">
                                                            {getRoleLabel(member.role)}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-[11px] font-medium text-slate-500 space-y-0.5">
                                                                {member.email && <div className="flex items-center gap-1"><Mail size={12} className="text-slate-300" /> {member.email}</div>}
                                                                {member.phone && <div className="flex items-center gap-1"><Phone size={12} className="text-slate-300" /> {member.phone}</div>}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="space-y-0.5 text-[10px] font-bold">
                                                                {member.birthDate && <div className="text-stats-cyan flex items-center gap-1"><Cake size={12} /> {formatPartialDate(member.birthDate)}</div>}
                                                                {member.weddingDate && <div className="text-stats-pink flex items-center gap-1"><Heart size={12} /> {formatPartialDate(member.weddingDate)}</div>}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {(isAdmin || isSecretary) && (
                                                                <div onClick={(e) => e.stopPropagation()}>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                                                <MoreHorizontal size={14} />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => handleEdit(member)} className="gap-2 text-stats-cyan font-bold text-xs cursor-pointer">
                                                                                <Edit size={14} /> Editar
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleDelete(member.id)} className="gap-2 text-stats-pink font-bold text-xs cursor-pointer">
                                                                                <Trash2 size={14} /> Excluir
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <MemberFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedMember(null);
                }}
                onSubmit={async (data) => {
                    try {
                        console.log("selectedMember:", selectedMember);
                        console.log("ENVIANDO SUBMIT:", data);

                        if (selectedMember) {
                            console.log("ENVIANDO UPDATE ID:", selectedMember.id);
                            await updateMutation.mutateAsync({ id: selectedMember.id, ...data });
                        } else {
                            console.log("ENVIANDO CREATE");
                            await createMutation.mutateAsync({ ...data, id: Math.random().toString(36).substr(2, 9) });
                        }
                        setModalOpen(false);
                    } catch (error) {
                        console.error("Erro ao salvar:", error);
                        toast.error("Erro ao salvar os dados. Verifique o console.");
                    }
                }}
                initialData={selectedMember}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <MemberDetailsModal
                open={detailsModalOpen}
                onOpenChange={setDetailsModalOpen}
                member={detailsMember}
            />
        </div >
    );
}
