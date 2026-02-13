import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
    LayoutDashboard,
    Calendar,
    Droplet,
    Users,
    CalendarDays,
    ClipboardList,
    MessageSquare,
    GraduationCap,
    Menu,
    X,
    Bell,
    Search,
    User as UserIcon,
    ChevronRight
} from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: ReactNode;
}

const menuItems = [
    {
        group: "Navigation", items: [
            { title: "Dashboard", icon: LayoutDashboard, href: "/" },
            { title: "Agenda", icon: Calendar, href: "/agenda" },
        ]
    },
    {
        group: "Batismo", items: [
            { title: "Batismos", icon: Droplet, href: "/baptisms" },
            { title: "Solicitações", icon: ClipboardList, href: "/requests" },
            { title: "Formação", icon: GraduationCap, href: "/formation" },
        ]
    },
    {
        group: "Pastoral", items: [
            { title: "Reuniões", icon: Users, href: "/meetings" },
            { title: "Eventos", icon: CalendarDays, href: "/events" },
            { title: "Comunicação", icon: MessageSquare, href: "/communication" },
        ]
    }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [location] = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { isAdmin, isSecretary, isLoading, role } = useRole();

    console.log("[DashboardLayout] Rendering. Loading:", isLoading, "Role:", role);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#f6f7fb]">
                <div className="flex flex-col items-center gap-4">
                    <img src="/dove.png" alt="Loading..." className="w-16 h-16 object-contain" />
                    <p className="text-slate-500 font-bold animate-pulse">Carregando Pastoral...</p>
                </div>
            </div>
        );
    }

    console.log("[DashboardLayout] Finished loading. Mounting main UI.");

    return (
        <div className="flex h-screen bg-[#f6f7fb]">
            {/* Sidebar */}
            <aside className={cn(
                "bg-[#404e67] text-white transition-all duration-300 flex-shrink-0 z-50",
                sidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="h-16 flex items-center px-6 gap-3 bg-[#354054]">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img src="/dove.png" alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
                    </div>
                    {sidebarOpen && <span className="font-bold text-lg tracking-tight">Pastoral do Batismo</span>}
                </div>

                <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin scrollbar-thumb-white/10">
                    {menuItems.map((group) => (
                        <div key={group.group} className="space-y-1">
                            {sidebarOpen && (
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 py-2">
                                    {group.group}
                                </p>
                            )}
                            {group.items.map((item) => {
                                const active = location === item.href;
                                return (
                                    <Link href={item.href} key={item.title}>
                                        <div className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group mb-1",
                                            active
                                                ? "bg-stats-cyan text-white shadow-lg shadow-stats-cyan/20"
                                                : "text-white/60 hover:bg-white/5 hover:text-white"
                                        )}>
                                            <item.icon size={20} className={cn(
                                                "min-w-[20px]",
                                                active ? "text-white" : "group-hover:text-stats-cyan"
                                            )} />
                                            {sidebarOpen && (
                                                <div className="flex-1 flex justify-between items-center">
                                                    <span className="text-sm font-medium whitespace-nowrap">{item.title}</span>
                                                    {active && <ChevronRight className="w-4 h-4 text-white" />}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 focus-within:ring-2 ring-stats-cyan/20 transition-all">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search..." className="bg-transparent border-none text-sm outline-none w-48" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-stats-pink rounded-full border-2 border-white" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1" />
                        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-9 h-9 rounded-lg border-2 border-stats-cyan"
                                    }
                                }}
                            />
                        </div>
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-[1440px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
