import { Plus, Wallet, TrendingUp, TrendingDown, Calculator, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import { FinanceFormModal } from "@/components/FinanceFormModal";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";
import { motion, AnimatePresence } from "framer-motion";

export default function Finance() {
    const { isFinance, isAdmin } = useRole();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const utils = trpc.useUtils();

    const { data: transactionsResponse, isLoading } = trpc.finance.list.useQuery();
    const transactions = Array.isArray(transactionsResponse) ? transactionsResponse : [];

    const createMutation = trpc.finance.create.useMutation({
        onSuccess: () => {
            toast.success("Transação registrada!");
            utils.finance.list.invalidate();
            setModalOpen(false);
        }
    });

    const updateMutation = trpc.finance.update.useMutation({
        onSuccess: () => {
            toast.success("Transação atualizada!");
            utils.finance.list.invalidate();
            setModalOpen(false);
            setSelectedTransaction(null);
        }
    });

    const deleteMutation = trpc.finance.delete.useMutation({
        onSuccess: () => {
            toast.success("Transação excluída!");
            utils.finance.list.invalidate();
        }
    });

    const monthlyBreakdown = useMemo(() => {
        const months: Record<string, { entry: number, exit: number }> = {};
        transactions.forEach((t: any) => {
            const month = t.date.substring(0, 7);
            if (!months[month]) months[month] = { entry: 0, exit: 0 };
            if (t.type === "entrada") months[month].entry += Number(t.value);
            else months[month].exit += Number(t.value);
        });
        return Object.entries(months)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, data]) => ({ month, ...data }));
    }, [transactions]);

    const totalIncome = transactions
        .filter((t: any) => t.type === "entrada")
        .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const totalExpense = transactions
        .filter((t: any) => t.type === "saída")
        .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const balance = totalIncome - totalExpense;

    const handleEdit = (transaction: any) => {
        setSelectedTransaction(transaction);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta transação?")) {
            await deleteMutation.mutateAsync({ id });
        }
    };

    return (
        <div className="space-y-10 bg-slate-50/30 min-h-screen p-2 sm:p-6 rounded-[40px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 text-center md:text-left">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fluxo Financeiro</h1>
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Gestão de Dízimos e Ofertas</p>
                </div>
                {(isAdmin || isFinance) && (
                    <button
                        onClick={() => { setSelectedTransaction(null); setModalOpen(true); }}
                        className="h-12 px-8 bg-emerald-500 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all mx-auto md:mx-0"
                    >
                        <Plus size={18} />
                        Nova Transação
                    </button>
                )}
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                <div className="bg-stats-cyan rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-stats-cyan/20 group">
                    <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" fill="currentColor" />
                    <div className="relative z-10 space-y-2">
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Saldo em Caixa</p>
                        <h3 className="text-4xl font-black tracking-tighter">{formatCurrency(balance)}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden group">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Total Entradas</p>
                            <h3 className="text-3xl font-black text-emerald-500 tracking-tight">{formatCurrency(totalIncome)}</h3>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center transition-transform group-hover:rotate-12">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 relative overflow-hidden group">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Total Saídas</p>
                            <h3 className="text-3xl font-black text-stats-pink tracking-tight">{formatCurrency(totalExpense)}</h3>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-stats-pink/10 text-stats-pink flex items-center justify-center transition-transform group-hover:rotate-12">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-2">
                {/* Monthly Evolution Chart */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col h-full">
                        <div className="mb-6 px-2">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Previsão e Saúde</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">Últimos 6 Meses de Fluxo</p>
                        </div>

                        <div className="flex-1 min-h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyBreakdown.slice(0, 6).reverse()} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 900 }}
                                        tickFormatter={(val) => val.split('-')[1]}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 900 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-50 space-y-1">
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{data.month}</p>
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Entrada</span>
                                                                <span className="text-[11px] font-black text-slate-700">{formatCurrency(data.entry)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-[10px] font-bold text-rose-500 uppercase">Saída</span>
                                                                <span className="text-[11px] font-black text-slate-700">{formatCurrency(data.exit)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="entry" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                                    <Bar dataKey="exit" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={12} fillOpacity={0.4} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-around">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entradas</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-rose-400/40" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saídas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.03)] border border-slate-50 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Histórico de Transações</h4>
                            <div className="flex items-center gap-2">
                                <Calculator size={14} className="text-slate-200" />
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{transactions.length} Registros</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-50">
                                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Movimentação</th>
                                        <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                        <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor / Categoria</th>
                                        {(isAdmin || isFinance) && <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Ações</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence mode="popLayout">
                                        {transactions.map((t: any) => (
                                            <motion.tr
                                                key={t.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                                            t.type === 'entrada' ? "bg-emerald-50 text-emerald-500" : "bg-stats-pink/5 text-stats-pink"
                                                        )}>
                                                            {t.type === 'entrada' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 tracking-tight">{t.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2.5">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{formatDate(t.date)}</span>
                                                </td>
                                                <td className="px-6 py-2.5 text-right">
                                                    <div className="flex flex-col">
                                                        <span className={cn(
                                                            "font-black tracking-tighter text-sm",
                                                            t.type === 'entrada' ? "text-emerald-500" : "text-stats-pink"
                                                        )}>
                                                            {t.type === 'entrada' ? "+" : "-"} {formatCurrency(t.value)}
                                                        </span>
                                                        <span className="text-[8px] font-black uppercase text-slate-300 tracking-[0.1em]">
                                                            {t.category || "Geral"}
                                                        </span>
                                                    </div>
                                                </td>
                                                {(isAdmin || isFinance) && (
                                                    <td className="px-6 py-2.5">
                                                        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 hover:text-stats-cyan transition-all">
                                                                        <MoreHorizontal size={14} />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-40 rounded-2xl shadow-xl border-slate-50 p-1">
                                                                    <DropdownMenuItem onClick={() => handleEdit(t)} className="gap-2 p-2 rounded-xl font-bold text-[10px] uppercase tracking-tighter cursor-pointer focus:bg-stats-cyan/5 text-slate-600">
                                                                        <Edit size={12} className="text-stats-cyan" />
                                                                        Editar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDelete(t.id)} className="gap-2 p-2 rounded-xl font-bold text-[10px] uppercase tracking-tighter cursor-pointer focus:bg-rose-50 text-rose-500">
                                                                        <Trash2 size={12} />
                                                                        Excluir
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <FinanceFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setSelectedTransaction(null);
                }}
                initialData={selectedTransaction}
                onSubmit={async (data) => {
                    if (selectedTransaction) {
                        await updateMutation.mutateAsync({ id: selectedTransaction.id, ...data });
                    } else {
                        await createMutation.mutateAsync(data);
                    }
                }}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
