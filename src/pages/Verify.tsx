import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MapPin, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { Report, ServiceResponse } from '../types';
import { getUnverifiedReports, verifyReport } from '../services/reportService';
import { getUserProfile } from '../services/authService';
import { Map } from '../components/common/Map';
import { formatTime } from '../utils/dateUtils';
import { getUserLocation, calculateDistance } from '../utils/geoUtils';
import { cn } from '@/lib/utils';

export function Verify() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadUnverifiedReports = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getUnverifiedReports();
      const profile = await getUserProfile();
      setCurrentUserId(profile?.id || null);

      if (response.success && response.data) {
        const allReports = response.data;
        
        try {
          const location = await getUserLocation();
          setUserLocation(location);

          const nearbyReports = allReports.filter(report => {
            const distance = calculateDistance(
              location.lat,
              location.lng,
              report.lat,
              report.lng
            );
            return distance <= 500; // Increased to 500m for better visibility
          });
          setReports(nearbyReports);
          setLocationError(false);
        } catch (e) {
          console.error('Location error:', e);
          setLocationError(true);
          setReports([]);
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnverifiedReports();
  }, [loadUnverifiedReports]);

  const handleVerify = async (reportId: string) => {
    setVerifying(reportId);

    try {
      const userProfile = await getUserProfile();
      const isAdmin = userProfile?.role === 'admin';
      const userId = userProfile?.id;

      const report = reports.find(r => r.id === reportId);
      if (!report) {
        alert('Reporte no encontrado.');
        setVerifying(null);
        return;
      }

      if (userId && report.user_id === userId) {
        alert('No puedes verificar tu propio reporte.');
        setVerifying(null);
        return;
      }

      if (!isAdmin) {
        const activeLocation = await getUserLocation();
        const distance = calculateDistance(
          activeLocation.lat,
          activeLocation.lng,
          report.lat,
          report.lng
        );

        if (distance > 500) {
          alert(
            `Debes estar a menos de 500 metros del incidente para verificarlo.\n\n` +
            `Distancia actual: ${Math.round(distance)} metros`
          );
          setVerifying(null);
          return;
        }
      }

      const response = await verifyReport(reportId);

      if (response.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        if (isAdmin) {
          alert('Reporte verificado exitosamente (Modo Admin).');
        }
      } else {
        alert('Error al verificar el reporte: ' + response.error);
      }
    } catch (error: any) {
      console.error('Error verifying report:', error);
      alert('Ocurrió un error. Asegúrate de tener acceso a internet y ubicación habilitada.');
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-white font-sans pb-24 selection:bg-primary/30">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 bg-[#0A0A0C]/90 backdrop-blur-3xl border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <button
          onClick={() => navigate('/home')}
          className="mb-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all active:scale-95 shadow-xl relative z-10"
          aria-label="Regresar"
        >
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-white leading-none relative z-10 animate-in fade-in slide-in-from-left-4 duration-500">Protocolo de<br/><span className="text-primary">Validación</span></h1>
        <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] max-w-xs mt-4 relative z-10">
          Escanea y verifica incidentes en un radio táctico de <span className="text-primary/80">500 metros</span>.
        </p>
      </div>

      <div className="px-6 py-8 space-y-8 max-w-lg mx-auto">
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center animate-in fade-in duration-700">
            <div className="w-12 h-12 border border-primary/20 border-t-primary rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(255,215,0,0.2)]"></div>
            <p className="text-primary/60 text-[10px] uppercase tracking-[0.4em] font-black animate-pulse">Escaneando Perímetro...</p>
          </div>
        ) : (
          <>
            {locationError ? (
              <div className="p-5 bg-error/5 border border-error/20 rounded-2xl flex gap-4 animate-in slide-in-from-top-4 duration-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <AlertTriangle className="w-5 h-5 text-error shrink-0" />
                <p className="text-[10px] text-error/80 font-bold uppercase tracking-widest leading-relaxed">
                  Acceso a ubicación denegado. Se requiere GPS activo para validar reportes en campo.
                </p>
              </div>
            ) : null}

            {!locationError && userLocation ? (
              <div className="flex items-center justify-between p-4 bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-[1.5rem] animate-in fade-in duration-500 shadow-xl group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)] border border-success/50"></div>
                  <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">Señal GPS Detectada</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                  {reports.length} Objetivos
                </div>
              </div>
            ) : null}

            {reports.length === 0 ? (
              <div className="text-center py-24 select-none animate-in zoom-in-95 duration-700">
                <div className="w-32 h-32 bg-[#0A0A0C]/50 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 relative">
                   <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-ping opacity-30"></div>
                   <UserCheck className="w-12 h-12 text-teal-500/30" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tighter mb-2 text-white/80">
                  Perímetro Seguro
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  No hay reportes sin verificar en tu radio actual
                </p>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {reports.map((report, idx) => {
                  const isOwnReport = currentUserId && report.user_id === currentUserId;

                  return (
                    <div
                      key={report.id}
                      className="bg-[#0A0A0C]/80 backdrop-blur-3xl rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8 duration-700 group hover:border-white/10 hover:bg-[#111113] transition-all"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <div className="h-48 relative border-b border-white/5 overflow-hidden">
                         <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10 pointer-events-none"></div>
                        <Map
                          center={[report.lat, report.lng]}
                          zoom={16}
                          markers={[report]}
                          height="100%"
                          interactive={false}
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A0A0C] via-transparent to-[#0A0A0C]/40 z-10 opacity-90"></div>
                        <div className="absolute bottom-4 left-4 bg-[#050506]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 z-20">
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Rad: 500M</p>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

                        <div className="flex items-start justify-between mb-6 relative z-10">
                          <div className="flex-1">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2 leading-none group-hover:text-primary transition-colors">
                              {report.type}
                            </h3>
                            <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                              <Clock className="w-3 h-3 text-white/30" />
                              HACE {formatTime(report.created_at)}
                            </div>
                          </div>
                          {isOwnReport ? (
                            <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                              Origen Propio
                            </div>
                          ) : (
                            <div className="bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                              Objetivo Externo
                            </div>
                          )}
                        </div>

                        <p className="text-white/70 text-sm leading-relaxed mb-8 font-medium italic relative z-10 font-sans tracking-tight">"{report.description}"</p>

                        <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
                           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                 <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Coordenadas</p>
                                 <p className="text-[10px] font-mono font-bold text-white/70">{report.lat.toFixed(3)}, {report.lng.toFixed(3)}</p>
                           </div>
                           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                 <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Nivel Confianza</p>
                                 <p className="text-[10px] font-mono font-bold text-success/80">BETA NETWORK</p>
                           </div>
                        </div>

                        <button
                          onClick={() => handleVerify(report.id)}
                          disabled={verifying === report.id || !!isOwnReport}
                          className={cn(
                            "w-full font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm shadow-xl",
                            isOwnReport
                              ? "bg-white/5 text-white/10 cursor-not-allowed border border-white/5 opacity-50"
                              : "bg-success text-background hover:brightness-110 active:scale-95 shadow-success/20"
                          )}
                        >
                          {verifying === report.id ? (
                            <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                          ) : isOwnReport ? (
                            'Restringido'
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 fill-background" />
                              Validar Reporte
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

