import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Droplets, AlertTriangle, Pill, Phone, Stethoscope, Save, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserProfile, updateUserProfile } from '../services/authService';
import { UserProfile } from '../types';

export function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const data = await getUserProfile();
        setProfile(data);
        if (data) {
            setFormData(data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData) return;

        // Optimistic update
        setProfile(prev => prev ? { ...prev, ...formData } : null);
        setIsEditing(false);

        const { error } = await updateUserProfile(formData);
        if (error) {
            console.error(error);
            alert('Nota: Algunos campos podrían no guardarse si la base de datos no está actualizada.');
        }
    };

    const handleChange = (field: keyof UserProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050506] flex items-center justify-center">
                <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_20px_rgba(255,215,0,0.1)]"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-[#050506] pb-32 font-sans text-white selection:bg-primary/30 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none opacity-50"></div>
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -ml-40 pointer-events-none opacity-30"></div>

            {/* Navbar */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0A0A0C]/90 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-10 h-10 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5 text-white/70" />
                </button>
                <h1 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/80">Identidad Digital</h1>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border transition-all duration-300",
                        isEditing
                            ? "bg-success text-[#050506] border-success shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                            : "bg-white/5 text-primary border-white/5 hover:border-primary/40"
                    )}
                >
                    {isEditing ? <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> CONFIRMAR</span> : 'Ajustar'}
                </button>
            </div>

            <div className="px-6 py-10 flex flex-col items-center relative z-10">
                <div className="relative mb-8 group">
                    <div className="absolute inset-[-15px] bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute inset-[-10px] border border-primary/20 rounded-full animate-spin-slow"></div>
                    <div className="relative w-36 h-36 rounded-[3rem] border-2 border-white/10 bg-[#0A0A0C] flex flex-col items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none opacity-50"></div>
                        <div className="text-6xl mb-2 relative z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                           {profile.owl_type === 'polluelo' ? '🐣' : profile.owl_type === 'centinela' ? '🦉' : '🧙‍♂️'}
                        </div>
                        <div className="bg-primary text-[#050506] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest relative z-10 shadow-[0_5px_15px_rgba(255,215,0,0.3)]">
                           NIVEL {profile.level || 1}
                        </div>
                    </div>
                </div>

                <div className="text-center w-full max-w-sm space-y-4 mb-10">
                    <div className="flex flex-col items-center gap-1.5">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white leading-none">
                            {profile.anonymous_id || 'Agente Fantasma'}
                        </h2>
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">Operador del Sistema Redux</span>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="w-full space-y-3 pt-6 px-2">
                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Experiencia Táctica</span>
                            <span className="text-[10px] font-mono text-primary font-bold">{profile.xp || 0} <span className="text-white/20">/</span> {(profile.level || 1) * 1000} XP</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner relative">
                            <div
                                className="h-full bg-primary shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all duration-1000 ease-out behavior-smooth rounded-full"
                                style={{ width: `${((profile.xp || 0) / ((profile.level || 1) * 1000)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-sm space-y-8">
                    {/* Sector / Barrio */}
                    <div className="bg-[#0A0A0C]/80 border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 opacity-50"></div>
                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 block ml-1">Sector Operativo</label>
                        {isEditing ? (
                            <select
                                value={formData.neighborhood || ''}
                                onChange={(e) => handleChange('neighborhood', e.target.value)}
                                className="w-full bg-[#111113] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-medium appearance-none cursor-pointer"
                            >
                                <option value="">Asignar Sector...</option>
                                <option value="Piantini">Piantini</option>
                                <option value="Naco">Naco</option>
                                <option value="Gazcue">Gazcue</option>
                                <option value="Bella Vista">Bella Vista</option>
                                <option value="Zona Colonial">Zona Colonial</option>
                            </select>
                        ) : (
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(255,215,0,0.1)] group-hover:scale-110 transition-transform duration-500">
                                       <Shield className="w-6 h-6" />
                                    </div>
                                    <span className="font-black text-lg text-white uppercase tracking-tight">{profile.neighborhood || 'Zona Desactivada'}</span>
                                </div>
                                <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">ACTIVO</div>
                            </div>
                        )}
                    </div>

                    {/* Medical Data */}
                    <div className="space-y-4">
                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] pl-4 flex items-center gap-3">
                            <Stethoscope className="w-4 h-4 text-rose-500" /> Historial Biométrico
                        </h3>

                        <div className="grid gap-4">
                            <EditCard
                                icon={<Droplets className="w-5 h-5" />}
                                iconBg="bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                label="Grupo Sanguíneo"
                                value={formData.blood_type}
                                field="blood_type"
                                editing={isEditing}
                                onChange={handleChange}
                                placeholder="Ej: O+"
                            />
                            <EditCard
                                icon={<AlertTriangle className="w-5 h-5" />}
                                iconBg="bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                label="Alergias Detectadas"
                                value={formData.allergies}
                                field="allergies"
                                editing={isEditing}
                                onChange={handleChange}
                                placeholder="Nueces, Penicilina..."
                            />
                            <EditCard
                                icon={<Pill className="w-5 h-5" />}
                                iconBg="bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                label="Medicación de Apoyo"
                                value={formData.medications}
                                field="medications"
                                editing={isEditing}
                                onChange={handleChange}
                                placeholder="Insulina, etc."
                            />
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] pl-4">Enlace de Emergencia</h3>
                        <div className="bg-[#0A0A0C]/60 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <input
                                        className="w-full bg-[#111113] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all font-medium"
                                        placeholder="Nombre del Enlace"
                                        value={formData.emergency_contact_name || ''}
                                        onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                                    />
                                    <input
                                        className="w-full bg-[#111113] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-all font-medium"
                                        placeholder="Vector de Frecuencia (Teléfono)"
                                        value={formData.emergency_contact_phone || ''}
                                        onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/30 group-hover:text-primary transition-colors">
                                          <Users className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <p className="font-black text-base text-white uppercase tracking-tight leading-none mb-1">{profile.emergency_contact_name || 'Sin Configurar'}</p>
                                          <p className="text-[10px] font-mono text-white/30 font-bold tracking-widest">{profile.emergency_contact_phone || 'FRECUENCIA NO ASIGNADA'}</p>
                                       </div>
                                    </div>
                                    {profile.emergency_contact_phone && (
                                        <button 
                                          onClick={() => window.location.href = `tel:${profile.emergency_contact_phone}`}
                                          className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 text-success flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:bg-success hover:text-[#050506] transition-all active:scale-90"
                                        >
                                            <Phone className="w-5 h-5 fill-current" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditCard({ icon, label, value, iconBg, editing, onChange, field, placeholder }: any) {
    return (
        <div className="bg-[#0A0A0C]/50 backdrop-blur-3xl border border-white/5 rounded-[1.8rem] p-5 flex items-center justify-between group hover:bg-[#0A0A0C]/80 transition-colors">
            <div className="flex items-center gap-5 w-full">
                <div className={cn("w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500", iconBg)}>
                    {icon}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-1.5">{label}</p>
                    {editing ? (
                        <input
                            className="w-full bg-[#111113] border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-medium focus:outline-none focus:border-primary/40 transition-all"
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            placeholder={placeholder}
                        />
                    ) : (
                        <p className="font-black text-[13px] text-white/90 uppercase truncate tracking-tight">{value || '--'}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

