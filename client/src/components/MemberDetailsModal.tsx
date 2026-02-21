import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, Cake, Heart, Users, Calendar, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: any;
    onEdit?: () => void;
    onDelete?: () => void;
    hasAdminAccess?: boolean;
}

export function MemberDetailsModal({ open, onOpenChange, member, onEdit, onDelete, hasAdminAccess }: MemberDetailsModalProps) {
    if (!member) return null;

    const formatPartialDate = (dateStr: string) => {
        if (!dateStr) return null;
        if (dateStr.includes("/")) {
            const [d, m] = dateStr.split("/");
            const months = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];
            const monthName = months[parseInt(m) - 1];
            return `${d} de ${monthName}`;
        }
        return dateStr;
    };

    const getRoleLabel = (role: string) => {
        const roles: any = {
            coordenador: "Coordenador(a)",
            COORDENADOR: "Coordenador(a)",
            vice_coordenador: "Vice-Coordenador(a)",
            VICE_COORDENADOR: "Vice-Coordenador(a)",
            membro: "Membro da Pastoral",
            MEMBER: "Membro da Pastoral",
            pastoral: "Membro da Pastoral",
            secretario: "Secretário(a)",
            SECRETARY: "Secretário(a)",
            financeiro: "Financeiro",
            FINANCE: "Financeiro",
            admin: "Administrador(a)",
            ADMIN: "Administrador(a)",
            celebrante: "Celebrante",
            CELEBRANTE: "Celebrante",
        };
        return roles[role] || role || "Membro";
    };

    const sacraments = member.sacraments ? (typeof member.sacraments === 'string' ? (JSON.parse(member.sacraments) || {}) : member.sacraments) : {};
    const childrenData = member.childrenData ? (typeof member.childrenData === 'string' ? (JSON.parse(member.childrenData) || []) : member.childrenData) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-0 border-none shadow-2xl bg-white rounded-[32px] max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="px-8 pt-10 pb-10 flex flex-col items-center">
                    {/* Perfil Header */}
                    <div className="relative mb-6">
                        <div className="w-28 h-28 rounded-full ring-4 ring-slate-50 ring-offset-4 overflow-hidden bg-slate-100 shadow-inner">
                            {member.photoUrl ? (
                                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <User size={48} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center space-y-1 mb-10">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{member.name}</h2>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stats-cyan">
                            {getRoleLabel(member.role)}
                        </span>
                    </div>

                    {/* Informações em Blocos Minimalistas */}
                    <div className="w-full space-y-8">
                        <div className="grid grid-cols-1 gap-6">
                            {(member.email || member.phone) && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase text-slate-300 tracking-[0.15em] px-1">Contato</h4>
                                    <div className="space-y-4">
                                        {member.email && (
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-stats-cyan group-hover:text-white transition-all">
                                                    <Mail size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">{member.email}</span>
                                            </div>
                                        )}
                                        {member.phone && (
                                            <a
                                                href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 group cursor-pointer"
                                            >
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <Phone size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{member.phone}</span>
                                                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Enviar Mensagem</span>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {member.address && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase text-slate-300 tracking-[0.15em] px-1">Endereço</h4>
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5 group-hover:bg-stats-cyan group-hover:text-white transition-all">
                                            <MapPin size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 flex-1 leading-relaxed">{member.address}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black uppercase text-slate-300 tracking-[0.15em] px-1">Datas Especiais</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {member.birthDate && (
                                        <div className="p-4 rounded-[20px] bg-slate-50 flex flex-col items-center gap-1.5 border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                                            <Cake size={20} className="text-stats-cyan mb-1" />
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Nascimento</span>
                                            <span className="text-xs font-black text-slate-700">{formatPartialDate(member.birthDate)}</span>
                                        </div>
                                    )}
                                    {member.maritalStatus === 'casado' && member.weddingDate && (
                                        <div className="p-4 rounded-[20px] bg-slate-50 flex flex-col items-center gap-1.5 border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                                            <Heart size={20} className="text-stats-pink mb-1" />
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Casamento</span>
                                            {member.spouseName && (
                                                <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">
                                                    {member.spouseName}
                                                </span>
                                            )}
                                            <span className="text-xs font-black text-slate-500">{formatPartialDate(member.weddingDate)}</span>
                                        </div>
                                    )}
                                    {childrenData.map((child: any, idx: number) => (
                                        <div key={idx} className="p-4 rounded-[20px] bg-slate-50 flex flex-col items-center gap-1.5 border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                                            <User size={20} className="text-slate-400 mb-1" />
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Filho(a)</span>
                                            <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">
                                                {child.name}
                                            </span>
                                            {child.birth && (
                                                <span className="text-xs font-black text-slate-500">{formatPartialDate(child.birth)}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {sacraments && Object.values(sacraments).some(v => v === true) && (
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black uppercase text-slate-300 tracking-[0.15em] px-1">Sacramentos</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {sacraments.baptism && <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">Batismo</div>}
                                        {sacraments.eucharist && <div className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider">Eucaristia</div>}
                                        {sacraments.confirmation && <div className="px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider">Crisma</div>}
                                        {sacraments.marriage && <div className="px-4 py-1.5 rounded-full bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-wider">Matrimônio</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {hasAdminAccess && (
                    <div className="px-8 pb-10 flex gap-3">
                        <Button
                            onClick={onEdit}
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl border-slate-100 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-stats-cyan transition-all gap-2"
                        >
                            <Edit size={14} /> Editar
                        </Button>
                        <Button
                            onClick={onDelete}
                            variant="outline"
                            className="flex-1 h-12 rounded-2xl border-slate-100 font-black uppercase text-[10px] tracking-widest text-stats-pink hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all gap-2"
                        >
                            <Trash2 size={14} /> Excluir
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
