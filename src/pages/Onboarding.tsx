import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signInAnonymously } from '../services/authService';

export function Onboarding() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: 'Atenea Geo SECURE',
      subtitle: 'Sistema de Vigilancia Inteligente',
      desc: 'Únete a la nueva generación de protección comunitaria con alertas verificadas en tiempo real.'
    },
    {
      title: 'ALERTAS REALES',
      subtitle: 'Cero noticias falsas',
      desc: 'Nuestro sistema de validación comunitaria asegura que los reportes sean precisos y reales.'
    },
    {
      title: 'COMUNIDAD SEGURA',
      subtitle: 'Protege tu barrio, juntos',
      desc: 'Los vecindarios más unidos ayudan a crear un entorno más seguro para todos sus habitantes.'
    },
  ];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    }
  };

  const handleStart = async () => {
    try {
      const { error } = await signInAnonymously();
      if (error) throw error;
      navigate('/home');
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      alert('Error al iniciar como invitado. Por favor intenta registrarte.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col items-center justify-between px-8 py-12 md:py-20 relative overflow-hidden font-sans selection:bg-primary/30 text-white">

      {/* Background Visuals */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none"></div>
      
      {/* HUD Lines Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-0 w-20 h-[1px] bg-white/20"></div>
        <div className="absolute top-1/4 left-20 w-[1px] h-10 bg-white/20"></div>
        <div className="absolute bottom-1/4 right-0 w-20 h-[1px] bg-white/20"></div>
        <div className="absolute bottom-1/4 right-20 w-[1px] h-10 bg-white/20"></div>
      </div>

      {/* Logo */}
      <div className="w-full pt-10 flex justify-center relative z-20">
        <div className="w-20 h-20 bg-[#0A0A0C] border border-white/5 rounded-[2rem] flex items-center justify-center backdrop-blur-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] relative group">
           <div className="absolute inset-0 rounded-[2rem] border border-primary/20 animate-pulse"></div>
          <Shield className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="w-full max-w-sm text-center z-10 space-y-10">
        <div key={slide} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none tracking-[-0.03em]">
              {slides[slide].title.split(' ').map((word, i) => (
                <span key={i} className={i === slides[slide].title.split(' ').length - 1 ? "text-primary italic" : ""}>
                   {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-primary/60 font-black tracking-[0.3em] uppercase text-[10px] py-1 border-y border-white/5 w-fit mx-auto px-4 mt-4">
              {slides[slide].subtitle}
            </p>
          </div>
          <p className="text-white/40 text-sm leading-relaxed max-w-[90%] mx-auto font-medium">
            {slides[slide].desc}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 relative transition-all duration-500 overflow-hidden", 
                index === slide ? "w-12 bg-white/10" : "w-2 bg-white/5"
              )}
            >
               {index === slide && (
                 <div className="absolute inset-0 bg-primary shadow-[0_0_15px_rgba(255,215,0,0.8)] animate-in slide-in-from-left duration-700"></div>
               )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4 z-20 pb-10">
        {slide < slides.length - 1 ? (
          <button
            onClick={handleNext}
            className="group w-full bg-white text-[#050506] font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-2xl"
          >
            Siguiente Protocolo <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <button
              onClick={handleStart}
              className="w-full bg-primary text-[#050506] font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] active:scale-[0.98] transition-all"
            >
              Entrar como Agente Invitado
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/login')}
                className="py-4 bg-[#0A0A0C] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:bg-white/5 transition-colors"
              >
                Identificarse
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="py-4 bg-[#0A0A0C] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:bg-white/5 transition-colors"
              >
                Reclutamiento
              </button>
            </div>
            <p className="text-white/20 text-[9px] font-bold text-center pt-4 tracking-[0.1em] uppercase">
              Al continuar aceptas los Términos y Protocolos de Atenea Geo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
