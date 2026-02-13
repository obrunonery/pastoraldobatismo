import { format, parseISO, isValid } from "date-fns";
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
