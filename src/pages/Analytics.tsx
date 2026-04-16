import { useEffect, useState, useCallback, useMemo } from 'react';
import { TrendingUp, AlertCircle, MapPin, Filter, Download, Search, ChevronRight, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { Barrio, Report, ServiceResponse } from '../types';
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
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reportsData, location] = await Promise.all([
        getAllReports(),
        getUserLocation().catch(() => null)
      ]);

      if (reportsData.success && reportsData.data) {
        setReports(reportsData.data);
      }
      
      setUserLocation(location);

      const { data: barriosData, error: barriosError } = await supabase
        .from('barrios')
        .select('id, name, total_reports, verified_count, current_prize, created_at')
        .order('verified_count', { ascending: false })
        .limit(5);

      if (!barriosError && barriosData) {
        setBarrios(barriosData);
      }
    } catch (err) {
      console.error('Error loading analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getPercentage = (barrio: Barrio) => {
    if (barrio.total_reports === 0) return 0;
    return Math.round((barrio.verified_count / barrio.total_reports) * 100);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
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
        if (distance > 500) return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        if (!report.type.toLowerCase().includes(q) && !report.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [reports, crimeFilter, timeFilter, locationFilter, userLocation, searchQuery]);

  const exportCSV = () => {
    const headers = ['Tipo', 'Fecha', 'Ubicación (Lat, Lng)', 'Verificado'];
    const rows = filteredReports.map(r => [
      r.type,
      new Date(r.created_at).toLocaleDateString(),
      `"${r.lat}, ${r.lng}"`,
      r.is_verified ? 'Sí' : 'No'
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
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

    doc.setFontSize(10);
    doc.text(`Total Reportes: ${filteredReports.length}`, 14, 25);
    doc.text(`Zonas Monitoreadas: ${barrios.length}`, 80, 25);

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

  const distributionData = useMemo(() => {
    return Object.entries(filteredReports.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [filteredReports]);

  return (
    <div className="min-h-screen bg-[#050506] text-white font-sans pb-24 selection:bg-primary/30">

      {/* Header Stats & Tabs */}
      <div className="px-6 py-8 md:py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 relative animate-in fade-in slide-in-from-left-4 duration-500">
          Inteligencia<br/><span className="text-primary italic">Global</span>
        </h1>

        {/* Tabs */}
        <div className="flex bg-[#0A0A0C] rounded-[1.8rem] p-1.5 mb-8 border border-white/5 backdrop-blur-3xl shadow-2xl relative z-10">
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.4rem] transition-all duration-300", 
              activeTab === 'stats' 
                ? "bg-primary text-[#050506] shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-[1.01]" 
                : "text-white/40 hover:text-white/70"
            )}
          >
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.4rem] transition-all duration-300", 
              activeTab === 'directory' 
                ? "bg-primary text-[#050506] shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-[1.01]" 
                : "text-white/40 hover:text-white/70"
            )}
          >
            Anales
          </button>
        </div>

        {activeTab === 'stats' ? (
          <div className="grid grid-cols-2 gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-500">
            <StatCard
              label={locationFilter ? 'Objetivos en Radio' : 'Alertas Globales'}
              value={isLoading ? '...' : filteredReports.length}
              sub="Actividad Detectada"
            />
            <StatCard
              label="Zonas de Control"
              value={isLoading ? '...' : barrios.length}
              sub="Monitoreo Activo"
            />
          </div>
        ) : (
          <div className="relative mb-6 animate-in fade-in slide-in-from-top-4 duration-500 group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Filtro de análisis táctico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0A0C] border border-white/5 text-white rounded-[1.8rem] py-5 pl-14 pr-6 focus:outline-none focus:border-primary/40 focus:bg-[#111113] transition-all placeholder:text-white/20 font-medium shadow-2xl"
            />
          </div>
        )}

        {/* Global Export actions */}
        <div className="flex gap-3 mt-8">
          <button 
            onClick={exportCSV} 
            className="flex-1 bg-white/5 border border-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-white/40" /> Descargar CSV
          </button>
          <button 
            onClick={exportPDF} 
            className="flex-1 bg-primary text-[#050506] text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" /> Exportar Dossier
          </button>
        </div>
      </div>

      <div className="px-6 space-y-8 max-w-4xl mx-auto">
        {/* Filters Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar border-b border-white/5">
          <FilterChip active={locationFilter} onClick={() => setLocationFilter(!locationFilter)} icon={MapPin}>
            MI PERÍMETRO {locationFilter ? '(500M)' : ''}
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
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Distribution */}
            <div className="bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none"></div>
              <h3 className="font-black text-white/30 mb-8 uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-primary" /> Distribución de Amenazas
              </h3>
              <div className="space-y-6">
                {distributionData.length > 0 ? (
                  distributionData.map(([type, count], i) => (
                    <DistributionBar
                      key={type}
                      label={type}
                      count={count}
                      total={filteredReports.length || 1}
                      color={i === 0 ? "bg-rose-600" : i === 1 ? "bg-orange-500" : i === 2 ? "bg-amber-500" : "bg-blue-600"}
                    />
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Sin registros tácticos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Neighborhood Ranking */}
            <div className="bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-48 h-48 bg-success/5 rounded-full blur-[60px] -mr-24 -mb-24 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-black text-white/30 uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-success" /> Ranking de Seguridad
                </h3>
                <span className="text-[9px] font-black text-success/60 uppercase tracking-[0.2em] bg-success/5 px-3 py-1 rounded-full border border-success/10">Confianza Delta</span>
              </div>
              <div className="space-y-8">
                {barrios.map((barrio, index) => (
                  <div key={barrio.id} className="flex items-center gap-6 group">
                    <span className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 border", 
                      index === 0 
                        ? "bg-primary text-[#050506] border-primary shadow-[0_0_20px_rgba(255,215,0,0.2)] scale-110" 
                        : "bg-white/5 text-white/30 border-white/5 group-hover:border-white/20 group-hover:text-white/70"
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2 items-end">
                        <span className="font-black text-[13px] uppercase tracking-tight text-white/90 group-hover:text-white transition-colors">{barrio.name}</span>
                        <span className="font-mono text-xs text-success/80 font-bold">{getPercentage(barrio)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-success rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out-expo"
                          style={{ width: `${getPercentage(barrio)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-safe animate-in fade-in duration-700">
            {filteredReports.length === 0 ? (
              <div className="text-center py-24 bg-[#0A0A0C]/50 rounded-[2.5rem] border border-dashed border-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Canal de Datos Vacío</p>
              </div>
            ) : (
              filteredReports.map((report, idx) => (
                <div
                  key={report.id}
                  onClick={() => navigate(`/detail/${report.id}`)}
                  className="bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 active:scale-[0.99] transition-all cursor-pointer hover:bg-[#111113] hover:border-white/10 group shadow-xl relative overflow-hidden"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse shadow-lg", report.is_verified ? "bg-success shadow-success/30" : "bg-amber-500 shadow-amber-500/30")}></div>
                      <span className="font-black text-[11px] uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">{report.type}</span>
                    </div>
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1 rounded-full">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs md:text-sm text-white/50 line-clamp-2 leading-relaxed mb-5 font-medium italic relative z-10 group-hover:text-white/70 transition-colors">
                    "{report.description}"
                  </p>
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] border-t border-white/5 pt-5 group-hover:text-primary transition-colors relative z-10">
                    <span className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/20 transition-colors">
                          <MapPin className="w-4 h-4" /> 
                       </div>
                       Protocolo de Expediente
                    </span>
                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-primary/30 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
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

function StatCard({ label, value, sub }: { label: string, value: string | number, sub: string }) {
  return (
    <div className="bg-[#0A0A0C]/90 backdrop-blur-3xl rounded-[2.2rem] p-7 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700"></div>
      <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-4">{label}</p>
      <p className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-3 leading-none tabular-nums animate-in zoom-in-50 duration-500">{value}</p>
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)] border border-success/50"></div>
        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{sub}</span>
      </div>
    </div>
  )
}

function FilterChip({ active, children, onClick, icon: Icon }: { active: boolean, children: React.ReactNode, onClick: () => void, icon?: LucideIcon }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-3 rounded-full border text-[9px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all duration-300 active:scale-[0.95] backdrop-blur-3xl",
        active
          ? "bg-primary text-[#050506] border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          : "bg-[#0A0A0C] text-white/40 border-white/5 hover:border-white/10 hover:text-white/70"
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  )
}

function FilterSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: string[] }) {
  return (
    <div className="relative group flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#0A0A0C] border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-[0.25em] px-6 py-3 pr-11 rounded-full focus:outline-none focus:border-primary/40 transition-all hover:bg-[#111113] cursor-pointer backdrop-blur-3xl"
      >
        {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#111113] text-white font-medium">{opt}</option>)}
      </select>
      <Filter className="w-3.5 h-3.5 text-white/20 absolute right-5 pointer-events-none group-hover:text-primary transition-colors" />
    </div>
  )
}

function DistributionBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const pct = (count / total) * 100;
  return (
    <div className="group">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] mb-2.5 px-1 items-end">
        <span className="text-white/50 group-hover:text-white transition-colors">{label}</span>
        <span className="text-white/30 font-mono text-[10px] tabular-nums">{count} IDS</span>
      </div>
      <div className="w-full bg-[#050506] h-2 rounded-full overflow-hidden p-[1px] shadow-inner mb-1">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out behavior-smooth shadow-lg", color)} 
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  )
}
