import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { PencilIcon, TrashIcon, MapPinIcon, Calendar as CalendarLucide, User, MoreHorizontal, Ban, Clock, Droplet, ChevronRight, Video, Home } from 'lucide-react';
import { format, isSameDay, parseISO, startOfDay, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { AgendaFormModal } from "@/components/AgendaFormModal";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getSmartBadge } from "@/lib/date-utils";

import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaPage() {
    const { isAdmin, isSecretary } = useRole();
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
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
        setSelectedEvent({ ...event, id: event.originalId });
        setModalOpen(true);
    };

    const handleCancel = async (id: number) => {
        if (confirm("Deseja marcar este evento como cancelado?")) {
            await updateMutation.mutateAsync({ id, status: "Cancelado" });
        }
    };

    const filteredEvents = date
        ? events.filter((e: any) => {
            if (!e.date) return false;
            const eventDate = parseISO(e.date);
            return isSameDay(eventDate, date);
        })
        : [];

    const monthEvents = events.filter((e: any) => {
        if (!e.date) return false;
        const eventDate = parseISO(e.date);
        const sameMonth = isSameMonth(eventDate, currentMonth);
        const afterOrToday = eventDate >= startOfDay(new Date());
        return sameMonth && afterOrToday;
    });

    const eventDates = events
        .filter((e: any) => e.date)
        .map((e: any) => parseISO(e.date));

    const isShowingDay = !!date;
    const displayEvents = isShowingDay ? filteredEvents : monthEvents;

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 p-6 bg-slate-50/50 min-h-screen">

            {/* 1. Coluna da Esquerda: Compromissos */}
            <div className="flex-1 max-w-4xl space-y-8">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {isShowingDay
                                ? `Agenda do Dia`
                                : `Compromissos de ${format(currentMonth, "MMMM", { locale: ptBR })}`}
                        </h2>
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
                            {isShowingDay
                                ? format(date!, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                : "Visão Geral do Mês"}
                        </p>
                    </div>
                    {isShowingDay && (
                        <button
                            onClick={() => setDate(undefined)}
                            className="bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-stats-cyan hover:shadow-md transition-all active:scale-95"
                        >
                            Ver todo o mês
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {displayEvents.length > 0 ? (
                            displayEvents.map((event: any) => {
                                const smartBadge = getSmartBadge(event.date, event.status);
                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={cn(
                                            "group bg-white rounded-[32px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.04)]",
                                            event.status === "Cancelado" && "opacity-60 grayscale"
                                        )}
                                    >
                                        <div className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-6">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-[24px] flex items-center justify-center transition-all duration-500",
                                                    event.status === "Cancelado"
                                                        ? "bg-slate-100 text-slate-400"
                                                        : "bg-slate-50 text-slate-400 group-hover:bg-stats-cyan group-hover:text-white group-hover:shadow-xl group-hover:shadow-stats-cyan/20"
                                                )}>
                                                    {event.status === "Cancelado" ? <Ban size={22} /> : <CalendarLucide size={22} />}
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg border flex items-center gap-1.5",
                                                            event.type === 'Reunião' ? (
                                                                event.category?.toLowerCase().includes('online')
                                                                    ? "border-emerald-500/20 text-emerald-500 bg-emerald-50"
                                                                    : "border-stats-cyan/20 text-stats-cyan bg-stats-cyan/5"
                                                            ) :
                                                                event.type === 'Batismo' ? "border-blue-500/20 text-blue-500 bg-blue-50/50" :
                                                                    event.type === 'Formação' ? "border-amber-500/20 text-amber-500 bg-amber-50/50" :
                                                                        "border-slate-100 text-slate-400 bg-slate-50"
                                                        )}>
                                                            {event.type === 'Reunião' && (
                                                                <>
                                                                    {event.category?.toLowerCase().includes('online') ? <Video size={10} /> : <Home size={10} />}
                                                                </>
                                                            )}
                                                            {event.type}
                                                        </span>
                                                        {smartBadge && (
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg flex items-center gap-1",
                                                                smartBadge.variant === "today" && "bg-rose-500 text-white animate-pulse",
                                                                smartBadge.variant === "tomorrow" && "bg-amber-100 text-amber-600 border border-amber-200",
                                                                smartBadge.variant === "countdown" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                                                                smartBadge.variant === "canceled" && "bg-slate-100 text-slate-400",
                                                                smartBadge.variant === "default" && "bg-slate-100 text-slate-500"
                                                            )}>
                                                                {smartBadge.variant === "today" && <span className="w-1 h-1 rounded-full bg-white animate-ping" />}
                                                                {smartBadge.text}
                                                            </span>
                                                        )}
                                                        {event.status === "Cancelado" && !smartBadge && (
                                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">Cancelado</span>
                                                        )}
                                                    </div>
                                                    <h3 className={cn("font-bold text-slate-700 text-base leading-tight", event.status === "Cancelado" && "line-through text-slate-400")}>
                                                        {event.title}
                                                    </h3>

                                                    {event.observations && (
                                                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mb-1">
                                                            {event.observations}
                                                        </p>
                                                    )}

                                                    {(event.responsibleName || event.facilitator) && (
                                                        <div className={cn(
                                                            "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                                                            event.type === 'Reunião' && event.category?.toLowerCase().includes('online')
                                                                ? "text-emerald-500/70"
                                                                : "text-stats-cyan/70"
                                                        )}>
                                                            <User size={10} />
                                                            {event.responsibleName || event.facilitator}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={12} className="text-amber-500" />
                                                            {event.time || "Horário não definido"}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                        <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                                                            <MapPinIcon size={12} className="text-emerald-500" />
                                                            {event.location || "Local não informado"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {(isAdmin || isSecretary) && event.type === 'Evento' && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all" title="Ações">
                                                                <MoreHorizontal size={20} />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-[24px] shadow-2xl border-slate-50 p-2">
                                                            <DropdownMenuItem onClick={() => handleEdit(event)} className="flex items-center gap-3 p-3 rounded-[16px] text-slate-600 font-bold text-xs cursor-pointer focus:bg-slate-50">
                                                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                                                    <PencilIcon size={14} />
                                                                </div>
                                                                Editar Evento
                                                            </DropdownMenuItem>
                                                            {event.status !== "Cancelado" && (
                                                                <DropdownMenuItem onClick={() => handleCancel(event.originalId)} className="flex items-center gap-3 p-3 rounded-[16px] text-rose-600 font-bold text-xs cursor-pointer focus:bg-rose-50">
                                                                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                                                        <TrashIcon size={14} />
                                                                    </div>
                                                                    Cancelar Evento
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                                <div className="h-10 w-10 flex items-center justify-center text-slate-200 group-hover:text-stats-cyan transition-colors">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-24 text-center space-y-4 bg-white rounded-[40px] border border-dashed border-slate-200"
                            >
                                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <CalendarLucide size={32} className="text-slate-200" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-800 font-bold text-base">Nenhum Compromisso</h3>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] px-10">
                                        {isShowingDay
                                            ? `Não há eventos marcados para este dia.`
                                            : "Nenhum evento futuro registrado para este período."}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 2. Coluna da Direita: Calendário */}
            <div className="w-full lg:w-[420px] shrink-0">
                <div className="sticky top-6 space-y-6">
                    <div className="p-4 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            locale={ptBR}
                            eventDates={eventDates}
                            className="w-full"
                        />
                    </div>

                    {/* Card de Legenda ou Destaque */}
                    <div className="bg-stats-cyan rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-stats-cyan/20 group">
                        <Droplet className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700" fill="currentColor" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black tracking-tight leading-tight">Dica de Gestão</h4>
                                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                                    Clique nos dias com marcações para filtrar rapidamente os compromissos daquela data específica.
                                </p>
                            </div>
                        </div>
                    </div>
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

const Info = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
);