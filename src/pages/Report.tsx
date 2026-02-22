import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Shield, AlertTriangle, Flame, UserMinus, MapPin, Mic, Send } from 'lucide-react';
import { Map } from '../components/common/Map';
import { createReport } from '../services/reportService';
import { uploadReportImage } from '../services/storageService';
import { getCurrentUserId } from '../services/authService';
import { getUserLocation } from '../utils/geoUtils';
import { BARRIOS } from '../data/barrios';
import { cn } from '@/lib/utils';
import { IncidentType } from '../types';

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
    handleUseCurrentLocation();
  }, []);

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getUserLocation();
      setSelectedLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
    setGettingLocation(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
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
      foto_url = await uploadReportImage(photo);
      if (!foto_url) {
        alert('Error subiendo la imagen. Intenta de nuevo.');
        setLoading(false);
        return;
      }
    }

    const { lat, lng } = selectedLocation || { lat: 0, lng: 0 };

    const newReport = await createReport({
      user_id: userId,
      type: type!,
      lat,
      lng,
      description: `${description} | Barrio: ${barrio} | Testigos: ${witnesses}`,
      foto_url,
      is_verified: false,
    });

    if (newReport) {
      setLoading(false);
      navigate('/home');
    } else {
      setLoading(false);
      alert('Error creating report. Please try again.');
    }
  };

  const types: { id: IncidentType; icon: any; label: string; color: string }[] = [
    { id: 'Robo sin violencia', icon: Shield, label: 'Robo sin violencia', color: 'bg-blue-500' },
    { id: 'Robo con violencia', icon: AlertTriangle, label: 'Robo con violencia', color: 'bg-orange-500' },
    { id: 'Incendio', icon: Flame, label: 'Incendio', color: 'bg-red-500' },
    { id: 'Herido por arma de fuego', icon: UserMinus, label: 'Herido por arma de fuego', color: 'bg-error' },
  ];

  return (
    <div className="min-h-screen bg-background text-white font-display pb-20">
      {/* Header */}
      <div className="bg-background-header p-6 pt-12 rounded-b-[2rem] shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Reportar Incidente</h1>
            <p className="text-white/60 text-sm">Paso {step} de 3</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(255,215,0,0.5)]"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-6 py-8">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-bold mb-6">¿Qué ocurrió?</h2>
            <div className="grid grid-cols-2 gap-4">
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setType(t.id);
                    setStep(2);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all aspect-square text-center gap-3",
                    type === t.id
                      ? "border-primary bg-primary/10"
                      : "border-white/5 bg-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn("p-4 rounded-full", t.color)}>
                    <t.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <h2 className="text-xl font-bold">¿Dónde ocurrió?</h2>

            <div className="space-y-4">
              <div className="rounded-2xl h-48 overflow-hidden border border-white/10 shadow-inner">
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
                className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-white/10 transition-colors"
              >
                <MapPin className={cn("w-5 h-5", gettingLocation && "animate-spin")} />
                {gettingLocation ? 'Obteniendo GPS...' : 'Usar ubicación GPS'}
              </button>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 uppercase tracking-widest px-1">Barrio o Sector</label>
                <select
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
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
              className="w-full bg-primary text-background-header font-black uppercase tracking-tighter text-xl py-4 rounded-xl shadow-[0_4px_15px_rgba(255,215,0,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              Siguiente
            </button>
            <button onClick={() => setStep(1)} className="w-full text-white/40 font-bold uppercase text-xs tracking-widest transition-colors hover:text-white/60">Regresar</button>
          </div>
        )}

        {step === 3 && (
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
                  <button className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <Mic className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                  className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none h-32"
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
                  className="w-full border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-white/5 transition-all cursor-pointer overflow-hidden relative"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
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
                className="w-full bg-error text-white font-black uppercase tracking-tighter text-xl py-5 rounded-2xl shadow-[0_8px_25px_rgba(255,59,48,0.3)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? 'Procesando...' : (
                  <>
                    <Send className="w-6 h-6" />
                    Enviar Reporte
                  </>
                )}
              </button>
              <button onClick={() => setStep(2)} className="w-full text-white/40 font-bold uppercase text-xs tracking-widest transition-colors hover:text-white/60 text-center">Regresar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
