import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, Clock, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Eventos</h1>
                    <p className="text-slate-600 mt-1">Gestão de eventos e ações paroquiais</p>
                </div>
                {(isAdmin || isSecretary) && (
                    <Button onClick={() => { setSelectedEvent(null); setModalOpen(true); }} className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90 shadow-md">
                        <Plus size={18} />
                        Criar Evento
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-cyan"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsList.map((event: any) => (
                    <Card key={event.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                            <CardTitle className="text-lg font-bold text-gray-800 line-clamp-1">{event.title}</CardTitle>
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
                                                onClick={() => handleEdit(event)}
                                                className="gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-stats-cyan/10"
                                            >
                                                <Edit size={14} />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(event.id)}
                                                className="gap-2 cursor-pointer font-medium py-2 rounded-xl text-rose-600 focus:bg-rose-50"
                                            >
                                                <Trash2 size={14} />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-gray-500 line-clamp-2">{event.description || "Sem descrição."}</p>
                            <div className="flex flex-col gap-2 text-xs font-bold text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-stats-cyan" />
                                    {formatDate(event.date)}
                                </div>
                                {event.time && (
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-stats-cyan" />
                                        {event.time}
                                    </div>
                                )}
                                {event.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-stats-cyan" />
                                        {event.location}
                                    </div>
                                )}
                            </div>
                            {event.status && (
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                        event.status === "Confirmado" && "bg-emerald-50 text-emerald-600",
                                        event.status === "Agendado" && "bg-blue-50 text-blue-600",
                                        event.status === "Previsto" && "bg-stats-orange/10 text-stats-orange",
                                        event.status === "Cancelado" && "bg-rose-50 text-rose-600",
                                    )}>
                                        {event.status}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {eventsList.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl opacity-50 border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-bold">Nenhum evento registrado.</p>
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
