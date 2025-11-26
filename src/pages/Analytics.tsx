import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import { Barrio } from '../types';
import { MainLayout } from '../components/layout';
import { Card } from '../components/ui';

export function Analytics() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [timeFilter, setTimeFilter] = useState('Last 7 Days');
  const [crimeFilter, setCrimeFilter] = useState('All Crimes');
  const navigate = useNavigate();

  useEffect(() => {
    loadBarrios();
  }, []);

  const loadBarrios = async () => {
    const { data, error } = await supabase
      .from('barrios')
      .select('*')
      .order('verificados', { ascending: false })
      .limit(10);

    if (!error && data) {
      setBarrios(data);
    } else {
      setBarrios([
        {
          id: '1',
          nombre: 'Los Mina',
          reportes_total: 150,
          verificados: 102,
          premio_actual: 'Mural + 10 luces LED',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          nombre: 'Herrera',
          reportes_total: 120,
          verificados: 62,
          premio_actual: '',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          nombre: 'Villa Duarte',
          reportes_total: 98,
          verificados: 40,
          premio_actual: '',
          created_at: new Date().toISOString(),
        },
      ]);
    }
  };

  const getPercentage = (barrio: Barrio) => {
    if (barrio.reportes_total === 0) return 0;
    return Math.round((barrio.verificados / barrio.reportes_total) * 100);
  };

  return (
    <>
      <div className="bg-[#4A5A8F] text-white px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Crime Analytics</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white/80 text-sm mb-2">Total Reports</p>
            <p className="text-4xl font-bold mb-2">36,500</p>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12% this month</span>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white/80 text-sm mb-2">High Risk Areas</p>
            <p className="text-4xl font-bold mb-2">8</p>
            <div className="flex items-center gap-1 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Karachi zones</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <Card className="p-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-[#4A5A8F] focus:border-transparent"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
          </select>
        </Card>

        <Card className="p-4">
          <select
            value={crimeFilter}
            onChange={(e) => setCrimeFilter(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-[#4A5A8F] focus:border-transparent"
          >
            <option>All Crimes</option>
            <option>Robo</option>
            <option>Asalto</option>
            <option>Homicidio</option>
            <option>Vandalismo</option>
          </select>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Crime Distribution by Type</h3>

          <div className="flex items-center justify-center mb-8">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#EF4444" strokeWidth="40" strokeDasharray="126 377" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#F97316" strokeWidth="40" strokeDasharray="94 377" strokeDashoffset="-126" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#FBBF24" strokeWidth="40" strokeDasharray="63 377" strokeDashoffset="-220" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="#FB923C" strokeWidth="40" strokeDasharray="94 377" strokeDashoffset="-283" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Mobile Snatching</p>
                <p className="font-bold text-gray-900">12,500</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Motorcycle Theft</p>
                <p className="font-bold text-gray-900">8,900</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Vehicle Theft</p>
                <p className="font-bold text-gray-900">6,100</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">House Robbery</p>
                <p className="font-bold text-gray-900">9,000</p>
              </div>
            </div>
          </div>
        </Card>

        <Card gradient>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-8 h-8" />
            <h2 className="text-xl font-bold">Premio Actual</h2>
          </div>
          <p className="text-2xl font-bold mb-2">Mural + 10 luces LED</p>
          <p className="text-white/90 text-sm">Patrocinado por: Pinturas Popular</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Ranking Mensual</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>

          <div className="space-y-4">
            {barrios.map((barrio, index) => (
              <div key={barrio.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-orange-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{barrio.nombre}</h4>
                      <p className="text-sm text-gray-500">
                        {barrio.verificados} verificados de {barrio.reportes_total}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{getPercentage(barrio)}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${getPercentage(barrio)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-[#003087] mb-2">¿Cómo funciona?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• El barrio con mayor % de reportes verificados gana</li>
            <li>• Se mide mensualmente (1-31 de cada mes)</li>
            <li>• El premio se invierte en mejoras comunitarias</li>
            <li>• Todos pueden participar reportando y verificando</li>
          </ul>
        </Card>

        {barrios.length > 0 && barrios[0] && (
          <Card className="border-2 border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="font-bold text-gray-900">Progreso para ganar</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Faltan{' '}
              <span className="font-bold text-[#003087]">
                {Math.max(0, 70 - getPercentage(barrios[0]))}%
              </span>{' '}
              para alcanzar el 70% y asegurar la victoria
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/report')}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Ayudar con un reporte
              </button>
              <button
                onClick={() => navigate('/verify')}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Verificar reportes
              </button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
