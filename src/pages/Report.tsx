import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { Map } from '../components/common/Map';
import { createReport } from '../services/reportService';
import { getCurrentUserId } from '../services/authService';
import { getUserLocation } from '../utils/geoUtils';

export function Report() {
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<'Robo' | 'Asalto' | 'Homicidio' | 'Vandalismo'>('Robo');
  const [descripcion, setDescripcion] = useState('');
  const [folio, setFolio] = useState('');
  const [denunciado, setDenunciado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getUserLocation();
      setSelectedLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('No se pudo obtener tu ubicación. Asegúrate de permitir el acceso a la ubicación en tu navegador.');
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

    if (!selectedLocation) return;

    const { lat, lng } = selectedLocation;

    const newReport = await createReport({
      user_id: userId,
      tipo,
      lat,
      lng,
      descripcion,
      foto_url: undefined,
      folio: folio || undefined,
      verificado: folio ? true : false,
    });

    if (newReport) {
      setLoading(false);
      navigate('/home');
    } else {
      setLoading(false);
      alert('Error creating report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003087] text-white px-6 py-6">
        <button onClick={() => navigate('/home')} className="mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">Reportar Incidente</h1>
        <p className="text-white/80 mt-2">Paso {step} de 3</p>
      </div>

      <div className="px-6 py-8">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tipo de Delito</h2>
            {(['Robo', 'Asalto', 'Homicidio', 'Vandalismo'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition-all ${
                  tipo === t
                    ? 'border-[#003087] bg-blue-50 text-[#003087]'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#003087] text-white font-bold py-4 rounded-xl hover:bg-[#002871] transition-colors mt-8"
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Ubicación</h2>
            <div className="rounded-xl h-64 overflow-hidden border-2 border-gray-200">
               <Map 
                 height="100%" 
                 onLocationSelect={(lat, lng) => setSelectedLocation({lat, lng})}
                 markers={selectedLocation ? [{
                   id: 'temp',
                   user_id: 'temp',
                   tipo: tipo,
                   lat: selectedLocation.lat,
                   lng: selectedLocation.lng,
                   descripcion: 'Ubicación seleccionada',
                   verificado: false,
                   created_at: new Date().toISOString()
                 }] : []}
               />
            </div>
            {selectedLocation && (
              <p className="text-sm text-green-600 text-center font-medium">
                Ubicación seleccionada: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            )}
            <button 
              onClick={handleUseCurrentLocation}
              disabled={gettingLocation}
              className="w-full bg-white border-2 border-[#003087] text-[#003087] font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {gettingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedLocation}
              className="w-full bg-[#003087] text-white font-bold py-4 rounded-xl hover:bg-[#002871] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Detalles</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Qué viste? (máx 100 caracteres)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value.slice(0, 100))}
                className="w-full border border-gray-300 rounded-xl p-3 resize-none focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                rows={4}
                placeholder="Describe brevemente lo que ocurrió..."
              />
              <p className="text-xs text-gray-500 mt-1">{descripcion.length}/100</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto (opcional)
              </label>
              <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#003087] hover:bg-blue-50 transition-all">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Subir foto</p>
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={denunciado}
                  onChange={(e) => setDenunciado(e.target.checked)}
                  className="w-5 h-5 text-[#003087] rounded focus:ring-[#003087]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ya denuncié en policia.gob.do
                </span>
              </label>

              {denunciado && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Folio policial (opcional)
                  </label>
                  <input
                    type="text"
                    value={folio}
                    onChange={(e) => setFolio(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#003087] focus:border-transparent"
                    placeholder="Ej: 2025-123456"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Con folio tu reporte será verificado automáticamente
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !descripcion}
              className="w-full bg-[#003087] text-white font-bold py-4 rounded-xl hover:bg-[#002871] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
