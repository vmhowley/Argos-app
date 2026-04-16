import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Shield, AlertTriangle, Flame, UserMinus, MapPin, Mic, Send, LucideIcon } from 'lucide-react';
import { Map } from '../components/common/Map';
import { createReport } from '../services/reportService';
import { uploadReportImage } from '../services/storageService';
import { getCurrentUserId } from '../services/authService';
import { getUserLocation } from '../utils/geoUtils';
import { BARRIOS } from '../data/barrios';
import { cn } from '@/lib/utils';
import { IncidentType } from '../types';

interface IncidentTypeOption {
  id: IncidentType;
  icon: LucideIcon;
  label: string;
  color: string;
  style: string;
}

export function Report() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [barrio, setBarrio] = useState('');
  const [witnesses, setWitnesses] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUseInitialLocation = async () => {
      setGettingLocation(true);
      try {
        const location = await getUserLocation();
        setSelectedLocation(location);
      } catch (error) {
        console.error('Error getting initial location:', error);
      }
      setGettingLocation(false);
    };

    handleUseInitialLocation();
  }, []);

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getUserLocation();
      setSelectedLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('No se pudo obtener la ubicación. Por favor, selecciona manualmente en el mapa.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();

      if (!userId) {
        navigate('/');
        return;
      }

      if (!selectedLocation && !barrio) {
        alert('Por favor selecciona una ubicación o barrio');
        setLoading(false);
        return;
      }

      let foto_url = undefined;
      if (photo) {
        const uploadResponse = await uploadReportImage(photo);
        if (uploadResponse.success && uploadResponse.data) {
          foto_url = uploadResponse.data;
        } else {
          alert('Error subiendo la imagen: ' + uploadResponse.error);
          setLoading(false);
          return;
        }
      }

      const { lat, lng } = selectedLocation || { lat: 0, lng: 0 };

      const response = await createReport({
        user_id: userId,
        type: type!,
        lat,
        lng,
        description: `${description} | Barrio: ${barrio} | Testigos: ${witnesses}`,
        foto_url,
        is_verified: false,
      });

      if (response.success) {
        setLoading(false);
        navigate('/home');
      } else {
        setLoading(false);
        alert('Error creando el reporte: ' + response.error);
      }
    } catch (err: any) {
      console.error('Unexpected error during report creation:', err);
      alert('Error inesperado. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const types: IncidentTypeOption[] = [
    { id: 'Robo sin violencia', icon: Shield, label: 'Robo sin violencia', color: 'text-blue-400', style: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] active:bg-blue-500/20' },
    { id: 'Robo con violencia', icon: AlertTriangle, label: 'Robo con violencia', color: 'text-orange-400', style: 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] active:bg-orange-500/20' },
    { id: 'Incendio', icon: Flame, label: 'Incendio', color: 'text-amber-500', style: 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] active:bg-amber-500/20' },
    { id: 'Herido por arma de fuego', icon: UserMinus, label: 'Arma de Fuego', color: 'text-rose-500', style: 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] active:bg-rose-500/20' },
  ];

  return (
    <div className="min-h-screen bg-[#050506] text-white font-sans pb-20 selection:bg-primary/30">
      {/* Header */}
      <div className="bg-[#0A0A0C]/90 backdrop-blur-3xl p-6 pt-12 rounded-b-[2rem] border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <button 
            onClick={() => navigate('/home')} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
            aria-label="Regresar"
          >
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-none">Despliegue</h1>
            <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Fase {step} / 3</p>
          </div>
        </div>

        {/* Tactical Progress Bar */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden relative z-10">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out-expo shadow-[0_0_15px_rgba(255,215,0,0.8)] relative"
            style={{ width: `${(step / 3) * 100}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 md:py-12 max-w-lg mx-auto">
        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out-expo">
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Clasificación</h2>
              <p className="text-white/50 text-sm font-medium tracking-tight">Selecciona la designación táctica principal del incidente detectado en la zona.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {types.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setType(t.id);
                    setStep(2);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 md:p-8 rounded-[2rem] border transition-all duration-300 aspect-square text-center gap-4 group cursor-pointer relative overflow-hidden",
                    type === t.id
                      ? "scale-[0.98] ring-2 ring-offset-2 ring-offset-[#050506] ring-primary/50 " + t.style
                      : t.style
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={cn("p-4 rounded-2xl bg-[#050506]/50 backdrop-blur-md border border-white/5 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110", t.color)}>
                    <t.icon className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] text-white/80 group-hover:text-white transition-colors leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <h2 className="text-xl font-bold">¿Dónde ocurrió?</h2>

            <div className="space-y-4">
              <div className="rounded-3xl h-48 overflow-hidden border border-white/10 shadow-inner">
                <Map
                  height="100%"
                  onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
                  markers={selectedLocation ? [{
                    id: 'temp',
                    user_id: 'temp',
                    type: type || 'Robo sin violencia',
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    description: 'Ubicación seleccionada',
                    is_verified: false,
                    created_at: new Date().toISOString()
                  }] : []}
                />
              </div>

              <button
                onClick={handleUseCurrentLocation}
                disabled={gettingLocation}
                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-semibold hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50"
              >
                <MapPin className={cn("w-5 h-5", gettingLocation ? "animate-spin" : "")} />
                {gettingLocation ? 'Obteniendo GPS...' : 'Usar ubicación GPS'}
              </button>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 uppercase tracking-widest px-1">Barrio o Sector</label>
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
                >
                  <option value="" className="bg-background-header">Seleccionar Sector (Fallback)</option>
                  {BARRIOS.map(b => (
                    <option key={b} value={b} className="bg-background-header">{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedLocation && !barrio}
              className="w-full bg-primary text-background-header font-black uppercase tracking-tighter text-xl py-4 rounded-2xl shadow-[0_4px_15px_rgba(255,215,0,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              Siguiente
            </button>
            <button 
              onClick={() => setStep(1)} 
              className="w-full text-white/40 font-bold uppercase text-xs tracking-widest transition-colors hover:text-white/60 text-center py-2"
            >
              Regresar
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <h2 className="text-xl font-bold">Detalles adicionales</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-widest">Testigos aproximados</label>
                  <span className="text-primary font-black text-xl">{witnesses}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={witnesses}
                  onChange={(e) => setWitnesses(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-white/40 font-bold">
                  <span>NINGUNO</span>
                  <span>MUCHOS</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-widest px-1">Descripción corta</label>
                  <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors active:scale-90">
                    <Mic className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                  className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none h-32 transition-all"
                  placeholder="Ej: Dos personas en motor oscuro..."
                />
                <p className="text-[10px] text-white/40 text-right font-bold uppercase tracking-widest">{description.length}/100</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 uppercase tracking-widest px-1">Foto (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  id="photo-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhoto(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <label
                  htmlFor="photo-upload"
                  className="w-full border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-white/5 transition-all cursor-pointer overflow-hidden relative active:scale-[0.98]"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity" />
                  ) : (
                    <div className="p-4 bg-white/5 rounded-full">
                      <Upload className="w-8 h-8 text-white/40" />
                    </div>
                  )}
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest relative z-10">
                    {photo ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !description}
                className="w-full bg-error text-white font-black uppercase tracking-tighter text-xl py-5 rounded-3xl shadow-[0_8px_25px_rgba(255,59,48,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                    Enviar Reporte
                  </>
                )}
              </button>
              <button 
                onClick={() => setStep(2)} 
                className="w-full text-white/40 font-bold uppercase text-xs tracking-widest transition-colors hover:text-white/60 text-center py-2"
              >
                Regresar
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
