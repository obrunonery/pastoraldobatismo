import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, MapPin, Clock, ChevronRight, Share2, AlertCircle, Edit, Trash2, Download, FileUp, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "axios";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { MeetingFormModal } from "@/components/MeetingFormModal";
import { toast } from "sonner";

export default function Meetings() {
    const { isSecretary, isAdmin } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadCategory, setUploadCategory] = useState("Template");
    const utils = trpc.useUtils();

    const { data: meetingsResponse, isLoading } = trpc.meeting.list.useQuery();
    const meetings = Array.isArray(meetingsResponse) ? meetingsResponse : [];

    const sortedMeetings = [...(meetings || [])].sort((a: any, b: any) => {
        const dateA = a?.meetingDate ? new Date(a.meetingDate).getTime() : 0;
        const dateB = b?.meetingDate ? new Date(b.meetingDate).getTime() : 0;
        return dateB - dateA;
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const nextMeeting = sortedMeetings.find((m: any) => m?.meetingDate && m.meetingDate >= todayStr);

    const { data: uploadsResponse } = trpc.uploads.list.useQuery();
    const uploads = Array.isArray(uploadsResponse) ? uploadsResponse : [];

    const createMutation = trpc.meeting.create.useMutation({
        onSuccess: () => {
            toast.success("Ata de reunião salva!");
            utils.meeting.list.invalidate();
            setModalOpen(false);
        }
    });

    const updateMutation = trpc.meeting.update.useMutation({
        onSuccess: () => {
            toast.success("Reunião atualizada!");
            utils.meeting.list.invalidate();
            setModalOpen(false);
            setSelectedMeeting(null);
        }
    });

    const deleteMutation = trpc.meeting.delete.useMutation({
        onSuccess: () => {
            toast.success("Registro de reunião removido.");
            utils.meeting.list.invalidate();
        }
    });

    const createUploadMutation = trpc.uploads.create.useMutation({
        onSuccess: () => {
            utils.uploads.list.invalidate();
            toast.success("Arquivo adicionado com sucesso!");
        }
    });

    const deleteUploadMutation = trpc.uploads.delete.useMutation({
        onSuccess: () => {
            utils.uploads.list.invalidate();
            toast.success("Arquivo removido.");
        }
    });

    const handleEdit = (meeting: any) => {
        setSelectedMeeting(meeting);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Deseja excluir este registro de reunião?")) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            const response = await axios.post("/api/upload", formData);
            const { url, originalName, filename } = response.data;

            await createUploadMutation.mutateAsync({
                name: originalName,
                filename: filename,
                url: url,
                category: uploadCategory
            });
        } catch (error) {
            console.error("Erro no upload:", error);
            toast.error("Falha ao subir arquivo.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteUpload = async (id: number) => {
        if (confirm("Deseja remover este arquivo permanentemente?")) {
            await deleteUploadMutation.mutateAsync({ id });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reuniões & Atas</h1>
                    <p className="text-slate-600 mt-1 font-medium">Documentação e planejamento institucional paroquial</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <Button onClick={() => { setSelectedMeeting(null); setModalOpen(true); }} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
                        <Plus size={18} />
                        Nova Reunião
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-pink"></div>
                </div>
            )}

            {nextMeeting && (
                <Card className="border-none shadow-lg bg-gradient-to-r from-stats-cyan to-blue-500 text-white overflow-hidden relative">
                    <div className="absolute right-[-20px] top-[-20px] opacity-10">
                        <Users size={160} />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/70 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Próximo Encontro
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="space-y-4">
                                {nextMeeting.type && (
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-[-12px]">
                                        {nextMeeting.type}
                                    </p>
                                )}
                                <h2 className="text-4xl font-black">{(nextMeeting as any).title || "Reunião de Equipe"}</h2>
                                <div className="flex flex-wrap gap-4 text-sm font-bold">
                                    <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                        <MapPin size={16} /> {(nextMeeting as any).location || "Salão Paroquial"}
                                    </span>
                                    <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                        <Clock size={16} /> {(nextMeeting as any).meetingTime || "20:00"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-6 min-w-[140px] border border-white/20">
                                <span className="text-sm font-bold text-white/60 mb-1 uppercase tracking-tighter">{formatDate(nextMeeting.meetingDate, "EEEE")}</span>
                                <span className="text-5xl font-black">{formatDate(nextMeeting.meetingDate, "dd")}</span>
                                <span className="text-xs font-bold text-white/60 mt-1 uppercase">{formatDate(nextMeeting.meetingDate, "MMMM")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-slate-700 px-1 uppercase tracking-widest text-xs">Histórico de Atas</h2>
                    {sortedMeetings.map((meeting: any) => (
                        <Card key={meeting.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="flex">
                                    <div className="w-16 bg-slate-50 flex flex-col items-center justify-center border-r border-slate-100 py-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(meeting.meetingDate, "MMM")}</span>
                                        <span className="text-xl font-black text-slate-700">{formatDate(meeting.meetingDate, "dd")}</span>
                                    </div>
                                    <div className="flex-1 p-5 flex items-center justify-between">
                                        <div>
                                            {meeting.type && (
                                                <p className="text-[9px] font-black text-stats-cyan uppercase tracking-widest mb-0.5">
                                                    {meeting.type}
                                                </p>
                                            )}
                                            <h4 className="font-bold text-slate-800 leading-tight mb-1">{(meeting as any).title || "Reunião"}</h4>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                Responsável: <span className="text-slate-600 font-bold">{meeting.responsibleName || "Coordenação"}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(isAdmin || isSecretary) && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-400 hover:bg-white hover:shadow-sm rounded-full"
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-40 rounded-2xl shadow-xl border-slate-100 p-1"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() => handleEdit(meeting)}
                                                                className="gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-stats-cyan/10"
                                                            >
                                                                <Edit size={14} />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(meeting.id)}
                                                                className="gap-2 cursor-pointer font-medium py-2 rounded-xl text-rose-600 focus:bg-rose-50"
                                                            >
                                                                <Trash2 size={14} />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            )}
                                            <Button
                                                variant="outline" size="sm"
                                                disabled={!meeting.fileUrl}
                                                onClick={() => {
                                                    if (meeting.fileUrl) {
                                                        window.open(meeting.fileUrl, '_blank');
                                                    } else {
                                                        toast.info("Esta reunião não possui ata vinculada.");
                                                    }
                                                }}
                                                className={cn(
                                                    "h-8 text-[10px] font-bold gap-2 rounded-lg border-slate-200",
                                                    meeting.fileUrl ? "hover:border-stats-cyan hover:text-stats-cyan" : "opacity-30 cursor-not-allowed"
                                                )}
                                            >
                                                <FileText size={14} /> VER ATA
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {sortedMeetings.length === 0 && (
                        <div className="py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma reunião registrada</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                <Share2 size={16} className="text-stats-orange" />
                                Arquivos & Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { title: "Templates de Ata", category: "Template" },
                                { title: "Guias & Manuais", category: "Guia" },
                                { title: "Controles & Listas", category: "Controle" }
                            ].map((group) => {
                                const groupFiles = uploads.filter((f: any) => f.category === group.category);
                                return (
                                    <div key={group.category} className="space-y-2">
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-stats-orange" />
                                            {group.title}
                                        </h4>
                                        <div className="space-y-1.5">
                                            {groupFiles.map((file: any) => (
                                                <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-stats-cyan/5 group transition-colors border border-transparent hover:border-stats-cyan/20">
                                                    <div
                                                        onClick={() => window.open(file.url, '_blank')}
                                                        className="flex-1 cursor-pointer flex items-center gap-2 overflow-hidden"
                                                    >
                                                        <FileText size={12} className="text-slate-300 group-hover:text-stats-cyan shrink-0" />
                                                        <span className="text-[11px] font-bold text-slate-600 group-hover:text-stats-cyan truncate">{file.name}</span>
                                                    </div>
                                                    {(isAdmin || isSecretary) && (
                                                        <button
                                                            onClick={() => handleDeleteUpload(file.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {groupFiles.length === 0 && (
                                                <div className="p-2 border border-dashed border-slate-100 rounded-xl text-center">
                                                    <span className="text-[9px] font-medium text-slate-300 italic">Vazio</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="pt-4 border-t border-slate-100">
                                <Label className="text-[10px] uppercase font-bold text-slate-400 mb-2 block">Novo Upload</Label>
                                <div className="grid grid-cols-3 gap-1 mb-2">
                                    {["Template", "Guia", "Controle"].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setUploadCategory(cat)}
                                            className={cn(
                                                "py-1 text-[9px] font-bold rounded-lg border transition-all",
                                                uploadCategory === cat
                                                    ? "bg-stats-cyan text-white border-stats-cyan shadow-sm"
                                                    : "bg-white text-slate-400 border-slate-200 hover:border-stats-cyan/30"
                                            )}
                                        >
                                            {cat}s
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    id="template-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="outline"
                                    disabled={uploading}
                                    onClick={() => document.getElementById('template-upload')?.click()}
                                    className="w-full border-dashed border-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/50 hover:bg-white hover:text-stats-cyan transition-all h-10"
                                >
                                    {uploading ? "SUBINDO..." : `ADICIONAR ${uploadCategory.toUpperCase()}`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-stats-pink/5 border-l-4 border-l-stats-pink">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="text-stats-pink w-5 h-5 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-stats-pink uppercase mb-1 tracking-widest">Aviso</p>
                                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                        Mantenha as atas sempre atualizadas para facilitar a transparência pastoral.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <MeetingFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedMeeting(null);
                }}
                initialData={selectedMeeting}
                onSubmit={async (data) => {
                    if (selectedMeeting) {
                        await updateMutation.mutateAsync({ id: selectedMeeting.id, ...data });
                    } else {
                        await createMutation.mutateAsync(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
