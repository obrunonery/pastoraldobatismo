import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRole } from "@/hooks/useRole";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export default function Finance() {
    const { isFinance } = useRole();
    const { data: transactionsResponse, isLoading } = trpc.finance.list.useQuery();
    const transactions = Array.isArray(transactionsResponse) ? transactionsResponse : [];

    const totalIncome = transactions
        .filter((t: any) => t.type === "entrada")
        .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const totalExpense = transactions
        .filter((t: any) => t.type === "saída")
        .reduce((acc: number, t: any) => acc + Number(t.value), 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Financeiro</h1>
                    <p className="text-slate-600 mt-1">Gestão de dízimos, ofertas e despesas da pastoral</p>
                </div>
                {isFinance && (
                    <Button className="gap-2 bg-stats-green hover:bg-stats-green/90">
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-stats-cyan to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/80 text-sm font-medium mb-1">Saldo Total</p>
                                <h3 className="text-3xl font-bold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            </div>
                            <Wallet className="w-8 h-8 text-white/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white">
                    <CardContent className="p-6 text-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Entradas</p>
                                <h3 className="text-3xl font-bold text-stats-green">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            </div>
                            <TrendingUp className="w-8 h-8 text-stats-green/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white">
                    <CardContent className="p-6 text-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">Saídas</p>
                                <h3 className="text-3xl font-bold text-stats-pink">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            </div>
                            <TrendingDown className="w-8 h-8 text-stats-pink/20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Transações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Data</th>
                                    <th className="px-6 py-3 font-bold">Descrição</th>
                                    <th className="px-6 py-3 font-bold">Categoria</th>
                                    <th className="px-6 py-3 font-bold text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.length > 0 ? (
                                    transactions.map((t: any) => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-600">
                                                {formatDate(t.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                                        t.type === 'entrada' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                                    )}>
                                                        {t.type === 'entrada' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{t.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary" className="font-medium">
                                                    {t.category || "Geral"}
                                                </Badge>
                                            </td>
                                            <td className={cn(
                                                "px-6 py-4 text-right font-bold",
                                                t.type === 'entrada' ? "text-stats-green" : "text-stats-pink"
                                            )}>
                                                {t.type === 'entrada' ? "+" : "-"} R$ {Number(t.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            Nenhuma transação registrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
