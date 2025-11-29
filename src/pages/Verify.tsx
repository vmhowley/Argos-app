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
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#003087] text-white px-6 py-6">
        <button onClick={() => navigate('/home')} className="mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">Verificar Reportes</h1>
        <p className="text-white/80 mt-2">
          Ayuda a la comunidad verificando reportes
        </p>
      </div>

      <div className="px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando reportes cercanos...</p>
          </div>
        ) : (
          <>
            {locationError && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  ⚠️ No se pudo obtener tu ubicación. Mostrando todos los reportes.
                </p>
              </div>
            )}
            
            {!locationError && userLocation && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  📍 Mostrando {reports.length === 0 ? 'reportes' : 'todos los reportes pendientes'}
                </p>
              </div>
            )}
            
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {locationError ? '¡Todo verificado!' : '¡No hay reportes cercanos!'}
                </h2>
                <p className="text-gray-600">
                  {locationError 
                    ? 'No hay reportes pendientes de verificación'
                    : 'No hay reportes sin verificar cerca de tu ubicación'}
                </p>
              </div>
            ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              {reports.length} reporte{reports.length !== 1 ? 's' : ''} pendiente{reports.length !== 1 ? 's' : ''}
            </p>
            
            {reports.map((report) => {
              const isOwnReport = currentUserId && report.user_id === currentUserId;
              
              return (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <div className="h-48">
                  <Map
                    center={[report.lat, report.lng]}
                    zoom={15}
                    markers={[report]}
                    height="100%"
                    interactive={false}
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {report.tipo}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(report.created_at)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Sin verificar
                      </span>
                      {isOwnReport && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <User className="w-3 h-3" /> Tu reporte
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{report.descripcion}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </span>
                  </div>

                  {report.folio && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900">
                        Folio policial: {report.folio}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleVerify(report.id)}
                    disabled={verifying === report.id || !!isOwnReport}
                    className={`w-full font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                      isOwnReport
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
                    }`}
                  >
                    {verifying === report.id ? (
                      'Verificando...'
                    ) : isOwnReport ? (
                      <>
                        <User className="w-5 h-5" />
                        No puedes verificar tu propio reporte
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Verificar Reporte
                      </>
                    )}
                  </button>
                </div>
              </div>
            )})}
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

