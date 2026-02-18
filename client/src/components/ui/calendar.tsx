import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useDayPicker } from "react-day-picker"
import { addYears, format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                month_caption: "flex justify-center pt-1 relative items-center mb-8",
                caption_label: "hidden",
                nav: "flex items-center gap-1",
                button_previous: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity absolute left-0 top-1.5"
                ),
                button_next: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity absolute right-0 top-1.5"
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex w-full justify-between mb-4",
                weekday: "text-slate-400 w-10 font-bold text-[11px] uppercase tracking-widest text-center",
                week: "flex w-full justify-between mt-2",
                day: "h-11 w-11 p-0 font-normal flex items-center justify-center relative",
                day_button: "h-11 w-11 flex items-center justify-center rounded-2xl",
                selected: "bg-blue-600 !text-white rounded-2xl",
                today: "font-bold text-blue-600",
                day_today: "",
                day_selected: "bg-blue-600 text-white rounded-2xl",
                outside: "text-slate-200 opacity-50",
                disabled: "text-slate-200 opacity-50",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: (props) => {
                    if (props.orientation === 'left') return <ChevronLeft className="h-4 w-4" />
                    return <ChevronRight className="h-4 w-4" />
                },
                MonthCaption: (props) => {
                    const { goToMonth } = useDayPicker();
                    const month = props.calendarMonth.date;

                    const handlePrevYear = (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (month && !isNaN(month.getTime())) {
                            goToMonth(addYears(month, -1));
                        }
                    };

                    const handleNextYear = (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (month && !isNaN(month.getTime())) {
                            goToMonth(addYears(month, 1));
                        }
                    };

                    return (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl font-bold text-slate-900 tracking-tight capitalize">
                                {month && !isNaN(month.getTime())
                                    ? format(month, "MMMM", { locale: ptBR })
                                    : "Mês Inválido"}
                            </span>
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-100 ml-1">
                                <button
                                    onClick={handlePrevYear}
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-400 hover:text-blue-600 cursor-pointer"
                                    type="button"
                                >
                                    <ChevronLeft className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-black text-slate-900 mx-1 tabular-nums">
                                    {month && !isNaN(month.getTime()) ? month.getFullYear() : "----"}
                                </span>
                                <button
                                    onClick={handleNextYear}
                                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-400 hover:text-blue-600 cursor-pointer"
                                    type="button"
                                >
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    );
                }
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
