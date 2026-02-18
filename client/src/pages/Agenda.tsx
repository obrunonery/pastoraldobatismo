import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { PencilIcon, TrashIcon, MapPinIcon, CalendarIcon, User, MoreHorizontal, Ban } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { AgendaFormModal } from "@/components/AgendaFormModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function AgendaPage() {
    const { isAdmin, isSecretary } = useRole();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const utils = trpc.useUtils();

    const { data: eventsResponse, isLoading } = trpc.agenda.list.useQuery();
    const events = Array.isArray(eventsResponse) ? eventsResponse : [];

    const updateMutation = trpc.agenda.update.useMutation({
        onSuccess: () => {
            toast.success("Operação concluída!");
            utils.agenda.list.invalidate();
            setModalOpen(false);
            setSelectedEvent(null);
        }
    });

    const createMutation = trpc.agenda.create.useMutation({
        onSuccess: () => {
            toast.success("Evento agendado!");
            utils.agenda.list.invalidate();
            setModalOpen(false);
        }
    });

    const handleEdit = (event: any) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleCancel = async (id: number) => {
        if (confirm("Deseja marcar este evento como cancelado?")) {
            await updateMutation.mutateAsync({ id, status: "Cancelado" });
        }
    };

    const filteredEvents = date
        ? events.filter((e: any) => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === date.getDate() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getFullYear() === date.getFullYear();
        })
        : [];

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 p-8 bg-white min-h-screen animate-in fade-in duration-500">

            {/* 1. Coluna da Esquerda: Compromissos */}
            <div className="flex-1 max-w-3xl">
                <div className="flex items-center justify-between mb-12 border-b border-slate-50 pb-8">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compromissos Pastoral</h2>
                </div>

                <div className="space-y-0">
                    {date ? (
                        filteredEvents.length > 0 ? (
                            filteredEvents.map((event: any) => (
                                <div key={event.id} className={cn(
                                    "group flex items-center justify-between py-6 border-b border-slate-50 hover:bg-slate-50/40 transition-all px-4 -mx-4 rounded-3xl",
                                    event.status === "Cancelado" && "opacity-50 grayscale"
                                )}>
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-400 font-bold shrink-0">
                                            {event.status === "Cancelado" ? <Ban size={20} /> : <CalendarIcon size={20} className="text-blue-500/50" />}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={cn("font-bold text-slate-900 text-[15px]", event.status === "Cancelado" && "line-through")}>
                                                    {event.title}
                                                </h3>
                                                {event.status === "Cancelado" && (
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Cancelado</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-[13px] text-slate-400 font-medium">
                                                <span className="flex items-center gap-1.5 capitalize">
                                                    {(() => {
                                                        const d = new Date(event.date);
                                                        if (isNaN(d.getTime())) return "Data Inválida";
                                                        return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
                                                    })()}
                                                    {event.time && ` às ${event.time}`}
                                                </span>
                                                <span className="text-slate-200">|</span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPinIcon className="w-3.5 h-3.5 text-slate-300" />
                                                    {event.location || "Local"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {(isAdmin || isSecretary) && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-white hover:shadow-sm rounded-full">
                                                        <MoreHorizontal size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-2xl shadow-xl border-slate-100 p-1">
                                                    <DropdownMenuItem onClick={() => handleEdit(event)} className="text-blue-600 gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-blue-50">
                                                        <PencilIcon size={14} /> Editar
                                                    </DropdownMenuItem>
                                                    {event.status !== "Cancelado" && (
                                                        <DropdownMenuItem onClick={() => handleCancel(event.id)} className="text-rose-600 gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-rose-50">
                                                            <TrashIcon size={14} /> Cancelar Evento
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-slate-300 font-medium text-sm">
                                    Nenhum evento registrado para {date && !isNaN(date.getTime()) ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "--"}.
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-slate-300 font-medium text-sm">Selecione um dia no calendário para ver os compromissos.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Coluna da Direita: Calendário Ajustado para 400px */}
            <div className="w-full lg:w-[400px] shrink-0">
                <div className="p-8 border border-slate-50 rounded-[2.5rem] bg-white shadow-sm">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={ptBR}
                        className="w-full flex justify-center"
                    />
                </div>
            </div>

            <AgendaFormModal
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