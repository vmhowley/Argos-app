import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, Compass, Flame, Map as MapIcon, Info, Radio, Zap, AlertTriangle, User, Search, Plus, X } from 'lucide-react';
import { IncidentType, Report } from '../types';
import { useReports } from '../hooks/useReports';
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { ReportCard } from '../components/features/reports/ReportCard';
import { cn } from '@/lib/utils';
import { getUserLocation } from '../utils/geoUtils';

export function Home() {
  const [filter, setFilter] = useState<'all' | IncidentType>('all');
  // includeUnverified: true is default in our updated useReports
  const { reports: allReports } = useReports(filter); 
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [activeLayer, setActiveLayer] = useState<'map' | 'intelligence'>('map');
  const [searchQuery, setSearchQuery] = useState('');

  // USER REQUEST: No radius filter. Show all reports.
  const reports = allReports; 

  const [viewState, setViewState] = useState({
    center: [-122.4194, 37.7749] as [number, number],
    zoom: 13
  });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasAccepted = localStorage.getItem('atenea_privacy_accepted');
    if (!hasAccepted) {
      setShowPrivacy(true);
    }
  }, []);

  useEffect(() => {
    let watchId: number;

    async function initLocation() {
      try {
        const { lat, lng } = await getUserLocation();
        setUserLocation({ lat, lng });
        setViewState(prev => ({ ...prev, center: [lng, lat], zoom: 15 }));
      } catch (e) {
        console.warn('Initial location failed, using default', e);
      }

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (err) => {
            console.warn('Geolocation watch error:', err.message);
          },
          { enableHighAccuracy: false, maximumAge: 10000, timeout: 20000 }
        );
      }
    }

    initLocation();

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const centerOnUser = async () => {
    try {
      const { lat, lng } = await getUserLocation();
      setUserLocation({ lat, lng });
      setViewState(prev => ({ ...prev, center: [lng, lat], zoom: 15 }));
    } catch (e) {
      console.error('Could not get user location', e);
    }
  };

  return (
    <div className="fixed inset-0 md:left-24 w-full md:w-[calc(100%-6rem)] h-[100dvh] bg-[#050505] text-white overflow-hidden font-display selection:bg-primary selection:text-background flex flex-col">

      {/* 1. FUTURISTIC MAP INTERFACE */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Map
          center={viewState.center}
          zoom={viewState.zoom}
          theme="dark"
        >
          <MapControls position="top-right" />

          {/* User Location Marker */}
          {userLocation ? (
            <MapMarker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
              <MarkerContent>
                <div className="relative group flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)] relative z-10 transition-transform group-hover:scale-125"></div>
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -inset-8 bg-blue-500/10 rounded-full animate-pulse"></div>
                </div>
              </MarkerContent>
            </MapMarker>
          ) : null}

          {reports.map((report) => (
            <MapMarker key={report.id} longitude={report.lng} latitude={report.lat}>
              <MarkerContent>
                <div className="group relative flex flex-col items-center cursor-pointer">
                  <div className={cn(
                    "w-14 h-14 rounded-full border-2 border-white/40 shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group-hover:-translate-y-2 backdrop-blur-md",
                    (report.confirmations || 0) >= 7 || ((report.confirmations || 0) >= 3 && !!report.foto_url) ? 'bg-success/80 border-success' :
                      (report.confirmations || 0) >= 3 ? 'bg-yellow-500/80 border-yellow-500' :
                        report.type === 'Herido por arma de fuego' || report.type === 'Homicidio' ? 'bg-error/80 border-error' :
                          report.type === 'Incendio' ? 'bg-red-600/80 border-red-600' :
                            'bg-primary/80 border-primary'
                  )}>
                    {report.type === 'Incendio' ? <Flame className="w-7 h-7 text-white" /> :
                      report.type === 'Herido por arma de fuego' ? <AlertTriangle className="w-7 h-7 text-white" /> :
                        <Shield className="w-7 h-7 text-white" />}
                  </div>
                  <div className="w-1.5 h-6 bg-white/40 rounded-full mt-1.5 backdrop-blur-sm group-hover:h-8 transition-all"></div>
                </div>
              </MarkerContent>
              <MarkerPopup>
                <div className="px-5 py-4 min-w-[200px] bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <p className="text-[12px] font-black text-white uppercase tracking-[0.2em]">{report.type}</p>
                  </div>
                  <p className="text-[13px] text-white/60 leading-relaxed font-medium mb-4 line-clamp-3">"{report.description}"</p>
                  <button 
                    onClick={() => navigate(`/detail/${report.id}`)}
                    className="w-full py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary hover:text-background transition-all active:scale-95 shadow-lg shadow-white/5"
                  >
                    Ver Informe Completo
                  </button>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>

      {/* 2. OVERLAY HUD (Top Navigation) */}
      <div className="relative z-50 p-6 pt-12 flex flex-col gap-6 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3 pointer-events-auto">
            <div className="flex items-center gap-4 bg-[#050506]/90 backdrop-blur-3xl px-6 py-4 rounded-[2rem] border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 relative shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                <div className="absolute inset-0 rounded-2xl border border-primary/30 animate-ping opacity-20"></div>
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-black text-base tracking-tight uppercase text-white leading-none mb-1">Atenea Sentinel</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                  <span className="text-[9px] font-black uppercase text-white/50 tracking-[0.2em] font-sans">Core System v4.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
             <button className="w-14 h-14 rounded-[2rem] bg-[#050506]/90 backdrop-blur-3xl border border-white/5 flex items-center justify-center active:scale-95 transition-all hover:bg-[#111113] hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] group relative overflow-hidden">
              <div className="absolute top-0 w-full h-[1px] bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Bell className="w-5 h-5 text-white/70 group-hover:text-white group-hover:rotate-12 transition-all duration-300" />
            </button>
            <button className="w-14 h-14 rounded-[2rem] bg-[#050506]/90 backdrop-blur-3xl border border-white/5 flex items-center justify-center active:scale-95 transition-all hover:bg-[#111113] hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] group relative overflow-hidden" onClick={() => navigate('/profile')}>
               <div className="absolute top-0 w-full h-[1px] bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <User className="w-5 h-5 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
            </button>
          </div>
        </div>

        {/* Intelligence Quick Feed (Small pills) */}
        <div className="flex gap-2 pointer-events-auto overflow-x-auto no-scrollbar py-2">
           <IntelligencePill icon={Radio} label={`${reports.length} ACTIVOS`} active />
           <IntelligencePill icon={Zap} label="RED ESTABLE" />
           <IntelligencePill icon={Compass} label="ZONA NORTE" />
        </div>
      </div>

      {/* 3. QUICK SCROLL & LOCATION */}
      <div className="absolute inset-x-0 bottom-[110px] md:bottom-12 z-40 flex flex-col items-center pointer-events-none">
        
        {/* Reports Quick Scroll (Horizontal, Thin) */}
        <div className="w-full px-6 md:px-12 pointer-events-auto overflow-x-auto no-scrollbar flex gap-4 snap-x pb-2">
          {reports.slice(0, 10).map((report, idx) => (
            <ReportFeedCard key={report.id} report={report} idx={idx} onClick={() => navigate(`/detail/${report.id}`)} />
          ))}
          {reports.length === 0 ? (
             <div className="snap-center shrink-0 w-full md:w-[400px] mx-auto bg-[#050506]/80 backdrop-blur-3xl border border-teal-500/10 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 to-transparent"></div>
                <div className="absolute top-0 w-full h-[1px] bg-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                
                <div className="relative">
                  <div className="absolute inset-0 border border-teal-500/30 rounded-full animate-ping opacity-20"></div>
                  <Shield className="w-8 h-8 text-teal-500/40 mb-3 relative z-10" />
                </div>
                <p className="text-[11px] font-black text-teal-400/60 uppercase tracking-[0.4em] relative z-10">Sector Despejado</p>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2">Monitoreo Activo</p>
             </div>
          ) : null}
        </div>
        
        <div className="w-full px-6 md:px-12 flex justify-end mt-4 pointer-events-none">
          {/* Location Re-center Floating */}
          <button 
            onClick={centerOnUser}
            className="w-14 h-14 bg-[#050506]/90 backdrop-blur-3xl border border-white/5 rounded-[2rem] flex items-center justify-center text-white active:scale-95 transition-all hover:bg-[#111113] hover:-translate-y-1 hover:border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto group relative overflow-hidden"
          >
            <div className="absolute bottom-0 w-full h-[1px] bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Compass className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* 4. PRIVACY POPUP */}
      {showPrivacy ? (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-[40px] flex items-center justify-center p-8 animate-in fade-in duration-700">
          <div className="w-full max-w-sm bg-background/50 border border-white/10 rounded-[4rem] p-12 space-y-10 shadow-[0_0_150px_rgba(255,215,0,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
              <Shield className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Cifrado de Nivel Red</h2>
              <p className="text-sm text-white/60 leading-relaxed font-bold tracking-tight">
                Tus datos están anonimizados bajo el protocolo <span className="text-primary font-black">Atenea Sentinel</span>. Tu ubicación solo es visible para servicios de emergencia verificados.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('atenea_privacy_accepted', 'true');
                setShowPrivacy(false);
              }}
              className="w-full bg-primary text-background font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-sm shadow-[0_15px_40px_rgba(255,215,0,0.3)] active:scale-95 transition-all hover:brightness-110"
            >
              Iniciar Despliegue
            </button>
          </div>
        </div>
      ) : null}

    </div>
  );
}

function IntelligencePill({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={cn(
      "shrink-0 flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-3xl group cursor-default",
      active 
        ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(255,215,0,0.1)]" 
        : "bg-[#050506]/80 border-white/5 text-white/40 hover:bg-[#111113] hover:text-white/60 hover:border-white/10"
    )}>
      <Icon className={cn("w-3 h-3", active ? "animate-pulse" : "group-hover:scale-110 transition-transform")} />
      <span className="text-[9px] font-black uppercase tracking-[0.25em] font-sans">{label}</span>
    </div>
  )
}

const getCategoryStyle = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("sin violencia")) return "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
  if (t.includes("con violencia")) return "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]";
  if (t.includes("arma")) return "bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
  if (t.includes("incendio")) return "bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
  return "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(255,215,0,0.15)]";
};

const getCardAccent = (type: string) => {
   const t = type.toLowerCase();
   if (t.includes("con violencia") || t.includes("arma")) return "border-t-orange-500/50 bg-gradient-to-b from-orange-500/5 to-transparent";
   if (t.includes("incendio")) return "border-t-amber-500/50 bg-gradient-to-b from-amber-500/5 to-transparent";
   if (t.includes("sin violencia")) return "border-t-blue-500/50 bg-gradient-to-b from-blue-500/5 to-transparent";
   return "border-t-primary/50 bg-gradient-to-b from-primary/5 to-transparent";
};

const getActionIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("con violencia") || t.includes("arma")) return <AlertTriangle className="w-3 h-3 text-white/50" />;
  if (t.includes("incendio")) return <Flame className="w-3 h-3 text-white/50" />;
  if (t.includes("sin violencia")) return <Shield className="w-3 h-3 text-white/50" />;
  return <Info className="w-3 h-3 text-white/50" />;
};

function ReportFeedCard({ report, idx, onClick }: { report: Report, idx: number, onClick: () => void }) {
  const categoryStyle = getCategoryStyle(report.type);
  const cardAccent = getCardAccent(report.type);
  const Icon = getActionIcon(report.type);

  return (
    <div 
      className={cn(
        "snap-center shrink-0 w-[260px] md:w-[320px] bg-[#0A0A0B]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-5 shadow-2xl cursor-pointer hover:bg-[#111113] hover:-translate-y-1 transition-all duration-300 group active:scale-[0.98] relative overflow-hidden flex flex-col justify-between",
        cardAccent
      )}
      onClick={onClick}
      style={{ animationDelay: `${idx * 100}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none group-hover:scale-150 transition-transform duration-700 ease-out"></div>

      <div>
        <div className="flex items-center justify-between mb-4 relative z-10 w-full">
          <div className={cn("px-3 py-1.5 rounded-full border transition-colors duration-300", categoryStyle)}>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{report.type}</span>
          </div>
          <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)] border border-success/50 shrink-0"></div>
        </div>
        
        <p className="text-xs md:text-sm text-white/70 leading-relaxed font-medium line-clamp-3 italic mb-4 relative z-10 tracking-tight">"{report.description}"</p>
      </div>
      
      <div className="flex items-center gap-3 relative z-10 pt-3 border-t border-white/5 mt-auto">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors shrink-0">
            {Icon}
          </div>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors">Ver Detalles de Inteligencia</span>
      </div>
    </div>
  );
}
