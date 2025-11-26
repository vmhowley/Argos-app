import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Sparkles } from 'lucide-react';
import { Report } from '../types';
import { Map } from '../components/common/Map';
import { supabase } from '../config/supabase';

export function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiRecreation, setAiRecreation] = useState('');
  const [selectedResponse, setSelectedResponse] = useState('');

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      setReport(data);
    }
  };

  const handleViewAI = async () => {
    setShowAI(true);

    const prompts = [
      'Dos encapuchados cortan cadena. Corredor con audífonos. Cuchillo al cuello. Vecino grita. Huyen en moto.',
      'Grupo espera víctima en esquina oscura. Rodean motociclista en semáforo. Arrancan celular y huyen corriendo.',
      'Ladrón fuerza puerta de vehículo estacionado. Alarma suena. Toma mochila del asiento y sale corriendo.',
    ];

    setAiRecreation(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003087] text-white px-6 py-6">
        <button onClick={() => navigate('/home')} className="mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">{report.tipo}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTime(report.created_at)}
          </span>
          <span>•</span>
          <span>{formatDate(report.created_at)}</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <Users className="w-5 h-5" />
            <span className="font-semibold">2 testigos</span>
          </div>
          <p className="text-gray-700">{report.descripcion}</p>
          {report.verificado && (
            <div className="mt-3 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Verificado con folio policial
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="h-48">
            <Map 
              center={[report.lat, report.lng]} 
              zoom={15} 
              markers={[report]} 
              height="100%" 
              interactive={false} 
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">
              Lat: {report.lat.toFixed(4)}, Lng: {report.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {!showAI && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-lg font-bold">Recreación IA</h3>
            </div>
            <p className="text-white/90 mb-4 text-sm">
              Accede a una narrativa generada por IA basada en los detalles del reporte
            </p>
            <button
              onClick={handleViewAI}
              className="w-full bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Recreación → US$2/mes
            </button>
          </div>
        )}

        {showAI && (
          <div className="space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <p className="text-sm text-amber-800 font-semibold">
                ⚠️ DISCLAIMER
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Esto es una estimación. No es real.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed italic">
                "{aiRecreation}"
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">¿Qué habrías hecho?</h3>
              <div className="space-y-2">
                {['Gritar', 'Correr', 'Grabar', 'Llamar 911'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedResponse(option)}
                    className={`w-full p-3 rounded-lg border-2 text-left font-medium transition-all ${
                      selectedResponse === option
                        ? 'border-[#003087] bg-blue-50 text-[#003087]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedResponse && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Resultados en vivo:</span> 45% dijeron "{selectedResponse}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
