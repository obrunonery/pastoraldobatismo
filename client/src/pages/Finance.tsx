import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, TrendingUp, TrendingDown, Calendar, Calculator, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import { FinanceFormModal } from "@/components/FinanceFormModal";
import { toast } from "sonner";
import { useRole } from "@/hooks/useRole";

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
            const month = t.date.substring(0, 7); // YYYY-MM
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
                    <p className="text-slate-600 mt-1">Gestão detalhada de dízimos, ofertas e despesas</p>
                </div>
                {(isAdmin || isFinance) && (
                    <Button onClick={() => { setSelectedTransaction(null); setModalOpen(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                        <Plus size={18} />
                        Nova Transação
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stats-cyan"></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-gradient-to-br from-stats-cyan to-blue-700 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={80} /></div>
                    <CardContent className="p-6 relative">
                        <p className="text-white/80 text-sm font-black uppercase tracking-widest mb-1">Saldo em Caixa</p>
                        <h3 className="text-4xl font-black">{formatCurrency(balance)}</h3>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Entradas</p>
                                <h3 className="text-3xl font-black text-emerald-600">{formatCurrency(totalIncome)}</h3>
                            </div>
                            <TrendingUp className="text-emerald-500/20" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white border-l-4 border-l-stats-pink">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Saídas</p>
                                <h3 className="text-3xl font-black text-stats-pink">{formatCurrency(totalExpense)}</h3>
                            </div>
                            <TrendingDown className="text-stats-pink/20" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <Card className="shadow-md border-none">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Resumo Mensal</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-50">
                                {monthlyBreakdown.map((item) => (
                                    <div key={item.month} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-700">{item.month}</span>
                                            <Badge variant={(item.entry - item.exit) >= 0 ? "success" : "destructive"} className="font-black">
                                                {formatCurrency(item.entry - item.exit)}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider">
                                            <span className="text-emerald-600">Entradas: {formatCurrency(item.entry)}</span>
                                            <span className="text-stats-pink">Saídas: {formatCurrency(item.exit)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="shadow-md border-none overflow-hidden">
                        <CardHeader className="border-b border-gray-50 bg-white">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Histórico de Transações</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-gray-400 uppercase font-black bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Descrição</th>
                                            <th className="px-6 py-4">Categoria</th>
                                            <th className="px-6 py-4 text-right">Valor</th>
                                            {(isAdmin || isFinance) && <th className="px-6 py-4 text-center">Ações</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {transactions.map((t: any) => (
                                            <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-6 py-4 font-bold text-slate-500">{formatDate(t.date)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                                            t.type === 'entrada' ? "bg-emerald-100 text-emerald-600" : "bg-stats-pink/10 text-stats-pink"
                                                        )}>
                                                            {t.type === 'entrada' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                        </div>
                                                        <span className="font-bold text-slate-800">{t.description}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 text-slate-400">
                                                        {t.category || "Geral"}
                                                    </Badge>
                                                </td>
                                                <td className={cn(
                                                    "px-6 py-4 text-right font-black",
                                                    t.type === 'entrada' ? "text-emerald-600" : "text-stats-pink"
                                                )}>
                                                    {t.type === 'entrada' ? "+" : "-"} {formatCurrency(t.value)}
                                                </td>
                                                {(isAdmin || isFinance) && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                                        onClick={() => handleEdit(t)}
                                                                        className="gap-2 cursor-pointer font-medium py-2 rounded-xl focus:bg-stats-cyan/10"
                                                                    >
                                                                        <Edit size={14} className="text-stats-cyan" />
                                                                        Editar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDelete(t.id)}
                                                                        className="gap-2 cursor-pointer font-medium py-2 rounded-xl text-rose-600 focus:bg-rose-50"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        Excluir
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
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
