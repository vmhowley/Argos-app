import { useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Compass, Plus, Verified } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  if (['/', '/login', '/signup', '/onboarding'].includes(location.pathname)) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed z-[999] bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-28 md:h-screen bg-[#0A0A0C] border-t border-white/5 md:border-t-0 md:border-r transition-all duration-700 font-sans shadow-[0_-20px_80px_rgba(0,0,0,1)]">
      {/* Background Container */}
      <div className="h-full pb-safe flex flex-col relative">
        
        {/* Animated Accent Line (Mobile) */}
        <div className="md:hidden absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>
        
        {/* HUD Decoration Lines (Desktop) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 right-0 w-4 h-[1px] bg-primary/40"></div>
          <div className="absolute bottom-1/4 right-0 w-4 h-[1px] bg-primary/40"></div>
        </div>

        {/* Mobile: Horizontal, Desktop: Vertical */}
        <div className="relative w-full mx-auto px-2 md:px-0 h-[72px] md:h-full flex flex-row md:flex-col justify-between items-center md:py-12">

          {/* Home */}
          <button
            onClick={() => navigate('/home')}
            className={cn(
              "flex flex-col items-center justify-center gap-2 transition-all w-16 md:w-full group relative", 
              isActive('/home') ? "text-primary" : "text-white/40 hover:text-white/70"
            )}
            aria-label="Mapa"
          >
            {isActive('/home') && (
              <div className="absolute -top-1 md:top-auto md:-left-1 w-10 h-[3px] md:w-[3px] md:h-10 bg-primary shadow-[0_0_15px_rgba(255,215,0,0.9)] rounded-full animate-in fade-in zoom-in duration-500"></div>
            )}
            <Compass className={cn("w-6 h-6 md:w-8 md:h-8 transition-all group-hover:scale-110", isActive('/home') && "drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]")} />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">Mapa</span>
          </button>

          {/* Intel */}
          <button
            onClick={() => navigate('/analytics')}
            className={cn(
              "flex flex-col items-center justify-center gap-2 transition-all w-16 md:w-full group relative", 
              isActive('/analytics') ? "text-blue-500" : "text-white/40 hover:text-white/70"
            )}
            aria-label="Intel"
          >
            {isActive('/analytics') && (
              <div className="absolute -top-1 md:top-auto md:-left-1 w-10 h-[3px] md:w-[3px] md:h-10 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.9)] rounded-full animate-in fade-in zoom-in duration-500"></div>
            )}
            <Shield className="w-6 h-6 md:w-8 md:h-8 transition-all group-hover:scale-110" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">Intel</span>
          </button>

          {/* Main Action: New Report */}
          <div className="relative -top-10 md:top-0 md:my-auto shrink-0 animate-in zoom-in duration-700">
            <button
              onClick={() => navigate('/report')}
              className="w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] flex items-center justify-center transition-all duration-500 shadow-[0_0_50px_rgba(255,0,0,0.3)] active:scale-90 group bg-error border-2 border-white/10 hover:border-white/20 hover:shadow-[0_0_60px_rgba(255,0,0,0.5)]"
              aria-label="Reportar"
            >
              <div className="absolute inset-0 rounded-[1.75rem] bg-error blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
              <Plus className="w-9 h-9 md:w-11 md:h-11 text-white relative z-10 group-hover:rotate-90 transition-transform duration-700" strokeWidth={3} />
            </button>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1">
               <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] whitespace-nowrap">Reportar</span>
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
            </div>
          </div>

          {/* Verify */}
          <button
            onClick={() => navigate('/verify')}
            className={cn(
              "flex flex-col items-center justify-center gap-2 transition-all w-16 md:w-full group relative", 
              isActive('/verify') ? "text-success" : "text-white/40 hover:text-white/70"
            )}
            aria-label="Validar"
          >
            {isActive('/verify') && (
              <div className="absolute -top-1 md:top-auto md:-left-1 w-10 h-[3px] md:w-[3px] md:h-10 bg-success shadow-[0_0_15px_rgba(34,197,94,0.9)] rounded-full animate-in fade-in zoom-in duration-500"></div>
            )}
            <Verified className="w-6 h-6 md:w-8 md:h-8 transition-all group-hover:scale-110" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">Validar</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "flex flex-col items-center justify-center gap-2 transition-all w-16 md:w-full group relative", 
              isActive('/profile') ? "text-white" : "text-white/40 hover:text-white/70"
            )}
            aria-label="Perfil"
          >
            {isActive('/profile') && (
              <div className="absolute -top-1 md:top-auto md:-left-1 w-10 h-[3px] md:w-[3px] md:h-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] rounded-full animate-in fade-in zoom-in duration-500"></div>
            )}
            <User className="w-6 h-6 md:w-8 md:h-8 transition-all group-hover:scale-110" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">Sede</span>
          </button>


        </div>
      </div>
    </div>
  );
}

