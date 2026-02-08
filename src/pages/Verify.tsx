import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MapPin, Clock, User } from 'lucide-react';
import { Report } from '../types';
import { getUnverifiedReports, verifyReport } from '../services/reportService';
import { getUserProfile } from '../services/authService';
import { Map } from '../components/common/Map';
import { formatTime } from '../utils/dateUtils';
import { getUserLocation, calculateDistance } from '../utils/geoUtils';

export function Verify() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnverifiedReports();
  }, []);

  const loadUnverifiedReports = async () => {
    setLoading(true);

    try {
      // Get user profile to check for admin role
      const userProfile = await getUserProfile();
      const isAdmin = userProfile?.role === 'admin';
      setCurrentUserId(userProfile?.id || null);
      console.log(userProfile);
      // Fetch all unverified reports
      const allReports = await getUnverifiedReports();

      if (isAdmin) {
        // Admins see all reports
        setReports(allReports);
        // Try to get location just for the "nearby" message, but don't fail if we can't
        try {
          const location = await getUserLocation();
          setUserLocation(location);
        } catch (e) {
          console.log('Admin location not available, ignoring');
        }
        setLocationError(false);
      } else {
        // Regular users: Get location and filter by 5km radius
        const location = await getUserLocation();
        setUserLocation(location);

        const nearbyReports = allReports.filter(report => {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            report.lat,
            report.lng
          );
          return distance <= 5000; // 5km in meters
        });

        setReports(nearbyReports);
        setLocationError(false);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setLocationError(true);
      // Still load all reports if location fails (fallback behavior)
      const allReports = await getUnverifiedReports();
      setReports(allReports);
    }

    setLoading(false);
  };

  const handleVerify = async (reportId: string) => {
    setVerifying(reportId);

    try {
      // Get user profile to check for admin role and user ID
      const userProfile = await getUserProfile();
      const isAdmin = userProfile?.role === 'admin';
      const currentUserId = userProfile?.id;

      // Find the report to check ownership and location
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        alert('Reporte no encontrado.');
        setVerifying(null);
        return;
      }

      // Check if user is trying to verify their own report
      if (currentUserId && report.user_id === currentUserId) {
        alert('No puedes verificar tu propio reporte.');
        setVerifying(null);
        return;
      }

      if (!isAdmin) {
        // Get user's current location
        const userLocation = await getUserLocation();

        // Calculate distance between user and incident
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          report.lat,
          report.lng
        );

        // Check if user is within 300 meters
        if (distance > 300) {
          alert(
            `Debes estar a menos de 300 metros del incidente para verificarlo.\n\n` +
            `Distancia actual: ${Math.round(distance)} metros`
          );
          setVerifying(null);
          return;
        }
      }

      // Proceed with verification
      const success = await verifyReport(reportId);

      if (success) {
        // Remove the verified report from the list
        setReports(reports.filter(r => r.id !== reportId));
        if (isAdmin) {
          alert('Reporte verificado exitosamente (Modo Admin).');
        }
      } else {
        alert('Error al verificar el reporte. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      // Only show location error if not admin (admins might not even need location enabled)
      // But since we try to get location only if !isAdmin, this catch block handles both cases.
      // If getUserProfile fails, it might throw, or if getUserLocation fails.

      // Let's refine the error message
      alert(
        'Ocurrió un error. Asegúrate de tener acceso a internet y ubicación habilitada (si no eres admin).'
      );
    }

    setVerifying(null);
  };

  return (
    <div className="min-h-screen bg-black text-white font-display">
      {/* Header */}
      <div className="pt-8 pb-6 px-6 bg-gradient-to-b from-primary/20 to-transparent">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Verificar Reportes</h1>
        <p className="text-white/60 text-sm font-medium">
          Ayuda a la comunidad validando alertas cercanas
        </p>
      </div>

      <div className="px-6 pb-20">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Cargando reportes...</p>
          </div>
        ) : (
          <>
            {locationError && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex gap-3">
                <div className="w-1 bg-yellow-500 rounded-full"></div>
                <p className="text-xs text-yellow-200/80 font-medium">
                  ⚠️ No se pudo obtener ubicación. Mostrando todos los reportes.
                </p>
              </div>
            )}

            {!locationError && userLocation && (
              <div className="mb-6 flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-white/60 font-bold uppercase tracking-wide">
                  Mostrando {reports.length} reportes cercanos
                </p>
              </div>
            )}

            {reports.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 opacity-80" />
                <h2 className="text-xl font-bold uppercase tracking-tight mb-2">
                  {locationError ? '¡Todo verificado!' : '¡Zona Segura!'}
                </h2>
                <p className="text-sm text-white/60">
                  {locationError
                    ? 'No hay reportes pendientes de verificación'
                    : 'No hay reportes sin verificar cerca de tu ubicación'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => {
                  const isOwnReport = currentUserId && report.user_id === currentUserId;

                  return (
                    <div
                      key={report.id}
                      className="bg-[#1A0A0A] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                    >
                      <div className="h-48 relative border-b border-white/5">
                        <Map
                          center={[report.lat, report.lng]}
                          zoom={15}
                          markers={[report]}
                          height="100%"
                          interactive={false}
                          theme="dark"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#1A0A0A] to-transparent opacity-50"></div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1">
                              {report.tipo}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {formatTime(report.created_at)}
                            </div>
                          </div>
                          {isOwnReport ? (
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-500/30">
                              Tu Reporte
                            </span>
                          ) : (
                            <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">
                              Sin Verificar
                            </span>
                          )}
                        </div>

                        <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">{report.descripcion}</p>

                        <div className="flex items-center gap-2 text-xs text-white/40 mb-6 bg-white/5 p-3 rounded-xl">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-mono">
                            {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                          </span>
                        </div>

                        {report.folio && (
                          <div className="mb-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                              Folio policial: {report.folio}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => handleVerify(report.id)}
                          disabled={verifying === report.id || !!isOwnReport}
                          className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm ${isOwnReport
                              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                              : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]'
                            }`}
                        >
                          {verifying === report.id ? (
                            'Verificando...'
                          ) : isOwnReport ? (
                            'No puedes verificar lo tuyo'
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
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

