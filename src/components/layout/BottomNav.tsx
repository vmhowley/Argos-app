import { useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Compass, Plus, Verified } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  if (['/', '/login', '/signup', '/onboarding'].includes(location.pathname)) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background Container - Compact height */}
      <div className="bg-[#0A0505]/95 backdrop-blur-xl border-t border-white/5 pb-safe pt-1">

        <div className="relative max-w-md mx-auto px-6 h-[60px] flex justify-between items-center">

          {/* Home */}
          <button
            onClick={() => navigate('/home')}
            className={cn("flex flex-col items-center gap-0.5 transition-colors w-10", isActive('/home') ? "text-primary" : "text-white/50")}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-wide">Mapa</span>
          </button>

          {/* Alerts */}
          <button
            onClick={() => navigate('/analytics')}
            className={cn("flex flex-col items-center gap-0.5 transition-colors w-10", isActive('/analytics') ? "text-primary" : "text-white/50")}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-wide">Alertas</span>
          </button>

          {/* Main Action: New Report - Floating above (Smaller) */}
          <div className="relative -top-5">
            <button
              onClick={() => navigate('/report')}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(242,13,13,0.4)] active:scale-95 group bg-primary border-[3px] border-[#0A0505]"
            >
              <div className="absolute inset-0 rounded-full bg-primary blur-sm opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <Plus className="w-6 h-6 text-white relative z-10" strokeWidth={3} />
            </button>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary uppercase tracking-wider whitespace-nowrap">Reportar</span>
          </div>

          {/* Verify */}
          <button
            onClick={() => navigate('/verify')}
            className={cn("flex flex-col items-center gap-0.5 transition-colors w-10", isActive('/verify') ? "text-primary" : "text-white/50")}
          >
            <Verified className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-wide">Verificar</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className={cn("flex flex-col items-center gap-0.5 transition-colors w-10", isActive('/profile') ? "text-primary" : "text-white/50")}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-wide">Perfil</span>
          </button>

        </div>
      </div>
    </div>
  );
}
