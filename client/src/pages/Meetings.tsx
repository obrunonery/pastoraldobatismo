import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, MapPin, Clock, ChevronRight, Share2, AlertCircle, Edit, Trash2, Download, FileUp, MoreHorizontal, Video, Home, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "axios";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate, getSmartBadge } from "@/lib/date-utils";
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
        },
        onError: (error) => {
            console.error("[MEETINGS] Create Error:", error);
            toast.error("Erro ao salvar reunião: " + error.message);
        }
    });

    const updateMutation = trpc.meeting.update.useMutation({
        onSuccess: () => {
            toast.success("Reunião atualizada!");
            utils.meeting.list.invalidate();
            setModalOpen(false);
            setSelectedMeeting(null);
        },
        onError: (error) => {
            console.error("[MEETINGS] Update Error:", error);
            toast.error("Erro ao atualizar reunião: " + error.message);
        }
    });

    const deleteMutation = trpc.meeting.delete.useMutation({
        onSuccess: () => {
            toast.success("Registro de reunião removido.");
            utils.meeting.list.invalidate();
        },
        onError: (error) => {
            console.error("[MEETINGS] Delete Error:", error);
            toast.error("Erro ao excluir reunião: " + error.message);
        }
    });

    const createUploadMutation = trpc.uploads.create.useMutation({
        onSuccess: () => {
            utils.uploads.list.invalidate();
            toast.success("Arquivo adicionado com sucesso!");
        },
        onError: (error) => {
            toast.error("Erro ao salvar arquivo: " + error.message);
        }
    });

    const deleteUploadMutation = trpc.uploads.delete.useMutation({
        onSuccess: () => {
            utils.uploads.list.invalidate();
            toast.success("Arquivo removido.");
        },
        onError: (error) => {
            toast.error("Erro ao remover arquivo: " + error.message);
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

    const nextMeetingSmartBadge = nextMeeting ? getSmartBadge(nextMeeting.meetingDate) : null;

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
                <Card className={cn(
                    "border-none shadow-lg text-white overflow-hidden relative",
                    nextMeeting.type?.toLowerCase().includes('online')
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gradient-to-r from-stats-cyan to-blue-500"
                )}>
                    <div className="absolute right-[-20px] top-[-10px] opacity-10">
                        <Users size={120} />
                    </div>
                    <CardContent className="py-5 px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/70">Próximo Encontro</p>
                                </div>
                                <h2 className="text-3xl font-black truncate">{(nextMeeting as any).title || "Reunião de Equipe"}</h2>
                                <div className="flex flex-wrap gap-3 text-[11px] font-bold">
                                    <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                                        {nextMeeting.type?.toLowerCase().includes('online') ? (
                                            <Video size={12} className="text-emerald-300" />
                                        ) : (
                                            <MapPin size={12} className="text-emerald-300" />
                                        )}
                                        {(nextMeeting as any).location || "Salão Paroquial"}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                                        <Clock size={12} className="text-amber-300" /> {(nextMeeting as any).meetingTime || "20:00"}
                                    </span>
                                    {nextMeetingSmartBadge && (
                                        <span className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg",
                                            nextMeetingSmartBadge.variant === "today" && "bg-rose-500 text-white animate-pulse shadow-rose-500/50",
                                            nextMeetingSmartBadge.variant === "tomorrow" && "bg-amber-400 text-white shadow-amber-400/50",
                                            nextMeetingSmartBadge.variant === "countdown" && "bg-emerald-400 text-white shadow-emerald-400/50",
                                            nextMeetingSmartBadge.variant === "default" && "bg-white/20 text-white"
                                        )}>
                                            {nextMeetingSmartBadge.text}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0">
                                <div className="text-center">
                                    <span className="block text-[8px] font-black text-white/50 uppercase tracking-tighter leading-none mb-1">{formatDate(nextMeeting.meetingDate, "MMM")}</span>
                                    <span className="block text-3xl font-black leading-none">{formatDate(nextMeeting.meetingDate, "dd")}</span>
                                </div>
                                <div className="w-[1px] h-10 bg-white/20" />
                                <div className="text-xs font-bold text-white/80 uppercase">
                                    {formatDate(nextMeeting.meetingDate, "EEEE")}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">Histórico de Atas</h2>
                    {sortedMeetings.map((meeting: any) => (
                        <Card key={meeting.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                            <CardContent className="p-2">
                                <div className="flex items-center justify-between p-3">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-700 text-base leading-tight truncate">
                                            {(meeting as any).title || "Reunião"}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                <Calendar size={12} className="text-rose-500" />
                                                {formatDate(meeting.meetingDate)}
                                            </div>
                                            {meeting.meetingTime && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    <Clock size={12} className="text-amber-500" />
                                                    {meeting.meetingTime}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                {meeting.type?.toLowerCase().includes('online') ? <Video size={12} className="text-emerald-500" /> : <MapPin size={12} className="text-emerald-500" />}
                                                <span className="truncate max-w-[150px]">
                                                    {meeting.location || (meeting.type?.toLowerCase().includes('online') ? "Online" : "Salão Paroquial")}
                                                </span>
                                            </div>
                                            {(meeting.responsibleName || "Coordenação") && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    <Users size={12} className="text-blue-400" />
                                                    <span className="truncate">{(meeting.responsibleName || "Coordenação").toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {(isAdmin || isSecretary) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-8 w-8 flex items-center justify-center text-slate-200 hover:text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-100 p-1">
                                                    <DropdownMenuItem
                                                        onSelect={() => handleEdit(meeting)}
                                                        className="gap-2 focus:bg-stats-cyan/10 focus:text-stats-cyan rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
                                                    >
                                                        <Edit size={12} /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(meeting.id)}
                                                        className="gap-2 focus:bg-rose-50 text-rose-500 rounded-lg text-xs font-bold"
                                                    >
                                                        <Trash2 size={12} /> Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}

                                        <button
                                            disabled={!meeting.fileUrl}
                                            onClick={() => {
                                                if (meeting.fileUrl) window.open(meeting.fileUrl, '_blank');
                                                else toast.info("Esta reunião não possui ata vinculada.");
                                            }}
                                            className={cn(
                                                "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                                                meeting.fileUrl
                                                    ? "text-slate-300 hover:text-stats-cyan hover:bg-stats-cyan/5"
                                                    : "text-slate-100"
                                            )}
                                            title={meeting.fileUrl ? "Ver Ata" : "Sem Ata"}
                                        >
                                            <FileText size={20} />
                                        </button>
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
                            {(() => {
                                const groups = [
                                    { title: "Templates de Ata", category: "Template" },
                                    { title: "Guias & Manuais", category: "Guia" },
                                    { title: "Controles & Listas", category: "Controle" }
                                ];

                                const visibleGroups = groups.map(group => ({
                                    ...group,
                                    files: uploads.filter((f: any) => f.category === group.category)
                                })).filter(group => group.files.length > 0);

                                if (visibleGroups.length === 0) {
                                    return (
                                        <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Nenhum arquivo disponível</p>
                                        </div>
                                    );
                                }

                                return visibleGroups.map((group) => (
                                    <div key={group.category} className="space-y-2">
                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-stats-orange" />
                                            {group.title}
                                        </h4>
                                        <div className="space-y-1">
                                            {group.files.map((file: any) => (
                                                <div key={file.id} className="flex items-center justify-between p-2 bg-slate-50 hover:bg-stats-cyan/5 group transition-colors rounded-lg border border-transparent hover:border-stats-cyan/10">
                                                    <div
                                                        onClick={() => window.open(file.url, '_blank')}
                                                        className="flex-1 cursor-pointer flex items-center gap-2 overflow-hidden"
                                                    >
                                                        <FileText size={12} className="text-slate-300 group-hover:text-stats-cyan shrink-0" />
                                                        <span className="text-[10px] font-bold text-slate-600 group-hover:text-stats-cyan truncate">{file.name}</span>
                                                    </div>
                                                    {(isAdmin || isSecretary) && (
                                                        <button
                                                            onClick={() => handleDeleteUpload(file.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}

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
                onSubmit={async (formData) => {
                    // Sanitize and normalize data for backend
                    const { id, responsibleName, ...cleanData } = formData;

                    const payload = {
                        ...cleanData,
                        responsibleId: formData.responsibleId || null,
                    };

                    if (selectedMeeting) {
                        try {
                            await updateMutation.mutateAsync({
                                id: Number(selectedMeeting.id),
                                ...payload
                            });
                        } catch (e) {
                            // Error is handled in mutation onError
                        }
                    } else {
                        try {
                            await createMutation.mutateAsync(payload);
                        } catch (e) {
                            // Error is handled in mutation onError
                        }
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div >
    );
}
