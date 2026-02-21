import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Clock, Edit, Trash2, MoreHorizontal, ChevronRight } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate, getSmartBadge } from "@/lib/date-utils";
import { toast } from "sonner";
import { EventFormModal } from "@/components/EventFormModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Events() {
    const { isSecretary, isAdmin } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const utils = trpc.useUtils();

    const { data: eventsResponse, isLoading } = trpc.event.list.useQuery();
    const eventsList = Array.isArray(eventsResponse) ? eventsResponse : [];

    const createMutation = trpc.event.create.useMutation({
        onSuccess: () => {
            toast.success("Evento criado com sucesso!");
            utils.event.list.invalidate();
            setModalOpen(false);
        }
    });

    const updateMutation = trpc.event.update.useMutation({
        onSuccess: () => {
            toast.success("Evento atualizado!");
            utils.event.list.invalidate();
            setModalOpen(false);
            setSelectedEvent(null);
        }
    });

    const deleteMutation = trpc.event.delete.useMutation({
        onSuccess: () => {
            toast.success("Evento removido.");
            utils.event.list.invalidate();
        }
    });

    const handleEdit = (event: any) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Deseja realmente remover este evento?")) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-4 sm:p-6 bg-slate-50/30 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Eventos</h1>
                    <p className="text-slate-500 text-sm mt-1 uppercase font-black tracking-widest opacity-60">Gestão de ações paroquiais</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <Button
                        onClick={() => { setSelectedEvent(null); setModalOpen(true); }}
                        className="gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em]"
                    >
                        <Plus size={16} />
                        Criar Evento
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}

            <div className="space-y-2 max-w-7xl">
                <h2 className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-[0.2em] mb-4">Próximos Eventos</h2>
                {eventsList.map((event: any) => {
                    const smartBadge = getSmartBadge(event.date, event.status);
                    return (
                        <Card key={event.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white rounded-2xl border-l-[6px] border-l-transparent hover:border-l-blue-500">
                            <CardContent className="p-0">
                                <div className="flex flex-wrap items-center justify-between p-4 gap-x-8 gap-y-3">
                                    <div className="min-w-0 flex flex-wrap items-center gap-x-8 gap-y-3 flex-1">
                                        <div className="flex items-center gap-3 min-w-[200px]">
                                            <h4 className="font-bold text-slate-700 text-base leading-tight truncate">
                                                {event.title}
                                            </h4>
                                            {smartBadge && (
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0",
                                                    smartBadge.variant === "today" && "bg-rose-500 text-white animate-pulse",
                                                    smartBadge.variant === "tomorrow" && "bg-amber-100 text-amber-600 border border-amber-200",
                                                    smartBadge.variant === "countdown" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                                                    smartBadge.variant === "canceled" && "bg-slate-100 text-slate-400",
                                                    smartBadge.variant === "default" && "bg-blue-50 text-blue-600",
                                                )}>
                                                    {smartBadge.text}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            <Calendar size={12} className="text-rose-500" />
                                            {formatDate(event.date)}
                                        </div>
                                        {event.time && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                <Clock size={12} className="text-amber-500" />
                                                {event.time}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[300px]">
                                            <MapPin size={12} className="text-emerald-500" />
                                            <span className="truncate">
                                                {(event.location || "Local não informado").toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        {(isAdmin || isSecretary) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-200 hover:text-slate-400 hover:bg-slate-50 rounded-full transition-all"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-40 rounded-xl shadow-xl border-slate-50 p-1"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(event)}
                                                        className="gap-2 cursor-pointer font-bold py-2 rounded-xl focus:bg-blue-50 focus:text-blue-600"
                                                    >
                                                        <Edit size={14} />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(event.id)}
                                                        className="gap-2 cursor-pointer font-bold py-2 rounded-xl text-rose-600 focus:bg-rose-50"
                                                    >
                                                        <Trash2 size={14} />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                        <ChevronRight size={18} className="text-slate-100 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {eventsList.length === 0 && !isLoading && (
                    <div className="py-24 text-center bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <Calendar size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-800 font-bold text-base">Nenhum evento registrado</h3>
                        <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-widest font-black">Organize suas ações pastorais aqui</p>
                    </div>
                )}
            </div>

            <EventFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedEvent(null);
                }}
                initialData={selectedEvent}
                onSubmit={async (data) => {
                    if (selectedEvent) {
                        await updateMutation.mutateAsync({ id: selectedEvent.id, ...data });
                    } else {
                        await createMutation.mutateAsync(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
