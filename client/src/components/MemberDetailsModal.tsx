import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Cake, Heart, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: any;
}

export function MemberDetailsModal({ open, onOpenChange, member }: MemberDetailsModalProps) {
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
            vice_coordenador: "Vice-Coordenador(a)",
            membro: "Pastoral",
            secretario: "Secretário",
            financeiro: "Financeiro",
        };
        return roles[role] || role || "Membro";
    };

    const sacraments = member.sacraments ? (typeof member.sacraments === 'string' ? JSON.parse(member.sacraments) : member.sacraments) : {};
    const childrenData = member.childrenData ? (typeof member.childrenData === 'string' ? JSON.parse(member.childrenData) : member.childrenData) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className="relative h-32 bg-gradient-to-r from-stats-cyan to-stats-cyan/60" />

                <div className="px-6 pb-6 -mt-12 relative">
                    <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-300">
                                {member.photoUrl ? (
                                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-1 mb-6">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">{member.name}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 border-none px-3">
                                {getRoleLabel(member.role)}
                            </Badge>
                            <Badge className={cn("text-[10px] uppercase font-black px-3",
                                member.status === 'ativo' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                            )}>
                                {member.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Contato & Endereço */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-1">Contato e Localização</h4>
                            <div className="space-y-2 text-sm font-medium text-slate-600">
                                {member.email && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div> {member.email}</div>}
                                {member.phone && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={16} /></div> {member.phone}</div>}
                                {member.address && <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><MapPin size={16} /></div> {member.address}</div>}
                            </div>
                        </div>

                        {/* Datas e Família */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-1">Datas e Família</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {member.birthDate && (
                                    <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                                        <div className="text-stats-cyan"><Cake size={16} /></div>
                                        <div className="text-[10px] font-black uppercase text-slate-400">Nascimento</div>
                                        <div className="text-xs font-bold text-slate-700">{formatPartialDate(member.birthDate)}</div>
                                    </div>
                                )}
                                {member.maritalStatus === 'casado' && member.weddingDate && (
                                    <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                                        <div className="text-stats-pink"><Heart size={16} /></div>
                                        <div className="text-[10px] font-black uppercase text-slate-400">Casamento</div>
                                        <div className="text-xs font-bold text-slate-700">{formatPartialDate(member.weddingDate)}</div>
                                    </div>
                                )}
                            </div>
                            {member.maritalStatus === 'casado' && member.spouseName && (
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600 px-1">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Users size={16} /></div>
                                    <span>Cônjuge: <span className="font-bold text-slate-700">{member.spouseName}</span></span>
                                </div>
                            )}
                        </div>

                        {/* Sacramentos */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-1">Sacramentos</h4>
                            <div className="flex flex-wrap gap-2">
                                {sacraments.baptism && <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100 font-bold">Batismo</Badge>}
                                {sacraments.eucharist && <Badge variant="outline" className="bg-amber-50/50 text-amber-600 border-amber-100 font-bold">Eucaristia</Badge>}
                                {sacraments.confirmation && <Badge variant="outline" className="bg-purple-50/50 text-purple-600 border-purple-100 font-bold">Crisma</Badge>}
                                {sacraments.marriage && <Badge variant="outline" className="bg-pink-50/50 text-pink-600 border-pink-100 font-bold">Matrimônio</Badge>}
                                {!sacraments.baptism && !sacraments.eucharist && !sacraments.confirmation && !sacraments.marriage && (
                                    <span className="text-xs text-slate-400 italic font-medium">Nenhum sacramento informado</span>
                                )}
                            </div>
                        </div>

                        {/* Filhos */}
                        {childrenData.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-1">Filhos ({childrenData.length})</h4>
                                <div className="space-y-2">
                                    {childrenData.map((child: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm"><User size={12} /></div>
                                                <span className="text-xs font-bold text-slate-700">{child.name}</span>
                                            </div>
                                            {child.birthDate && (
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <Calendar size={10} /> {formatPartialDate(child.birthDate)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
