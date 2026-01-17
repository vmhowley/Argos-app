import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Verified, Shield, Droplets, AlertTriangle, Pill, Phone, Plus, User, Stethoscope, Save, X } from 'lucide-react';
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
            <div className="min-h-screen bg-[#110505] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="min-h-screen bg-[#110505] pb-28 font-display text-white">
            {/* Navbar */}
            <div className="sticky top-0 z-50 flex items-center justify-between p-4 border-b border-white/5 bg-[#110505]/80 backdrop-blur-xl">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">Safety ID</h1>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={cn("text-sm font-bold uppercase px-3 py-1 rounded-full border transition-all",
                        isEditing
                            ? "bg-green-500/10 text-green-500 border-green-500/50"
                            : "bg-white/5 text-primary border-transparent"
                    )}
                >
                    {isEditing ? <span className="flex items-center gap-1"><Save className="w-3 h-3" /> Save</span> : 'Edit'}
                </button>
            </div>

            <div className="p-6 flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                    <div className="relative w-32 h-32 rounded-full border-4 border-[#110505] bg-white/5 flex items-center justify-center overflow-hidden shadow-2xl">
                        <User className="w-16 h-16 text-white/50" />
                    </div>
                </div>

                <div className="text-center w-full max-w-xs space-y-2">
                    {isEditing ? (
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Alias / Code Name</label>
                            <input
                                value={formData.anonimo_id || ''}
                                onChange={(e) => handleChange('anonimo_id', e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-center font-bold text-white w-full focus:outline-none focus:border-primary"
                            />
                        </div>
                    ) : (
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                            {profile.anonimo_id || 'Anonymous Agent'}
                        </h2>
                    )}

                    {!isEditing && (
                        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
                            ID: #{profile.id.slice(0, 8)}
                        </p>
                    )}
                </div>
            </div>

            <div className="px-5 space-y-6">

                {/* Sector / Barrio */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Operative Sector</label>
                    {isEditing ? (
                        <select
                            value={formData.barrio || ''}
                            onChange={(e) => handleChange('barrio', e.target.value)}
                            className="w-full bg-[#1A0A0A] border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Sector</option>
                            <option value="Piantini">Piantini</option>
                            <option value="Naco">Naco</option>
                            <option value="Gazcue">Gazcue</option>
                            <option value="Bella Vista">Bella Vista</option>
                            <option value="Zona Colonial">Zona Colonial</option>
                        </select>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Shield className="w-5 h-5" /></div>
                                <span className="font-bold">{profile.barrio || 'Unassigned'}</span>
                            </div>
                            <div className="badge badge-outline text-[10px] opacity-50">CHANGE</div>
                        </div>
                    )}
                </div>

                {/* Medical Data */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Stethoscope className="w-3 h-3" /> Medical Intel
                    </h3>

                    <div className="grid gap-3">
                        <EditCard
                            icon={<Droplets className="w-5 h-5" />}
                            iconBg="bg-blue-500/10 text-blue-400"
                            label="Blood Type"
                            value={formData.blood_type}
                            field="blood_type"
                            editing={isEditing}
                            onChange={handleChange}
                            placeholder="e.g. O+"
                        />
                        <EditCard
                            icon={<AlertTriangle className="w-5 h-5" />}
                            iconBg="bg-orange-500/10 text-orange-400"
                            label="Allergies"
                            value={formData.allergies}
                            field="allergies"
                            editing={isEditing}
                            onChange={handleChange}
                            placeholder="e.g. Peanuts, Penicillin"
                        />
                        <EditCard
                            icon={<Pill className="w-5 h-5" />}
                            iconBg="bg-purple-500/10 text-purple-400"
                            label="Medications"
                            value={formData.medications}
                            field="medications"
                            editing={isEditing}
                            onChange={handleChange}
                            placeholder="e.g. Insulin"
                        />
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Primary Contact</h3>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                        {isEditing ? (
                            <>
                                <input
                                    className="w-full bg-transparent border-b border-white/10 p-2 text-white placeholder:text-white/20 focus:border-primary outline-none"
                                    placeholder="Contact Name"
                                    value={formData.emergency_contact_name || ''}
                                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                                />
                                <input
                                    className="w-full bg-transparent border-b border-white/10 p-2 text-white placeholder:text-white/20 focus:border-primary outline-none"
                                    placeholder="Phone Number"
                                    value={formData.emergency_contact_phone || ''}
                                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-white">{profile.emergency_contact_name || 'Not configured'}</p>
                                    <p className="text-xs text-white/50">{profile.emergency_contact_phone || 'No phone number'}</p>
                                </div>
                                {profile.emergency_contact_phone && (
                                    <button className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function EditCard({ icon, label, value, iconBg, editing, onChange, field, placeholder }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 w-full">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
                    {editing ? (
                        <input
                            className="w-full bg-black/20 rounded px-2 py-1 text-sm text-white font-medium border border-white/10 focus:border-primary outline-none"
                            value={value || ''}
                            onChange={(e) => onChange(field, e.target.value)}
                            placeholder={placeholder}
                        />
                    ) : (
                        <p className="font-bold text-sm text-white">{value || '--'}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
