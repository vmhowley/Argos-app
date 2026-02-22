import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, Compass, Flame } from 'lucide-react';
import { IncidentType } from '../types';
import { useReports } from '../hooks/useReports';
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { ReportCard } from '../components/features/reports/ReportCard';
import { cn } from '@/lib/utils';
import { getUserLocation } from '../utils/geoUtils';

export function Home() {
  const [filter, setFilter] = useState<'all' | IncidentType>('all');
  const { reports } = useReports(filter);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
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
      // 1. Get Initial Location for centering
      try {
        const { lat, lng } = await getUserLocation();
        setUserLocation({ lat, lng });
        setViewState(prev => ({ ...prev, center: [lng, lat], zoom: 15 }));
      } catch (e) {
        console.warn('Initial location failed, using default', e);
      }

      // 2. Start watching position
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
      setUserLocation({ lat, lng }); // Also set userLocation when re-centering
      setViewState(prev => ({ ...prev, center: [lng, lat], zoom: 15 }));
    } catch (e) {
      console.error('Could not get user location', e);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-background text-white overflow-hidden font-display">

      {/* 1. MAP BACKGROUND */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <Map
          center={viewState.center}
          zoom={viewState.zoom}
          theme="dark"
        >
          <MapControls position="top-right" />

          {/* Re-center Button */}
          <div className="absolute top-24 right-4 z-[400]">
            <button
              onClick={centerOnUser}
              className="w-10 h-10 bg-black/80 backdrop-blur border border-white/20 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
            >
              <Compass className="w-5 h-5" />
            </button>
          </div>

          {/* User Location Marker */}
          {userLocation && (
            <MapMarker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
              <MarkerContent>
                <div className="relative group flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10"></div>
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-pulse"></div>
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Tu Ubicación
                  </div>
                </div>
              </MarkerContent>
            </MapMarker>
          )}

          {reports.map((report) => (
            <MapMarker key={report.id} longitude={report.lng} latitude={report.lat}>
              <MarkerContent>
                <div className="group relative flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center transition-transform hover:scale-110",
                    (report.confirmations || 0) >= 7 || ((report.confirmations || 0) >= 3 && report.has_photo) ? 'bg-success' :
                      (report.confirmations || 0) >= 3 ? 'bg-yellow-500' :
                        report.type === 'Herido por arma de fuego' || report.type === 'Homicidio' ? 'bg-error' :
                          report.type === 'Incendio' ? 'bg-red-600' :
                            report.type === 'Robo con violencia' || report.type === 'Asalto' ? 'bg-orange-600' :
                              'bg-blue-500'
                  )}>
                    {report.type === 'Incendio' ? <Flame className="w-5 h-5 text-white" /> :
                      report.type === 'Herido por arma de fuego' ? <div className="font-bold text-white">!</div> :
                        <Shield className="w-5 h-5 text-white" />}
                  </div>
                  <div className="w-1 h-3 bg-white/50 rounded-full mt-1"></div>
                  <div className="w-8 h-1.5 bg-black/30 blur-sm rounded-[100%]"></div>
                </div>
              </MarkerContent>
              <MarkerPopup>
                <div className="px-3 py-2 min-w-[120px]">
                  <p className="text-sm font-bold text-white">{report.type}</p>
                  <p className="text-[10px] text-white/70 leading-tight">{report.description}</p>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>

      {/* 2. HEADER OVERLAY - Fixed on top */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 pt-8 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary fill-primary" />
            <span className="font-bold text-lg tracking-tight">Atenea Geo</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Sistema Seguro</span>
          </div>
        </div>

        <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-auto active:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 3. BOTTOM SHEET - Fixed at bottom, slides up */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-background rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col will-change-transform",
          sheetExpanded ? "h-[75%]" : "h-[360px]" // Adjusted heights for better UX
        )}
      >
        {/* Drag Handle */}
        <div
          className="w-full h-10 flex items-center justify-center shrink-0 cursor-pointer active:cursor-grabbing hover:bg-white/5 transition-colors rounded-t-[2.5rem]"
          onClick={() => setSheetExpanded(!sheetExpanded)}
        >
          <div className="w-12 h-1 bg-white/20 rounded-full"></div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-32 flex-1 overflow-y-auto no-scrollbar overscroll-contain">

          {/* Centinela Motivational Message & Stats */}
          <div className="mb-6 space-y-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl shrink-0 animate-bounce">🦉</div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-tighter mb-0.5">Centinela dice:</p>
                <p className="text-xs text-white/80 font-medium italic leading-tight">"Tu reporte de hoy es la seguridad de tu vecino mañana. ¡Sigue así, agente!"</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black italic text-primary leading-none mb-1">{reports.length}</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Alertas Cerca</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black italic text-success leading-none mb-1">98%</p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Confianza</p>
              </div>
            </div>
          </div>

          {/* Emergency CTA */}
          <div className="mb-8 relative group cursor-pointer active:scale-[0.98] transition-all">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all"></div>
            <div
              className="relative bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-6 flex items-center justify-between shadow-lg border border-white/10"
              onClick={() => navigate('/sos')}
            >
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">SOS de Emergencia</h2>
                <p className="text-xs text-white/80 font-medium mt-1">Presiona para alerta instantánea</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Stats / Filters */}
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-background py-2 z-10">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">En Vivo</h3>
            <div className="flex gap-2">
              <FilterBadge active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterBadge>
              <FilterBadge active={filter === 'Robo con violencia'} onClick={() => setFilter('Robo con violencia')}>Robos</FilterBadge>
              <FilterBadge active={filter === 'Herido por arma de fuego'} onClick={() => setFilter('Herido por arma de fuego')}>Críticos</FilterBadge>
            </div>
          </div>

          {/* Report List */}
          <div className="space-y-4 pb-safe">
            {reports.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <Shield className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay reportes en esta zona</p>
              </div>
            ) : (
              <>
                {reports.slice(0, 3).map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    userLocation={userLocation}
                  />
                ))}

                {/* AdMob Banner Placeholder */}
                <div className="w-full h-24 bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-1 group relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] font-bold text-white/20 uppercase">Sponsored</div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Publicidad</span>
                  <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-primary/20 animate-shimmer"></div>
                  </div>
                </div>

                {reports.slice(3).map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    userLocation={userLocation}
                  />
                ))}
              </>
            )}

            {/* AdMob Native Ad Placeholder */}
            <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl p-4 flex flex-col gap-2 group relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[8px] font-bold text-white/20 uppercase">Sponsored</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full shrink-0"></div>
                <div>
                  <h4 className="text-sm font-bold text-white/80">Título del Anuncio Nativo</h4>
                  <p className="text-[10px] text-white/50">Descripción corta del anuncio.</p>
                </div>
              </div>
              <div className="w-full h-24 bg-white/10 rounded-lg"></div>
              <button className="w-full py-2 bg-primary/20 text-primary text-xs font-bold rounded-lg">Acción del Anuncio</button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLOATING SOS BUTTON REMOVED */}

      {/* 5. PRIVACY POPUP */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-card border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Seguridad de Datos</h2>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                En cumplimiento con la <span className="text-primary font-bold">Ley 172-13</span>, tus datos están cifrados. Tu identidad es anónima para otros agentes.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('atenea_privacy_accepted', 'true');
                setShowPrivacy(false);
              }}
              className="w-full bg-primary text-background font-black py-4 rounded-xl uppercase tracking-tighter text-base shadow-lg active:scale-95 transition-all"
            >
              Entendido, Agente
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function FilterBadge({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
        active
          ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          : "bg-transparent text-white/30 border-white/10 hover:border-white/30"
      )}
    >
      {children}
    </button>
  )
}
