import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Mail, Phone, Shield, Edit2, Trash2, Heart, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useRole } from "@/hooks/useRole";
import { MemberFormModal } from "@/components/MemberFormModal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Home() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const { isAdmin } = useRole();

    const { data: members, refetch, isLoading: isQueryLoading } = trpc.pastoralMembers.list.useQuery();

    const membersArray = Array.isArray(members) ? members : [];
    const isLoading = isQueryLoading;

    const createMutation = trpc.pastoralMembers.create.useMutation({
        onSuccess: () => { toast.success("Membro adicionado!"); refetch(); },
    });

    const updateMutation = trpc.pastoralMembers.update.useMutation({
        onSuccess: () => { toast.success("Membro atualizado!"); refetch(); },
    });

    const deleteMutation = trpc.pastoralMembers.delete.useMutation({
        onSuccess: () => { toast.success("Membro removido!"); refetch(); },
    });

    const handleOpenModal = (member?: any) => {
        setEditingMember(member || null);
        setModalOpen(true);
    };

    const celebrants = membersArray.filter(m => (m as any).role === "celebrante" || (m as any).role === "CELEBRANTE");
    const coreTeam = membersArray.filter(m => (m as any).role !== "celebrante" && (m as any).role !== "CELEBRANTE");

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Equipe Pastoral</h1>
                    <p className="text-slate-600 mt-1">Gestão de membros, voluntários e celebrantes</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => handleOpenModal()} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90">
                        <Plus size={18} />
                        Novo Membro
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-cyan"></div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Core Team List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <Input className="h-12 pl-12 rounded-2xl bg-white border-none shadow-sm" placeholder="Buscar membros..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coreTeam.map(member => (
                            <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-stats-cyan" />
                                <CardContent className="p-5 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stats-cyan/10 text-stats-cyan flex items-center justify-center font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 leading-tight">{member.name}</h4>
                                                <div className="flex gap-1 items-center mt-1">
                                                    <p className="text-[10px] font-bold uppercase text-stats-cyan tracking-wider">{member.role}</p>
                                                    {member.role === 'ADMIN' && <Shield size={10} className="text-stats-orange" />}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isAdmin && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400" onClick={() => handleOpenModal(member)}>
                                                        <Edit2 size={12} />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-300 hover:text-red-500" onClick={() => deleteMutation.mutate({ id: member.id })}>
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs font-medium text-gray-500">
                                        {member.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-300" /> {member.email}</div>}
                                        {member.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-300" /> {member.phone}</div>}
                                    </div>

                                    <div className="pt-2 flex justify-between items-center border-t border-gray-50">
                                        <Badge variant={member.status === 'ativo' ? 'success' : 'secondary'} className="text-[9px] uppercase font-black px-2">
                                            {member.status}
                                        </Badge>
                                        <span className="text-[10px] text-gray-400">Desde out/23</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Celebrants Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-lg bg-[#404e67] text-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-3">
                                <Shield className="text-stats-orange" fill="currentColor" />
                                Celebrantes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {celebrants.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-stats-orange text-white flex items-center justify-center font-bold">
                                            {m.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold">{m.name}</span>
                                    </div>
                                    <Heart size={14} className="text-red-400 group-hover:scale-125 transition-transform" />
                                </div>
                            ))}
                            {celebrants.length === 0 && <p className="text-xs text-white/40 text-center py-4">Nenhum celebrante cadastrado.</p>}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-stats-green/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-stats-green rounded-full flex items-center justify-center text-white shadow-lg">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-800">Recrutamento</p>
                                    <p className="text-xs text-gray-500 font-medium">Convide novos voluntários para a pastoral.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <MemberFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initialData={editingMember}
                onSubmit={async (data) => {
                    if (editingMember) await updateMutation.mutateAsync({ id: editingMember.id, ...data });
                    else await createMutation.mutateAsync(data);
                }}
                isLoading={createMutation.status === 'pending' || updateMutation.status === 'pending'}
            />
        </div>
    );
}
