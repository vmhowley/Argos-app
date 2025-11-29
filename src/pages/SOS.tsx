import { useState } from 'react';
import { Phone, AlertTriangle, Users } from 'lucide-react';
import { PageHeader } from '../components/layout';
import { Card } from '../components/ui';
import { startSOS, stopSOS } from '../services/sosService';

export function SOS() {
  const [activating, setActivating] = useState(false);

  const handleActivateSOS = async () => {
    setActivating(true);
    try {
      await startSOS();
    } catch (e) {
      console.error(e);
      alert('Error al iniciar SOS');
      setActivating(false);
    }
  };

  const handleCancelSOS = () => {
    stopSOS();
    setActivating(false);
  };

  return (
    <>
      <PageHeader title="Emergencia SOS" subtitle="Alerta instantánea" bgColor="bg-red-600" />

      <div className="px-6 py-8 space-y-6">
        <Card className="text-center">
          <div className="w-48 h-48 mx-auto mb-6 relative">
            <div
              className={`w-full h-full rounded-full bg-red-500 flex items-center justify-center ${
                activating ? 'animate-pulse' : ''
              }`}
            >
              <AlertTriangle className="w-24 h-24 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activating ? 'Activando...' : 'Mantén presionado'}
          </h2>
          <p className="text-gray-600 mb-6">
            {activating
              ? 'Notificando a tus contactos de emergencia'
              : 'Mantén presionado el botón por 3 segundos para activar'}
          </p>

          {activating ? (
            <button
              onClick={handleCancelSOS}
              className="w-full bg-gray-500 text-white font-bold py-6 rounded-xl hover:bg-gray-600 transition-colors text-xl"
            >
              CANCELAR SOS
            </button>
          ) : (
            <button
              onMouseDown={() => setTimeout(handleActivateSOS, 3000)}
              onTouchStart={() => setTimeout(handleActivateSOS, 3000)}
              disabled={activating}
              className="w-full bg-red-500 text-white font-bold py-6 rounded-xl hover:bg-red-600 transition-colors text-xl disabled:bg-gray-300"
            >
              ACTIVAR SOS
            </button>
          )}
        </Card>

        <Card className="bg-amber-50 border border-amber-200">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            ¿Qué hace el SOS?
          </h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li>• Envía tu ubicación en tiempo real a contactos de emergencia</li>
            <li>• Activa grabación de audio automática</li>
            <li>• Notifica a autoridades cercanas (si configurado)</li>
            <li>• Envía alertas cada 30 segundos hasta que canceles</li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#003087]" />
            Contactos de Emergencia
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Mamá</p>
                <p className="text-sm text-gray-500">+1 (809) 555-0100</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Papá</p>
                <p className="text-sm text-gray-500">+1 (809) 555-0101</p>
              </div>
            </div>
            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#003087] hover:text-[#003087] transition-colors">
              + Agregar contacto
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#003087]" />
            Números de Emergencia
          </h3>
          <div className="space-y-2">
            <a href="tel:911" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-gray-900">Policía Nacional</span>
              <span className="text-[#003087] font-bold">911</span>
            </a>
            <a href="tel:*462" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-gray-900">Emergencias Médicas</span>
              <span className="text-[#003087] font-bold">*462</span>
            </a>
          </div>
        </Card>
      </div>
    </>
  );
}
