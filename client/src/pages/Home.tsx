import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Droplet, Users, Calendar, Bell, Plus,
    Check, X, Lock, Unlock, BarChart3,
    AlertCircle, FileDown, MapPin, Clock,
    ChevronRight, Info, Wallet, Settings2, Target,
    Eraser, TrendingUp, Filter, Video
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
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

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

    const yearOptions = useMemo(() => {
        const years = [];
        for (let i = 2026; i <= 2026 + 10; i++) {
            years.push(String(i));
        }
        return years;
    }, []);

    const formatFinanceMonth = (monthStr: string) => {
        if (!monthStr || !monthStr.includes('-')) return monthStr;
        const [year, month] = monthStr.split('-');
        const monthNames: Record<string, string> = {
            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
            '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
        };
        return `${monthNames[month] || month}-${year}`;
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10 bg-slate-50/50 min-h-screen p-2 sm:p-6 rounded-[40px] pb-24"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Olá, {user?.firstName || "Membro"} 👋
                    </h1>
                    <p className="text-[12px] font-black uppercase text-slate-300 tracking-[0.2em]">
                        PASTORAL DO BATISMO • Paróquia São João Paulo II
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-12 w-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-stats-cyan transition-all">
                        <Bell size={20} />
                    </button>
                    <div className="h-12 px-6 bg-white rounded-full shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Sistema Online</span>
                    </div>
                </div>
            </motion.div>

            <Tabs defaultValue="geral" className="w-full space-y-10">
                <div className="px-4">
                    <TabsList className="bg-white/50 backdrop-blur-sm border border-slate-100 p-1.5 rounded-3xl h-14 w-fit shadow-sm">
                        <TabsTrigger
                            value="geral"
                            className="rounded-2xl px-8 h-full data-[state=active]:bg-stats-cyan data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-stats-cyan/20 text-xs font-black uppercase tracking-widest transition-all gap-2"
                        >
                            <BarChart3 size={16} /> Visão Geral
                        </TabsTrigger>
                        <TabsTrigger
                            value="financeiro"
                            className="rounded-2xl px-8 h-full data-[state=active]:bg-stats-cyan data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-stats-cyan/20 text-xs font-black uppercase tracking-widest transition-all gap-2"
                        >
                            <Wallet size={16} /> Financeiro
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="geral" className="space-y-10 outline-none m-0">

                    {/* Summary Cards */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                        {[
                            { title: "Próximo Batismo", value: summary?.nextBaptism ? formatDate(summary.nextBaptism.date) : "--/--/--", icon: Droplet, color: "stats-cyan", pulse: summary?.nextBaptism && !summary.nextBaptism.docsOk },
                            { title: "Próxima Reunião", value: summary?.nextMeeting ? formatDate(summary.nextMeeting.meetingDate) : "--/--/--", icon: (summary?.nextMeeting as any)?.type?.toLowerCase().includes('online') ? Video : Users, color: (summary?.nextMeeting as any)?.type?.toLowerCase().includes('online') ? "emerald-500" : "stats-purple" },
                            { title: "Próximo Evento", value: summary?.nextEvent ? formatDate(summary.nextEvent.date) : "--/--/--", icon: Calendar, color: "stats-green" },
                            { title: "Avisos Ativos", value: summary?.notificationsCount || 0, icon: Bell, color: "stats-orange" }
                        ].map((stat, i) => (
                            <div key={i} className="group bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.04)]">
                                <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5 transition-opacity group-hover:opacity-10", `bg-${stat.color}`)} />
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center transition-transform group-hover:scale-110", `bg-${stat.color}/10 text-${stat.color}`)}>
                                        <stat.icon size={22} fill={stat.icon === Droplet ? "currentColor" : "none"} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{stat.title}</p>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                                    </div>
                                    {stat.pulse && (
                                        <Badge variant="destructive" className="w-fit text-[9px] font-black gap-1 py-1 px-3 rounded-full animate-pulse border-none">
                                            <AlertCircle size={10} /> DOCUMENTAÇÃO PENDENTE
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Alerts */}
                    <AnimatePresence>
                        {unassignedBaptisms.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                variants={itemVariants}
                                className="px-4"
                            >
                                <div className="bg-stats-orange rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-stats-orange/20 ring-4 ring-stats-orange/5 group">
                                    <Users className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                                <AlertCircle size={24} />
                                            </div>
                                            <h3 className="text-2xl font-black tracking-tighter">Escalas Pendentes de Celebrante</h3>
                                            <p className="text-white/80 font-medium max-w-xl">
                                                Existem <span className="font-black text-white">{unassignedBaptisms.length} batismos</span> que ainda não possuem celebrante atribuído. A definição das equipes é fundamental para a organização.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = "/baptisms"}
                                            className="bg-white text-stats-orange px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            RESOLVER AGORA <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                        {/* Evolution & Filters */}
                        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
                            <div className="bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-stats-cyan/10 text-stats-cyan flex items-center justify-center">
                                            <BarChart3 size={24} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Evolução de Batizados</h2>
                                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Filtros e Análise Geográfica</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleClearFilters}
                                            className="h-10 px-4 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <Eraser size={14} /> Limpar
                                        </button>
                                        <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                                    </div>
                                </div>

                                {/* Chart Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Sexo", value: filters.gender || "all", key: "gender", options: [{ v: "all", l: "Todos" }, { v: "m", l: "Masculino" }, { v: "f", l: "Feminino" }] },
                                        { label: "Cidade", value: filters.city || "all", key: "city", options: [{ v: "all", l: "Todas" }, ...(uniqueCities?.map((c: any) => ({ v: c, l: c })) || [])] },
                                        { label: "Idade", value: filters.ageGroup || "all", key: "ageGroup", options: [{ v: "all", l: "Todas" }, { v: "child", l: "Criança" }, { v: "adult", l: "Adulto" }] },
                                        { label: "Período", value: filters.year, key: "year", options: yearOptions.map(y => ({ v: y, l: y })) }
                                    ].map((filter, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-2">
                                                <Filter size={10} className="text-slate-300" /> {filter.label}
                                            </Label>
                                            <Select
                                                value={filter.value}
                                                onValueChange={(v) => setFilters(f => ({ ...f, [filter.key]: v === "all" ? undefined : v }))}
                                            >
                                                <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 border-transparent hover:border-slate-100 transition-all shadow-none text-xs font-bold text-slate-600">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-50 shadow-2xl p-1">
                                                    {filter.options.map(opt => (
                                                        <SelectItem key={opt.v} value={opt.v} className="rounded-xl font-bold text-xs py-2.5">{opt.l}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>

                                <div className="h-[350px] w-full pt-4">
                                    {Array.isArray(evolutionData) && evolutionData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={evolutionData}>
                                                <defs>
                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#1eb7e6" stopOpacity={1} />
                                                        <stop offset="100%" stopColor="#1eb7e6" stopOpacity={0.6} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                                    dy={15}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc', radius: 10 }}
                                                    contentStyle={{
                                                        borderRadius: '24px',
                                                        border: 'none',
                                                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                                                        padding: '16px'
                                                    }}
                                                    itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                                                />
                                                <Bar dataKey="quantity" radius={[12, 12, 0, 0]} barSize={40}>
                                                    {evolutionData.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                                                <BarChart3 size={32} />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sem registros encontrados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Sidebar: Batismos & Goals */}
                        <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
                            {/* Batismos Previstos Card */}
                            <div className="bg-white rounded-[40px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8 px-2">
                                    <div className="space-y-0.5">
                                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Escalas da Pastoral</h2>
                                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Batismos das próximas 4 semanas</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-stats-pink/10 text-stats-pink flex items-center justify-center">
                                        <Droplet size={20} fill="currentColor" />
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <AnimatePresence mode="popLayout">
                                        {allScales.length > 0 ? (
                                            allScales.map((scale: any, index: number) => {
                                                const eventDate = new Date((scale.baptism.date || "") + "T12:00:00");
                                                const day = !isNaN(eventDate.getTime()) ? eventDate.getDate() : "--";
                                                const month = !isNaN(eventDate.getTime())
                                                    ? eventDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()
                                                    : "INV";

                                                return (
                                                    <motion.div
                                                        key={scale.baptism.id}
                                                        layout
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        onClick={() => {
                                                            setSelectedScaleIndex(index);
                                                            setScaleDetailsOpen(true);
                                                        }}
                                                        className="group p-4 bg-slate-50/50 hover:bg-white rounded-[28px] border border-transparent hover:border-slate-100 transition-all cursor-pointer hover:shadow-xl hover:shadow-stats-cyan/5 flex items-center gap-4"
                                                    >
                                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                            <span className="text-base font-black text-slate-800 leading-none">{day}</span>
                                                            <span className="text-[8px] font-black text-stats-cyan mt-1 tracking-tighter">{month}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-700 text-sm truncate group-hover:text-stats-cyan transition-colors">{scale.baptism.childName}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    scale.baptism.docsOk ? "bg-emerald-500" : "bg-stats-pink"
                                                                )} />
                                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                                    {scale.members.length} membros na equipe
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-200 group-hover:text-stats-cyan group-hover:bg-stats-cyan/5 transition-all">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </motion.div>
                                                )
                                            })
                                        ) : (
                                            <div className="py-12 text-center space-y-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                                                    <Calendar size={24} className="text-slate-200" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest px-8 leading-relaxed">Nenhum batismo futuro agendado na base de dados</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </TabsContent>

                <TabsContent value="financeiro" className="space-y-10 outline-none m-0">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                        {/* Finance Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                            {[
                                { title: "Entradas (Ano)", value: financeBI?.reduce((acc: any, curr: any) => acc + (Number(curr.entry) || 0), 0) || 0, icon: TrendingUp, color: "emerald-500", bg: "emerald-50" },
                                { title: "Saídas (Ano)", value: financeBI?.reduce((acc: any, curr: any) => acc + (Number(curr.exit) || 0), 0) || 0, icon: TrendingUp, color: "stats-pink", bg: "stats-pink/10", rotate: true },
                                { title: "Saldo Atual", value: financeBI?.reduce((acc: any, curr: any) => acc + (Number(curr.balance) || 0), 0) || 0, icon: Wallet, color: "stats-cyan", bg: "stats-cyan/10" }
                            ].map((stat, i) => (
                                <div key={i} className="group bg-white rounded-[32px] p-8 shadow-[0_20px_50_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.04)]">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{stat.title}</p>
                                            <h3 className={cn("text-3xl font-black tracking-tight transition-colors", i === 0 ? "text-emerald-500" : i === 1 ? "text-stats-pink" : "text-stats-cyan")}>
                                                {formatCurrency(stat.value)}
                                            </h3>
                                        </div>
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", i === 0 ? "bg-emerald-50 text-emerald-500" : i === 1 ? "bg-stats-pink/10 text-stats-pink" : "bg-stats-cyan/10 text-stats-cyan")}>
                                            <stat.icon size={24} className={cn(stat.rotate && "rotate-180")} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
                            <div className="lg:col-span-8 bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-stats-cyan/10 text-stats-cyan flex items-center justify-center">
                                        <BarChart3 size={24} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Evolução Financeira</h2>
                                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Fluxo de Caixa Mensal</p>
                                    </div>
                                </div>

                                <div className="h-[350px] w-full pt-4">
                                    {financeBI && financeBI.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={financeBI}>
                                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                                    tickFormatter={formatFinanceMonth}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                                    tickFormatter={(v) => `R$ ${v}`}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc', radius: 10 }}
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                                    formatter={(value: any) => [formatCurrency(value), ""]}
                                                    itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                                                />
                                                <Bar dataKey="entry" name="Entradas" fill="#10b981" radius={[8, 8, 0, 0]} barSize={20} />
                                                <Bar dataKey="exit" name="Saídas" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                                            <BarChart3 size={32} />
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sem dados financeiros</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-4 bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50">
                                <h3 className="text-lg font-black text-slate-800 mb-6">Resumo Mensal</h3>
                                <div className="space-y-4">
                                    {financeBI?.slice(-4).reverse().map((item: any) => (
                                        <div key={item.month} className="p-4 rounded-3xl bg-stats-cyan/5 border border-transparent hover:border-slate-100 transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-black text-slate-900">{formatFinanceMonth(item.month)}</span>
                                                <span className={cn("text-xs font-black", item.balance >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                    {formatCurrency(item.balance)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Entradas</p>
                                                    <p className="text-[10px] font-black text-emerald-500">{formatCurrency(item.entry)}</p>
                                                </div>
                                                <div className="space-y-0.5 text-right">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Saídas</p>
                                                    <p className="text-[10px] font-black text-rose-500">{formatCurrency(item.exit)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => window.location.href = '/finance'}
                                    className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    Ver Detalhes <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>


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
        </motion.div>
    );
}
