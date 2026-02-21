import { format, parseISO, isValid, differenceInDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data para exibição amigável em pt-BR.
 * Evita problemas de fuso horário tratando a string de data como UTC se necessário.
 */
export function formatDate(date: string | Date | null | undefined, formatStr: string = "dd/MM/yyyy"): string {
    if (!date) return "-";

    const d = typeof date === "string" ? parseISO(date) : date;

    if (!isValid(d)) return "-";

    return format(d, formatStr, { locale: ptBR });
}

/**
 * Retorna o nome do mês e ano de uma data.
 */
export function formatMonthYear(date: Date): string {
    return format(date, "MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Converte uma data para o formato aceito pelo input type="date" (yyyy-MM-dd)
 */
export function toInputDate(date: string | Date | null | undefined): string {
    if (!date) return "";
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "";
    return format(d, "yyyy-MM-dd");
}

/**
 * Retorna um rótulo "inteligente" para o status baseado na proximidade da data.
 */
export function getSmartBadge(dateStr: string | Date | null | undefined, status?: string) {
    if (!dateStr) return null;
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    if (!isValid(d)) return null;

    if (status?.toLowerCase() === "cancelado") return { text: "CANCELADO", variant: "canceled" };

    const now = startOfDay(new Date());
    const eventDate = startOfDay(d);
    const diff = differenceInDays(eventDate, now);

    if (diff === 0) return { text: "É HOJE!", variant: "today" };
    if (diff === 1) return { text: "É AMANHÃ!", variant: "tomorrow" };
    if (diff > 1 && diff <= 7) return { text: `Faltam ${diff} dias`, variant: "countdown", days: diff };

    return status ? { text: status.toUpperCase(), variant: "default" } : null;
}
