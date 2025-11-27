import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Bell, Shield } from 'lucide-react';
import { UserProfile } from '../types';
import { PageHeader } from '../components/layout';
import { Card } from '../components/ui';
import { getUserProfile, signOut } from '../services/authService';

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const userProfile = await getUserProfile();
    
    if (userProfile) {
      setProfile(userProfile);
    } else {
      // If no profile found (e.g. anonymous user without profile record yet), 
      // we could redirect to login or show limited view
      // For now, let's redirect to login if we can't get a profile
      // navigate('/login');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
            <h2 className="text-xl font-bold text-gray-900">{profile.anonimo_id}</h2>
            <p className="text-gray-500 text-sm mt-1">Barrio: {profile.barrio || 'No especificado'}</p>
            {profile.role === 'admin' && (
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full mt-2">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-[#003087]">{profile.reportes_total || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Reportes</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{profile.reportes_verificados || 0}</p>
              <p className="text-sm text-gray-600 mt-1">Verificados</p>
            </div>
          </div>
        </Card>

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
      </div>
    </>
  );
}
