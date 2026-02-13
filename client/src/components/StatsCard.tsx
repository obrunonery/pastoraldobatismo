import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    updateTime?: string;
    icon: LucideIcon;
    variant: "orange" | "green" | "pink" | "cyan";
    className?: string;
}

const variantStyles = {
    orange: "bg-(--color-stats-orange) text-white",
    green: "bg-(--color-stats-green) text-white",
    pink: "bg-(--color-stats-pink) text-white",
    cyan: "bg-(--color-stats-cyan) text-white",
};

export function StatsCard({ title, value, updateTime, icon: Icon, variant, className }: StatsCardProps) {
    return (
        <Card className={cn("border-none shadow-lg overflow-hidden transition-transform hover:scale-105", variantStyles[variant], className)}>
            <CardContent className="p-6 relative">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                        <h3 className="text-3xl font-bold">{value}</h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Gráfico decorativo (simulado com SVG estilo a referência) */}
                <div className="mt-4 flex items-end justify-between">
                    {updateTime && (
                        <div className="flex items-center gap-1.5 text-xs text-white/70 bg-black/10 px-2 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-white/50 animate-pulse" />
                            update : {updateTime}
                        </div>
                    )}
                    <svg className="w-16 h-8 text-white/30" viewBox="0 0 100 40">
                        <path
                            d="M0,40 L10,35 L20,38 L30,25 L40,30 L50,15 L60,20 L70,5 L80,10 L90,2 L100,5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}
