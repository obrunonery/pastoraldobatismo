import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Calendar, FileText, Share2, Search, Edit, Trash2, ChevronRight, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CommunicationFormModal } from "@/components/CommunicationFormModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Communication() {
    const { isAdmin, isSecretary } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedComm, setSelectedComm] = useState<any>(null);
    const [search, setSearch] = useState("");

    const utils = trpc.useUtils();
    const { data: communicationsResponse, isLoading } = trpc.communication.list.useQuery();
    const communications = Array.isArray(communicationsResponse) ? communicationsResponse : [];

    const createMutation = trpc.communication.create.useMutation({
        onSuccess: () => {
            toast.success("Comunicado publicado!");
            utils.communication.list.invalidate();
            setModalOpen(false);
        }
    });

    const updateMutation = trpc.communication.update.useMutation({
        onSuccess: () => {
            toast.success("Comunicado atualizado!");
            utils.communication.list.invalidate();
            setModalOpen(false);
            setSelectedComm(null);
        }
    });

    const deleteMutation = trpc.communication.delete.useMutation({
        onSuccess: () => {
            toast.success("Comunicado removido.");
            utils.communication.list.invalidate();
        }
    });

    const filteredComms = communications.filter((c: any) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.content.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (comm: any) => {
        setSelectedComm(comm);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Deseja excluir este comunicado?")) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Comunicação</h1>
                    <p className="text-slate-600 mt-1 font-medium">Espaço para incluir artes e vídeos da pastoral do batismo</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <Button onClick={() => { setSelectedComm(null); setModalOpen(true); }} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
                        <Plus size={18} />
                        Nova arte
                    </Button>
                )}
            </div>

            <div className="relative max-w-2xl mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-14 pl-12 pr-6 rounded-2xl bg-white border-none shadow-sm text-sm focus-visible:ring-stats-cyan/30 font-medium"
                    placeholder="Pesquisar comunicados e avisos..."
                />
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-cyan"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredComms.map((comm: any) => (
                    <Card key={comm.id} className="border-none shadow-sm hover:shadow-lg transition-all group overflow-hidden bg-white flex flex-col h-full">
                        <CardHeader className="p-4 pb-2 relative space-y-2 shrink-0">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-stats-cyan/10 text-stats-cyan flex items-center justify-center shrink-0">
                                        <Megaphone size={14} />
                                    </div>
                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">
                                        {formatDate(comm.date)}
                                    </div>
                                </div>
                                {(isAdmin || isSecretary) && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-slate-400 hover:bg-slate-50 rounded-full"
                                                >
                                                    <MoreHorizontal size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-36 rounded-xl shadow-xl border-slate-100 p-1"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => handleEdit(comm)}
                                                    className="gap-2 cursor-pointer font-bold text-[10px] uppercase py-2 rounded-lg focus:bg-stats-cyan/10 focus:text-stats-cyan"
                                                >
                                                    <Edit size={12} /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(comm.id)}
                                                    className="gap-2 cursor-pointer font-bold text-[10px] uppercase py-2 rounded-lg text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                                                >
                                                    <Trash2 size={12} /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-sm font-black text-slate-800 leading-snug group-hover:text-stats-cyan transition-colors line-clamp-2">
                                {comm.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 flex flex-col flex-1 justify-between gap-3">
                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                                {comm.content}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                                <div className="flex gap-2">
                                    {comm.fileUrl && (
                                        <Button
                                            onClick={() => window.open(comm.fileUrl, '_blank')}
                                            variant="ghost" size="sm" className="h-7 px-2 rounded-lg border-none bg-slate-50 text-[9px] font-black gap-1.5 text-slate-400 hover:text-stats-cyan hover:bg-stats-cyan/5 transition-colors"
                                        >
                                            <Share2 size={12} /> ANEXO
                                        </Button>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 px-0 text-[9px] font-black uppercase text-slate-300 hover:text-stats-cyan hover:bg-transparent transition-colors">
                                    LER MAIS <ChevronRight size={12} className="ml-0.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredComms.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 max-w-2xl mx-auto">
                    <Megaphone size={48} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum comunicado encontrado</p>
                </div>
            )}

            <CommunicationFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedComm(null);
                }}
                initialData={selectedComm}
                onSubmit={async (data) => {
                    if (selectedComm) {
                        await updateMutation.mutateAsync({ id: selectedComm.id, ...data });
                    } else {
                        await createMutation.mutateAsync(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
