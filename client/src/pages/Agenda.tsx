import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock as ClockIcon, Users } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate, formatMonthYear } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const eventTypeColors = {
    baptism: "bg-blue-100 text-blue-800 border-blue-200",
    meeting: "bg-purple-100 text-purple-800 border-purple-200",
    gathering: "bg-green-100 text-green-800 border-green-200",
};

const eventTypeLabels = {
    baptism: "🍼 Batismo",
    meeting: "📝 Reunião",
    gathering: "🎉 Encontro",
};

export default function Agenda() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const { isSecretary } = useRole();
    const { data: eventsResponse, isLoading } = trpc.agenda.list.useQuery();
    const events = Array.isArray(eventsResponse) ? eventsResponse : [];

    const eventsByMonth = events.filter(event => {
        const dateStr = (event as any).eventDate || (event as any).date;
        if (!dateStr) return false;
        const eventDate = new Date(dateStr);
        return eventDate.getMonth() === selectedMonth.getMonth() &&
            eventDate.getFullYear() === selectedMonth.getFullYear();
    });

    const changeMonth = (offset: number) => {
        const next = new Date(selectedMonth);
        next.setMonth(next.getMonth() + offset);
        setSelectedMonth(next);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Agenda</h1>
                    <p className="text-slate-600 mt-1">Planejamento mensal da pastoral</p>
                </div>
                {isSecretary && (
                    <Button className="gap-2 bg-stats-cyan hover:bg-stats-cyan/90">
                        <Plus size={18} />
                        Novo Evento
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-cyan"></div>
                </div>
            )}

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span className="capitalize font-bold text-gray-700">{formatMonthYear(selectedMonth)}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => changeMonth(-1)} className="rounded-lg">
                                <ChevronLeft size={16} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedMonth(new Date())} className="text-xs font-bold">
                                HOJE
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => changeMonth(1)} className="rounded-lg">
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        {eventsByMonth.length > 0 ? (
                            eventsByMonth.map((event) => (
                                <div key={event.id} className="p-6 hover:bg-gray-50/80 transition-all flex gap-6 items-start">
                                    <div className="flex flex-col items-center justify-center bg-white border border-gray-100 shadow-sm rounded-xl p-3 min-w-[70px]">
                                        <span className="text-xs font-bold text-stats-pink uppercase tracking-tighter">
                                            {formatDate((event as any).eventDate || (event as any).date, "EEE")}
                                        </span>
                                        <span className="text-2xl font-black text-gray-800">
                                            {formatDate((event as any).eventDate || (event as any).date, "dd")}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className={cn("border", eventTypeColors[((event as any).eventType || "baptism") as keyof typeof eventTypeColors])}>
                                                {eventTypeLabels[((event as any).eventType || "baptism") as keyof typeof eventTypeLabels]}
                                            </Badge>
                                            {(event as any).eventTime && (
                                                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase">
                                                    <ClockIcon size={12} />
                                                    {event.eventTime}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-800 leading-tight">
                                            {(event as any).title || `Batismo - ${formatDate((event as any).date)}`}
                                        </h3>

                                        {((event as any).description || (event as any).observations) && (
                                            <p className="text-sm text-gray-500 line-clamp-2">{(event as any).description || (event as any).observations}</p>
                                        )}

                                        <div className="flex flex-wrap gap-4 pt-1">
                                            {(event as any).location && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    <MapPin size={14} className="text-stats-cyan" />
                                                    {(event as any).location}
                                                </div>
                                            )}
                                            {(event as any).maxParticipants && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    <Users size={14} className="text-stats-green" />
                                                    {(event as any).currentParticipants || 0} / {(event as any).maxParticipants} membros
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-stats-cyan">
                                        <ChevronRight size={20} />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50/30">
                                <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <CalendarIcon size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-medium">Nenhum evento agendado para este mês</p>
                                <Button variant="link" className="mt-2 text-stats-cyan font-bold" onClick={() => setSelectedMonth(new Date())}>
                                    Voltar para o mês atual
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
