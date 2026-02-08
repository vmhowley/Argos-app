import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, Compass } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import { ReportCard } from '../components/features/reports/ReportCard';
import { cn } from '@/lib/utils';
import { getUserLocation } from '../utils/geoUtils';

export function Home() {
  const [filter, setFilter] = useState<'all' | 'Robo' | 'Asalto' | 'Homicidio'>('all');
  const { reports } = useReports(filter);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [viewState, setViewState] = useState({
    center: [-122.4194, 37.7749] as [number, number],
    zoom: 13
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      // 1. Get Initial Location
      try {
        const { lat, lng } = await getUserLocation();
        setUserLocation({ lat, lng });
        setViewState(prev => ({ ...prev, center: [lng, lat], zoom: 15 }));
      } catch (e) {
        console.log('Location default');
      }

      // 2. Watch Position for updates
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (err) => console.error(err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
      }
    }
    init();
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
    <div className="fixed inset-0 w-full h-[100dvh] bg-black text-white overflow-hidden font-display">

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
                    report.tipo === 'Homicidio' ? 'bg-red-600' :
                      report.tipo === 'Robo' ? 'bg-orange-500' : 'bg-primary'
                  )}>
                    {report.tipo === 'Robo' ? <Shield className="w-5 h-5 text-white" /> :
                      report.tipo === 'Homicidio' ? <div className="font-bold text-white">!</div> :
                        <Shield className="w-5 h-5 text-white" />}
                  </div>
                  <div className="w-1 h-3 bg-white/50 rounded-full mt-1"></div>
                  <div className="w-8 h-1.5 bg-black/30 blur-sm rounded-[100%]"></div>
                </div>
              </MarkerContent>
              <MarkerPopup>
                <div className="px-3 py-2 min-w-[120px]">
                  <p className="text-sm font-bold text-white">{report.tipo}</p>
                  <p className="text-[10px] text-white/70 leading-tight">{report.descripcion}</p>
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
          "fixed bottom-0 left-0 right-0 z-40 bg-[#0A0505] rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col will-change-transform",
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
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0A0505] py-2 z-10">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">En Vivo</h3>
            <div className="flex gap-2">
              <FilterBadge active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterBadge>
              <FilterBadge active={filter === 'Robo'} onClick={() => setFilter('Robo')}>Robo</FilterBadge>
              <FilterBadge active={filter === 'Asalto'} onClick={() => setFilter('Asalto')}>Asalto</FilterBadge>
            </div>
          </div>

          {/* Report List */}
          <div className="space-y-3 pb-safe">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                userLocation={userLocation}
              />
            ))}
            {reports.length === 0 && (
              <div className="py-10 text-center text-white/20 text-sm font-medium">
                No hay incidentes reportados cerca.
              </div>
            )}
          </div>
        </div>
      </div>

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
