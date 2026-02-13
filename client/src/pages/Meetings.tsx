import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, MapPin, Clock, ChevronRight, Share2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export default function Meetings() {
    const { isSecretary } = useRole();
    const { data: meetingsResponse, isLoading } = trpc.meeting.list.useQuery();
    const meetings = Array.isArray(meetingsResponse) ? meetingsResponse : [];

    const sortedMeetings = [...(meetings || [])].sort((a: any, b: any) => {
        const dateA = a?.meetingDate ? new Date(a.meetingDate).getTime() : 0;
        const dateB = b?.meetingDate ? new Date(b.meetingDate).getTime() : 0;
        return dateB - dateA;
    });

    const nextMeeting = sortedMeetings.find((m: any) => m?.meetingDate && new Date(m.meetingDate) >= new Date());

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Reuniões & Atas</h1>
                    <p className="text-slate-600 mt-1">Documentação e planejamento institucional</p>
                </div>
                {isSecretary && (
                    <Button className="gap-2 bg-stats-pink hover:bg-stats-pink/90 shadow-md">
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
                                <h2 className="text-4xl font-black">{nextMeeting?.title || "Reunião de Equipe"}</h2>
                                <div className="flex flex-wrap gap-4 text-sm font-bold">
                                    <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                        <MapPin size={16} /> {nextMeeting?.location || "Salão Paroquial"}
                                    </span>
                                    <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                                        <Clock size={16} /> {nextMeeting?.meetingTime || "20:00"}
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
                    <h2 className="text-lg font-bold text-gray-700 px-1">Histórico de Atas</h2>
                    {sortedMeetings.map((meeting: any) => (
                        <Card key={meeting.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex">
                                    <div className="w-16 bg-gray-50 flex flex-col items-center justify-center border-r border-gray-100 py-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(meeting.meetingDate, "MMM")}</span>
                                        <span className="text-xl font-black text-gray-700">{formatDate(meeting.meetingDate, "dd")}</span>
                                    </div>
                                    <div className="flex-1 p-5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-800 leading-tight mb-1">{(meeting as any).title || "Reunião"}</h4>
                                            <p className="text-xs text-gray-400 font-medium">Conduzida por: {(meeting as any).facilitator || "Coordenação"}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold gap-2 rounded-lg border-gray-200">
                                                <FileText size={14} className="text-stats-cyan" /> VER ATA
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 group-hover:text-stats-cyan">
                                                <ChevronRight size={18} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {sortedMeetings.length === 0 && (
                        <div className="py-20 text-center bg-white rounded-3xl opacity-50 border-2 border-dashed border-gray-100">
                            <FileText size={48} className="mx-auto mb-4 text-gray-200" />
                            <p className="text-gray-400 font-bold">Nenhuma reunião registrada.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <Share2 size={16} className="text-stats-orange" />
                                Arquivos & Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                "Template de Ata de Reunião",
                                "Guia de Boas-vindas Familiares",
                                "Manual do Padrinho Católica",
                                "Controle de Frequência"
                            ].map((file, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-stats-cyan/5 group cursor-pointer transition-colors">
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-stats-cyan">{file}</span>
                                    <FileText size={14} className="text-gray-300 group-hover:text-stats-cyan" />
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-2 border-dashed border-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                ADICIONAR NOVO ARQUIVO
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-stats-pink/5 border-l-4 border-l-stats-pink">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="text-stats-pink w-5 h-5 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-stats-pink uppercase mb-1">Encaminhamentos</p>
                                    <p className="text-[11px] font-medium text-gray-600 leading-relaxed">
                                        Nenhum encaminhamento pendente das últimas 3 reuniões. Mantenha o bom trabalho!
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
