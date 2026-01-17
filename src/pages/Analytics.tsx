import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, TrendingUp, AlertCircle, MapPin, Filter } from 'lucide-react';
import { supabase } from '../config/supabase';
import { Barrio, Report } from '../types';
import { getAllReports } from '../services/reportService';
import { calculateDistance, getUserLocation } from '../utils/geoUtils';
import { cn } from '@/lib/utils';

export function Analytics() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [timeFilter, setTimeFilter] = useState('Últimos 7 Días');
  const [crimeFilter, setCrimeFilter] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
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
    setReports(data || []);
  };

  const loadBarrios = async () => {
    const { data, error } = await supabase
      .from('barrios')
      .select('*')
      .order('verificados', { ascending: false })
      .limit(5);

    if (!error && data) setBarrios(data);
    else setBarrios([]);
  };

  const getPercentage = (barrio: Barrio) => {
    if (barrio.reportes_total === 0) return 0;
    return Math.round((barrio.verificados / barrio.reportes_total) * 100);
  };

  const filteredReports = reports.filter(report => {
    if (crimeFilter !== 'Todos' && report.tipo !== crimeFilter) return false;
    const date = new Date(report.created_at);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let timeMatch = true;
    if (timeFilter === 'Últimos 7 Días') timeMatch = diffDays <= 7;
    else if (timeFilter === 'Últimos 30 Días') timeMatch = diffDays <= 30;

    if (!timeMatch) return false;
    if (locationFilter && userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, report.lat, report.lng);
      if (distance > 200) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#110505] text-white font-display pb-24">

      {/* Header Stats */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Inteligencia en Vivo</h1>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label={locationFilter ? 'Riesgos Cercanos' : 'Total Reportes'}
            value={filteredReports.length}
            sub="Verificados Tiempo Real"
          />
          <StatCard
            label="Zonas de Riesgo"
            value={barrios.length}
            sub="Monitoreadas"
          />
        </div>
      </div>

      <div className="px-6 space-y-4">
        {/* Filters Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <FilterChip active={locationFilter} onClick={() => setLocationFilter(!locationFilter)} icon={MapPin}>
            Mi Sector {locationFilter && '(200m)'}
          </FilterChip>
          <FilterSelect
            value={timeFilter}
            onChange={(val: string) => setTimeFilter(val)}
            options={['Últimos 7 Días', 'Últimos 30 Días']}
          />
          <FilterSelect
            value={crimeFilter}
            onChange={(val: string) => setCrimeFilter(val)}
            options={['Todos', 'Robo', 'Asalto', 'Homicidio']}
          />
        </div>

        {/* Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" /> Distribución de Alertas
          </h3>
          {/* Visual Bars instead of Pie Chart for cleaner UI */}
          <div className="space-y-4">
            <DistributionBar
              label="Robo"
              count={reports.filter(r => r.tipo === 'Robo').length}
              total={reports.length || 1}
              color="bg-orange-500"
            />
            <DistributionBar
              label="Asalto"
              count={reports.filter(r => r.tipo === 'Asalto').length}
              total={reports.length || 1}
              color="bg-red-500"
            />
            <DistributionBar
              label="Homicidio"
              count={reports.filter(r => r.tipo === 'Homicidio').length}
              total={reports.length || 1}
              color="bg-red-900"
            />
          </div>
        </div>

        {/* Community Goal */}
        <div className="relative overflow-hidden rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-indigo-900/40 to-black">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-xl font-black italic">PREMIO DEL MES</h2>
            </div>
            <p className="text-2xl font-bold text-white mb-1">Mural + Luces LED</p>
            <p className="text-white/40 text-xs">Patrocinador: Pinturas Popular</p>

            <div className="mt-6 border-t border-white/10 pt-4">
              <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Enviar Evidencia para Ganar
              </button>
            </div>
          </div>
        </div>

        {/* Neighborhood Ranking */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Ranking de Seguridad</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {barrios.map((barrio, index) => (
              <div key={barrio.id} className="flex items-center gap-4">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 ? "bg-yellow-500 text-black" : "bg-white/10 text-white/50"
                )}>
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-sm">{barrio.nombre}</span>
                    <span className="font-mono text-xs text-green-400">{getPercentage(barrio)}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${getPercentage(barrio)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-[10px] text-white/60">{sub}</span>
      </div>
    </div>
  )
}

function FilterChip({ active, children, onClick, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all",
        active
          ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(242,13,13,0.3)]"
          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
      )}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </button>
  )
}

function FilterSelect({ value, onChange, options }: any) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/5 border border-white/10 text-white/60 text-xs font-bold px-4 py-2 pr-8 rounded-full focus:outline-none focus:border-white/30"
      >
        {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#1A0A0A]">{opt}</option>)}
      </select>
      <Filter className="w-3 h-3 text-white/30 absolute right-3 top-2.5 pointer-events-none" />
    </div>
  )
}

function DistributionBar({ label, count, total, color }: any) {
  const pct = (count / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/70">{label}</span>
        <span className="font-mono text-white/40">{count} reports</span>
      </div>
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  )
}
