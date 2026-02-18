import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Droplet, Users, Calendar, Bell, Plus,
    Check, X, Lock, Unlock, BarChart3,
    AlertCircle, FileDown, MapPin, Clock,
    ChevronRight, Info, Wallet, Settings2, Target,
    Eraser
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ScaleManagerModal } from "@/components/ScaleManagerModal";
import { ScaleDetailsModal } from "@/components/ScaleDetailsModal";
import { useRole } from "@/hooks/useRole";
import { useUser } from "@clerk/clerk-react";
import { formatDate } from "@/lib/date-utils";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
    const { user } = useUser();
    const { isAdmin, isSecretary } = useRole();
    const canManageSchedules = isAdmin || isSecretary;
    const [scaleModalOpen, setScaleModalOpen] = useState(false);
    const [scaleDetailsOpen, setScaleDetailsOpen] = useState(false);
    const [selectedScaleIndex, setSelectedScaleIndex] = useState(0);

    // Queries
    const { data: summary, isLoading: summaryLoading } = trpc.dashboard.getSummary.useQuery();
    const { data: scaleData, refetch: refetchScale } = trpc.dashboard.getPresenceScale.useQuery();
    const allScales = useMemo(() => Array.isArray(scaleData) ? scaleData : [], [scaleData]);
    const currentScale = allScales[selectedScaleIndex];

    const [filters, setFilters] = useState<{ gender?: string, city?: string, year?: string, ageGroup?: string }>({
        gender: undefined,
        city: undefined,
        year: "2026",
        ageGroup: undefined
    });
    const { data: evolutionData } = trpc.dashboard.getEvolutionData.useQuery(filters);
    const { data: financeBI } = trpc.dashboard.getFinanceBI.useQuery();
    const { data: serverGoal, refetch: refetchGoal } = trpc.dashboard.getAnnualGoal.useQuery();
    const { data: uniqueCities } = trpc.dashboard.getUniqueCities.useQuery();

    // Alert: Baptisms without assigned members
    const { data: allBaptisms } = trpc.baptism.list.useQuery();
    const unassignedBaptisms = useMemo(() => {
        if (!Array.isArray(allBaptisms)) return [];
        return allBaptisms.filter(b => b.status === "Agendado" && (!b.celebrantId));
    }, [allBaptisms]);

    // Mutations
    const confirmMutation = trpc.dashboard.updatePresenceStatus.useMutation({
        onSuccess: () => {
            toast.success("Presença atualizada!");
            refetchScale();
        }
    });

    const handleClearFilters = () => {
        setFilters({
            gender: undefined,
            city: undefined,
            year: "2026",
            ageGroup: undefined
        });
    };

    const handleConfirm = (id: number, status: "confirmado" | "ausente") => {
        confirmMutation.mutate({ id, status });
    };

    // BI Calculation
    const currentYearNum = new Date().getFullYear();
    const [annualGoal, setAnnualGoal] = useState<number>(100);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalInputValue, setGoalInputValue] = useState(100);

    const yearOptions = useMemo(() => {
        const years = [];
        for (let i = 2026; i <= 2026 + 10; i++) {
            years.push(String(i));
        }
        return years;
    }, []);

    const goalToDisplay = serverGoal ?? 100;

    const goalMutation = trpc.dashboard.updateAnnualGoal.useMutation({
        onSuccess: () => {
            toast.success("Meta atualizada com sucesso!");
            refetchGoal();
        }
    });

    const handleSaveGoal = () => {
        goalMutation.mutate({ goal: goalInputValue });
        setIsEditingGoal(false);
    };

    const currentYearTotal = useMemo(() => {
        if (!Array.isArray(evolutionData)) return 0;
        // Only sum data for the current year for the progress card
        return evolutionData
            .filter((d: any) => d.year === currentYearNum)
            .reduce((acc: number, curr: any) => acc + curr.quantity, 0);
    }, [evolutionData, currentYearNum]);

    const progressPercentage = Math.min(100, (currentYearTotal / goalToDisplay) * 100);

    const exportToCSV = () => {
        if (!Array.isArray(evolutionData)) return;
        const headers = ["Mês", "Quantidade"];
        const rows = evolutionData.map((d: any) => `${d.name},${d.quantity}`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "relatorio_evolucao_batismo.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* 6. Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Olá, {user?.firstName || "Membro"}. Bem-vindo à Pastoral do Batismo
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium italic">
                        Gestão da Pastoral de Batismo da Paróquia São João Paulo II
                    </p>
                </div>
            </div>

            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-stats-cyan" />
                    <CardHeader className="pb-2 space-y-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próximo Batismo</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-black text-slate-800">
                                {summary?.nextBaptism ? formatDate(summary.nextBaptism.date) : "--/--/--"}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-stats-cyan/10 text-stats-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Droplet size={20} fill="currentColor" />
                            </div>
                        </div>
                        {summary?.nextBaptism && !summary.nextBaptism.docsOk && (
                            <Badge variant="destructive" className="mt-4 text-[9px] font-black gap-1 py-0.5">
                                <AlertCircle size={10} /> DOCUMENTAÇÃO PENDENTE
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-stats-purple" />
                    <CardHeader className="pb-2 space-y-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próxima Reunião</p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-800">
                            {summary?.nextMeeting ? formatDate(summary.nextMeeting.meetingDate) : "--/--/--"}
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-stats-purple/10 text-stats-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-stats-green" />
                    <CardHeader className="pb-2 space-y-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próximo Evento</p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-2xl font-black text-slate-800">
                            {summary?.nextEvent ? formatDate(summary.nextEvent.date) : "--/--/--"}
                        </span>
                        <div className="w-10 h-10 rounded-2xl bg-stats-green/10 text-stats-green flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-stats-orange" />
                    <CardHeader className="pb-2 space-y-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avisos Ativos</p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-4xl font-black text-slate-800">{summary?.notificationsCount || 0}</span>
                        <div className="w-10 h-10 rounded-2xl bg-stats-orange/10 text-stats-orange flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Bell size={20} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pendências Operacionais Alert */}
            {unassignedBaptisms.length > 0 && (
                <div className="bg-stats-orange/10 border border-stats-orange/20 rounded-3xl p-6 flex items-start gap-5 animate-in slide-in-from-top-4 duration-700">
                    <div className="w-14 h-14 rounded-2xl bg-stats-orange text-white flex items-center justify-center shrink-0 shadow-lg shadow-stats-orange/20">
                        <Users size={28} />
                    </div>
                    <div className="space-y-1 py-1">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Escalas Pendentes</h3>
                        <p className="text-slate-600 font-medium">
                            Existem <span className="font-black text-stats-orange">{unassignedBaptisms.length} batismos agendados</span> que ainda não possuem celebrante ou equipe completa atribuída.
                        </p>
                        <Button onClick={() => window.location.href = "/baptisms"} variant="link" className="p-0 h-auto text-stats-orange text-xs font-black uppercase tracking-widest mt-2 gap-1 group">
                            RESOLVER AGORA <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 2. Management Section (Scale & RBAC) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-400/10 text-red-500 flex items-center justify-center">
                                    <Droplet size={18} fill="currentColor" />
                                </div>
                                <CardTitle className="text-lg font-bold">Batismos Previstos</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {allScales.length > 0 ? (
                                <div className="space-y-3">
                                    {allScales.map((scale: any, index: number) => {
                                        // Safe date parsing to prevent "Invalid time value" errors
                                        const eventDate = new Date((scale.baptism.date || "") + "T12:00:00");
                                        const isValidDate = !isNaN(eventDate.getTime());
                                        const day = isValidDate ? eventDate.getDate() : "--";
                                        const month = isValidDate
                                            ? eventDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
                                            : "INV";

                                        return (
                                            <div
                                                key={scale.baptism.id}
                                                onClick={() => {
                                                    setSelectedScaleIndex(index);
                                                    setScaleDetailsOpen(true);
                                                }}
                                                className="group flex items-center gap-5 p-4 bg-slate-50/50 hover:bg-white border border-slate-100/50 hover:border-stats-cyan/30 hover:shadow-xl hover:shadow-stats-cyan/5 rounded-[2rem] transition-all cursor-pointer"
                                            >
                                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                                    <span className="text-xl font-black text-slate-800 leading-none">{day}</span>
                                                    <span className="text-[10px] font-black uppercase text-stats-cyan mt-1">{month}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-stats-cyan transition-colors">
                                                        {scale.baptism.childName}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={cn(
                                                            "text-[9px] font-black px-1.5 py-0.5 rounded-md border-none",
                                                            scale.baptism.docsOk ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                        )}>
                                                            {scale.baptism.docsOk ? "DOCS OK" : "DOCS PENDENTES"}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {scale.members.length} {scale.members.length === 1 ? 'Membro' : 'Membros'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="w-10 h-10 rounded-full bg-slate-100/50 flex items-center justify-center text-slate-300 group-hover:bg-stats-cyan group-hover:text-white transition-all">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                                    <div className="w-12 h-12 rounded-full bg-white mx-auto mb-3 flex items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-sm text-slate-400 font-bold italic">
                                        Nenhum batismo futuro agendado.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Progress Goal */}
                    <Card className="border-none shadow-lg bg-gradient-to-br from-stats-cyan to-stats-cyan/80 text-white overflow-hidden relative">
                        <Droplet className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 rotate-12" fill="currentColor" />
                        <CardHeader className="pb-0 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={18} />
                                <span className="text-xs font-black uppercase tracking-widest opacity-70">Meta de Batizados {currentYearNum}</span>
                            </div>
                            {isAdmin && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-white/10"
                                    onClick={() => {
                                        setGoalInputValue(goalToDisplay);
                                        setIsEditingGoal(true);
                                    }}
                                >
                                    <Target size={16} />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex items-end justify-between">
                                <span className="text-5xl font-black">{currentYearTotal}</span>
                                <span className="text-sm font-bold pb-2 opacity-80">/ {goalToDisplay} batizados realizados</span>
                            </div>
                            <div className="space-y-2">
                                <Progress value={progressPercentage} className="h-3 bg-white/20 shadow-inner" />
                                <div className="flex justify-between text-[10px] font-black tracking-wider">
                                    <span>{Math.round(progressPercentage)}% CONCLUÍDO</span>
                                    <span>FALTAM {Math.max(0, goalToDisplay - currentYearTotal)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meta Edit Modal */}
                    <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
                                    <Target className="text-stats-cyan" />
                                    Ajustar Meta Anual
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-6">
                                <div className="space-y-2">
                                    <Label htmlFor="goal" className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Meta de Batizados ({currentYearNum})</Label>
                                    <Input
                                        id="goal"
                                        type="number"
                                        value={goalInputValue}
                                        onChange={(e) => setGoalInputValue(Number(e.target.value))}
                                        className="h-14 text-2xl font-black rounded-2xl border-slate-100 bg-slate-50 focus:ring-stats-cyan focus:border-stats-cyan"
                                    />
                                    <p className="text-xs text-slate-400 font-medium italic italic">Este valor será usado para calcular o progresso no Dashboard.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleSaveGoal}
                                    className="w-full h-12 bg-stats-cyan hover:bg-stats-cyan/90 text-white font-black rounded-2xl shadow-lg shadow-stats-cyan/20 gap-2"
                                >
                                    <Check size={18} /> SALVAR NOVA META
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Finance BI Chart */}
                    <Card className="border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Wallet className="text-stats-green" size={20} />
                                Evolução Financeira
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] w-full">
                                {Array.isArray(financeBI) && financeBI.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={financeBI}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="entry" fill="#22c55e" name="Entradas" />
                                            <Bar dataKey="exit" fill="#ec4899" name="Saídas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
                                        Carregando dados financeiros...
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. BI Evolution Chart Section */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-stats-cyan/10 text-stats-cyan flex items-center justify-center">
                                    <BarChart3 size={18} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-800">Evolução de Batizados</CardTitle>
                                    <p className="text-xs text-slate-400 font-medium tracking-tight mt-0.5">Visão mensal consolidada</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-8 rounded-xl text-slate-400 hover:text-stats-cyan hover:bg-stats-cyan/5 gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm"
                            >
                                <Eraser size={14} /> Limpar Filtros
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Charts Filters */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Sexo</span>
                                    <Select value={filters.gender || "all"} onValueChange={(v) => setFilters(f => ({ ...f, gender: v === "all" ? undefined : v }))}>
                                        <SelectTrigger className="h-9 rounded-xl bg-white border-none shadow-sm text-xs font-bold">
                                            <SelectValue placeholder="Todos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="m">Masculino</SelectItem>
                                            <SelectItem value="f">Feminino</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Cidade</span>
                                    <Select value={filters.city || "all"} onValueChange={(v) => setFilters(f => ({ ...f, city: v === "all" ? undefined : v }))}>
                                        <SelectTrigger className="h-9 rounded-xl bg-white border-none shadow-sm text-xs font-bold">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {Array.isArray(uniqueCities) && uniqueCities.map((city: string) => (
                                                <SelectItem key={city} value={city}>{city}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Idade</span>
                                    <Select
                                        value={filters.ageGroup || "all"}
                                        onValueChange={(v) => setFilters(f => ({ ...f, ageGroup: v === "all" ? undefined : v }))}
                                    >
                                        <SelectTrigger className="h-9 rounded-xl bg-white border-none shadow-sm text-xs font-bold">
                                            <SelectValue placeholder="Todas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="child">Criança</SelectItem>
                                            <SelectItem value="adult">Adulto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Período</span>
                                    <Select
                                        value={filters.year}
                                        onValueChange={(v) => setFilters(f => ({ ...f, year: v }))}
                                    >
                                        <SelectTrigger className="h-9 rounded-xl bg-white border-none shadow-sm text-xs font-bold">
                                            <SelectValue placeholder="2026" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map(y => (
                                                <SelectItem key={y} value={y}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Actual Chart */}
                            <div className="h-[320px] w-full">
                                {Array.isArray(evolutionData) && evolutionData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={evolutionData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    padding: '12px'
                                                }}
                                            />
                                            <Bar dataKey="quantity" radius={[6, 6, 0, 0]} barSize={32}>
                                                {evolutionData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1eb7e6' : '#a1e3f5'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                        <BarChart3 size={40} className="opacity-20" />
                                        <p className="text-xs font-bold italic">Sem dados suficientes para o gráfico no momento.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
            {currentScale && (
                <ScaleDetailsModal
                    open={scaleDetailsOpen}
                    onOpenChange={setScaleDetailsOpen}
                    baptism={currentScale.baptism}
                    members={currentScale.members}
                    onConfirm={handleConfirm}
                    onManageScale={() => setScaleModalOpen(true)}
                />
            )}

            {currentScale && (
                <ScaleManagerModal
                    open={scaleModalOpen}
                    onOpenChange={setScaleModalOpen}
                    baptismId={currentScale.baptism.id}
                    currentScale={currentScale.members}
                />
            )}
        </div>
    );
}
