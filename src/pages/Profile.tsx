import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Bell, Shield, Edit2, Check, X, FileText, CheckCircle } from 'lucide-react';
import { UserProfile, Report } from '../types';
import { PageHeader } from '../components/layout';
import { Card } from '../components/ui';
import { getUserProfile, signOut, updateUsername } from '../services/authService';
import { getUserReports, getUserVerifiedReports } from '../services/reportService';

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [verifiedReports, setVerifiedReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'reports' | 'verified'>('info');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const userProfile = await getUserProfile();
    
    if (userProfile) {
      setProfile(userProfile);
      setNewUsername(userProfile.anonimo_id);
      loadUserReports(userProfile.id);
    }
    setLoading(false);
  };

  const loadUserReports = async (userId: string) => {
    setLoadingReports(true);
    const [reports, verified] = await Promise.all([
      getUserReports(userId),
      getUserVerifiedReports(userId)
    ]);
    setUserReports(reports);
    setVerifiedReports(verified);
    setLoadingReports(false);
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameError('El nombre de usuario no puede estar vacío');
      return;
    }

    if (newUsername.length < 3) {
      setUsernameError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    const { data, error } = await updateUsername(newUsername);
    
    if (error) {
      setUsernameError(typeof error === 'string' ? error : error.message || 'Error al actualizar el nombre');
    } else {
      setProfile(data);
      setEditingUsername(false);
      setUsernameError(null);
    }
  };

  const handleCancelEdit = () => {
    setNewUsername(profile?.anonimo_id || '');
    setEditingUsername(false);
    setUsernameError(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getReportIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'Robo': '🏃',
      'Asalto': '⚠️',
      'Homicidio': '🚨',
      'Vandalismo': '🔨'
    };
    return icons[tipo] || '📍';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Mi Perfil" />

      <div className="px-6 py-8 space-y-6">
        {!profile ? (
           <Card>
             <div className="text-center py-6">
               <p className="text-gray-600 mb-4">Inicia sesión para ver tu perfil completo</p>
               <button 
                 onClick={() => navigate('/login')}
                 className="bg-[#003087] text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors"
               >
                 Iniciar Sesión
               </button>
             </div>
           </Card>
        ) : (
          <>
        <Card>
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#003087] to-[#0047AB] rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
              {profile.anonimo_id.charAt(0).toUpperCase()}
            </div>
            
            {/* Editable Username */}
            {editingUsername ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="text-xl font-bold text-gray-900 border-2 border-[#003087] rounded-lg px-3 py-1 text-center max-w-xs"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateUsername}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {usernameError && (
                  <p className="text-red-500 text-sm">{usernameError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{profile.anonimo_id}</h2>
                <button
                  onClick={() => setEditingUsername(true)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            
            <p className="text-gray-500 text-sm mt-1">Barrio: {profile.barrio || 'No especificado'}</p>
            {profile.role === 'admin' && (
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full mt-2">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          {/* <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#003087]">{profile.reportes_total || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Reportes</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{profile.reportes_verificados || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Verificados</p>
            </div>
          </div> */}
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-[#003087] border-b-2 border-[#003087]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'reports'
                ? 'text-[#003087] border-b-2 border-[#003087]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mis Reportes ({userReports.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'verified'
                ? 'text-[#003087] border-b-2 border-[#003087]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Verificados ({verifiedReports.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <>
            <Card gradient gradientColors="from-amber-400 to-orange-500">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-6 h-6" />
                <h3 className="text-xl font-bold">Premium</h3>
              </div>

              {profile.premium ? (
                <div className="space-y-3">
                  <p className="text-white/90">✓ Suscripción activa</p>
                  <div className="bg-white/20 rounded-lg p-3 text-sm">
                    <p>Recreaciones usadas: {profile.recreaciones_usadas}/5</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/90">Accede a funciones premium:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      5 recreaciones IA/mes
                    </li>
                    <li className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Alertas personalizadas
                    </li>
                    <li className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Resúmenes por zona
                    </li>
                  </ul>
                  <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors mt-4">
                    Suscribirse por US$2/mes
                  </button>
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Configuración</h3>
              <div className="space-y-3">
                <button className="w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                  Cambiar barrio
                </button>
                <button className="w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                  Notificaciones
                </button>
                <button className="w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
                  Privacidad
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors text-red-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {loadingReports ? (
              <Card>
                <p className="text-center text-gray-500 py-4">Cargando reportes...</p>
              </Card>
            ) : userReports.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No has creado ningún reporte aún</p>
                  <button
                    onClick={() => navigate('/report')}
                    className="mt-4 bg-[#003087] text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Crear Reporte
                  </button>
                </div>
              </Card>
            ) : (
              userReports.map((report) => (
                <Card key={report.id}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getReportIcon(report.tipo)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{report.tipo}</h3>
                          <p className="text-sm text-gray-500 mt-1">{formatDate(report.created_at)}</p>
                        </div>
                        {report.verificado ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2 text-sm line-clamp-2">{report.descripcion}</p>
                      <button
                        onClick={() => navigate(`/detail/${report.id}`)}
                        className="text-[#003087] text-sm font-medium mt-2 hover:underline"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'verified' && (
          <div className="space-y-4">
            {loadingReports ? (
              <Card>
                <p className="text-center text-gray-500 py-4">Cargando reportes...</p>
              </Card>
            ) : verifiedReports.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tienes reportes verificados aún</p>
                </div>
              </Card>
            ) : (
              verifiedReports.map((report) => (
                <Card key={report.id}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getReportIcon(report.tipo)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{report.tipo}</h3>
                          <p className="text-sm text-gray-500 mt-1">{formatDate(report.created_at)}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Verificado
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2 text-sm line-clamp-2">{report.descripcion}</p>
                      <button
                        onClick={() => navigate(`/detail/${report.id}`)}
                        className="text-[#003087] text-sm font-medium mt-2 hover:underline"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
        </>
        )}
      </div>
    </>
  );
}

