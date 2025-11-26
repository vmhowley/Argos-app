import { useNavigate, useLocation } from 'react-router-dom';
import { Home, AlertTriangle, BarChart3, CheckCircle, User } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/home') ? 'text-[#003087]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          onClick={() => navigate('/verify')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/verify') ? 'text-[#003087]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-xs font-medium">Verificar</span>
        </button>
        <button
          onClick={() => navigate('/analytics')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/analytics') ? 'text-[#003087]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Analytics</span>
        </button>
        <button
          onClick={() => navigate('/sos')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/sos') ? 'text-[#003087]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-xs font-medium">SOS</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 ${
            isActive('/profile') ? 'text-[#003087]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  );
}
