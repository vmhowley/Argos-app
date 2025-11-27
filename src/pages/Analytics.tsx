import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, AlertCircle, MapPin } from 'lucide-react';
import { supabase } from '../config/supabase';
import { Barrio, Report } from '../types';
import { Card } from '../components/ui';
import { getAllReports } from '../services/reportService';
import { calculateDistance, getUserLocation } from '../utils/geoUtils';

export function Analytics() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [timeFilter, setTimeFilter] = useState('Last 7 Days');
  const [crimeFilter, setCrimeFilter] = useState('All Crimes');
  const [locationFilter, setLocationFilter] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadBarrios(), loadReports(), checkLocation()]);
  };

  const checkLocation = async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.log('Location access denied or error:', error);
    }
  };

  const loadReports = async () => {
    const data = await getAllReports();
    setReports(data);
  };

  const loadBarrios = async () => {
    const { data, error } = await supabase
      .from('barrios')
      .select('*')
      .order('verificados', { ascending: false })
      .limit(10);

    if (!error && data) {
      setBarrios(data);
    } else {
      setBarrios([]);
    }
  };

  const getPercentage = (barrio: Barrio) => {
    if (barrio.reportes_total === 0) return 0;
    return Math.round((barrio.verificados / barrio.reportes_total) * 100);
  };

  // Filter reports based on selection
  const filteredReports = reports.filter(report => {
    // 1. Filter by Crime Type
    if (crimeFilter !== 'All Crimes' && report.tipo !== crimeFilter) return false;
    
    // 2. Filter by Time
    const date = new Date(report.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeMatch = true;
    if (timeFilter === 'Last 7 Days') timeMatch = diffDays <= 7;
    else if (timeFilter === 'Last 30 Days') timeMatch = diffDays <= 30;
    else if (timeFilter === 'Last 3 Months') timeMatch = diffDays <= 90;
    else if (timeFilter === 'Last Year') timeMatch = diffDays <= 365;

    if (!timeMatch) return false;

    // 3. Filter by Location (200m radius)
    if (locationFilter && userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        report.lat,
        report.lng
      );
      if (distance > 200) return false;
    }

    return true;
  });

  // Calculate stats based on FILTERED reports
  const totalReports = filteredReports.length;
  
  // Count by type based on FILTERED reports
  const typeCount = filteredReports.reduce((acc, report) => {
    acc[report.tipo] = (acc[report.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div className="bg-[#4A5A8F] text-white px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Crime Analytics</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white/80 text-sm mb-2">
              {locationFilter ? 'Reports Nearby (200m)' : 'Total Reports'}
            </p>
            <p className="text-4xl font-bold mb-2">{totalReports}</p>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Real-time data</span>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5">
            <p className="text-white/80 text-sm mb-2">High Risk Areas</p>
            <p className="text-4xl font-bold mb-2">{barrios.length}</p>
            <div className="flex items-center gap-1 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Monitored zones</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {userLocation && (
          <Card className={`p-4 cursor-pointer transition-colors ${locationFilter ? 'bg-blue-50 border-blue-200' : ''}`} onClick={() => setLocationFilter(!locationFilter)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${locationFilter ? 'bg-[#4A5A8F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Mi Sector (200m)</p>
                  <p className="text-sm text-gray-500">Filtrar reportes cercanos</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${locationFilter ? 'border-[#4A5A8F] bg-[#4A5A8F]' : 'border-gray-300'}`}>
                {locationFilter && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </div>
          </Card>
        )}

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
              {/* Simple pie chart visualization based on counts */}
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E5E7EB" strokeWidth="20" />
                {/* We would calculate segments here properly in a real chart lib, for now simple visual */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="20" strokeDasharray={`${(typeCount['Robo'] || 0) / totalReports * 251 || 0} 251`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <span className="text-3xl font-bold text-gray-800">{filteredReports.length}</span>
                 <span className="text-xs text-gray-500">Filtered</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Robo</p>
                <p className="font-bold text-gray-900">{typeCount['Robo'] || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Asalto</p>
                <p className="font-bold text-gray-900">{typeCount['Asalto'] || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Vandalismo</p>
                <p className="font-bold text-gray-900">{typeCount['Vandalismo'] || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Homicidio</p>
                <p className="font-bold text-gray-900">{typeCount['Homicidio'] || 0}</p>
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
