import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, MapPin, Filter, Download, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Barrio, Report } from '../types';
import { getAllReports } from '../services/reportService';
import { calculateDistance, getUserLocation } from '../utils/geoUtils';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Analytics() {
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [timeFilter, setTimeFilter] = useState('Últimos 7 Días');
  const [crimeFilter, setCrimeFilter] = useState('Todos');
  const [locationFilter, setLocationFilter] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'directory'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
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
      .order('verified_count', { ascending: false })
      .limit(5);

    if (!error && data) setBarrios(data);
    else setBarrios([]);
  };

  const getPercentage = (barrio: Barrio) => {
    if (barrio.total_reports === 0) return 0;
    return Math.round((barrio.verified_count / barrio.total_reports) * 100);
  };

  const filteredReports = reports.filter(report => {
    if (crimeFilter !== 'Todos' && report.type !== crimeFilter) return false;
    const date = new Date(report.created_at);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let timeMatch = true;
    if (timeFilter === 'Últimos 7 Días') timeMatch = diffDays <= 7;
    else if (timeFilter === 'Últimos 30 Días') timeMatch = diffDays <= 30;
    else if (timeFilter === 'Todo el Tiempo') timeMatch = true;

    if (!timeMatch) return false;
    if (locationFilter && userLocation) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, report.lat, report.lng);
      if (distance > 200) return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!report.type.toLowerCase().includes(q) && !report.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Tipo', 'Fecha', 'Ubicación (Lat, Lng)', 'Verificado'];
    const rows = filteredReports.map(r => [
      r.type,
      new Date(r.created_at).toLocaleDateString(),
      `"${r.lat}, ${r.lng}"`,
      r.is_verified ? 'Sí' : 'No'
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reportes_argos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Seguridad Argos', 14, 15);

    // Summary
    doc.setFontSize(10);
    doc.text(`Total Reportes: ${filteredReports.length}`, 14, 25);
    doc.text(`Zonas Monitoreadas: ${barrios.length}`, 80, 25);

    // Distribution
    const distribution = filteredReports.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    doc.text('Distribución por Tipo:', 14, 35);
    let y = 42;
    Object.entries(distribution).forEach(([type, count]) => {
      doc.text(`- ${type}: ${count}`, 14, y);
      y += 6;
    });

    const tableData = filteredReports.slice(0, 50).map(r => [
      r.type,
      new Date(r.created_at).toLocaleDateString(),
      `${Number(r.lat).toFixed(4)}, ${Number(r.lng).toFixed(4)}`,
      r.is_verified ? 'Sí' : 'No'
    ]);

    autoTable(doc, {
      startY: Math.max(y + 10, 60),
      head: [['Tipo', 'Fecha', 'Ubicación', 'Verificado']],
      body: tableData,
    });

    doc.save('reportes_argos.pdf');
  };

  return (
    <div className="min-h-screen bg-[#110505] text-white font-display pb-24">

      {/* Header Stats & Tabs */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Inteligencia Global</h1>

        {/* Tabs */}
        <div className="flex bg-white/5 rounded-full p-1 mb-6 border border-white/10">
          <button
            onClick={() => setActiveTab('stats')}
            className={cn("flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all", activeTab === 'stats' ? "bg-primary text-background shadow-lg" : "text-white/60 hover:text-white")}
          >
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={cn("flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all", activeTab === 'directory' ? "bg-primary text-background shadow-lg" : "text-white/60 hover:text-white")}
          >
            Directorio
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label={locationFilter ? 'Riesgos Cercanos' : 'Total Reportes'}
              value={filteredReports.length}
              sub="Alertas en Tiempo Real"
            />
            <StatCard
              label="Zonas de Riesgo"
              value={barrios.length}
              sub="Monitoreadas"
            />
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar por tipo o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/30"
            />
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
          </div>
        )}

        {/* Global Export actions */}
        <div className="flex gap-2 mt-4">
          <button onClick={exportCSV} className="flex-1 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={exportPDF} className="flex-1 bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/30 transition-colors">
            <Download className="w-4 h-4" /> PDF
          </button>
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
            options={['Últimos 7 Días', 'Últimos 30 Días', 'Todo el Tiempo']}
          />
          <FilterSelect
            value={crimeFilter}
            onChange={(val: string) => setCrimeFilter(val)}
            options={['Todos', 'Robo sin violencia', 'Robo con violencia', 'Incendio', 'Herido por arma de fuego', 'Robo', 'Asalto', 'Homicidio', 'Vandalismo']}
          />
        </div>

        {activeTab === 'stats' ? (
          <>
            {/* Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" /> Distribución de Alertas
              </h3>
              <div className="space-y-4">
                {Object.entries(filteredReports.reduce((acc, r) => {
                  acc[r.type] = (acc[r.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>))
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5) // top 5
                  .map(([type, count], i) => (
                    <DistributionBar
                      key={type}
                      label={type}
                      count={count}
                      total={filteredReports.length || 1}
                      color={i === 0 ? "bg-red-600" : i === 1 ? "bg-orange-500" : i === 2 ? "bg-yellow-500" : "bg-blue-500"}
                    />
                  ))
                }
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
                        <span className="font-bold text-sm">{barrio.name}</span>
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
          </>
        ) : (
          <div className="space-y-3 pb-safe">
            {filteredReports.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No se encontraron reportes</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/detail/${report.id}`)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 active:scale-95 transition-all cursor-pointer hover:bg-white/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", report.is_verified ? "bg-success" : "bg-yellow-500")}></div>
                      <span className="font-bold text-sm uppercase tracking-wider">{report.type}</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mb-3">
                    {report.description}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Ver en Mapa</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
