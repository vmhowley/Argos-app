import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';
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
      title: 'DATOS VERIFICADOS',
      subtitle: 'Cero noticias falsas',
      desc: 'Nuestro sistema de verificación integrado con la policía asegura 100% de precisión.'
    },
    {
      title: 'GANA RECOMPENSAS',
      subtitle: 'Protege tu barrio, gana premios',
      desc: 'Los vecindarios más activos compiten por mejoras reales de seguridad cada mes.'
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
    <div className="min-h-screen bg-[#110505] flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden font-display">

      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Logo */}
      <div className="w-full pt-8 flex justify-center">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
          <Shield className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="w-full max-w-md text-center space-y-8 z-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
            {slides[slide].title}
          </h1>
          <p className="text-primary font-bold tracking-widest uppercase text-xs">
            {slides[slide].subtitle}
          </p>
          <p className="text-white/60 text-sm leading-relaxed max-w-[80%] mx-auto">
            {slides[slide].desc}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${index === slide ? 'w-8 bg-primary shadow-[0_0_10px_rgba(242,13,13,0.5)]' : 'w-2 bg-white/10'
                }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 z-10 pb-8">
        {slide < slides.length - 1 ? (
          <button
            onClick={handleNext}
            className="w-full bg-white text-black font-bold text-lg py-4 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Siguiente <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={handleStart}
              className="w-full bg-primary text-white font-bold text-lg py-4 rounded-full shadow-[0_0_20px_rgba(242,13,13,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Entrar como Invitado
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-white/5 backdrop-blur-md text-white font-semibold py-4 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              >
                Ingresar
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-black font-semibold py-4 rounded-full hover:bg-gray-200 transition-colors"
              >
                Crear Cuenta
              </button>
            </div>
            <p className="text-white/30 text-[10px] text-center pt-4">
              Al continuar aceptas los Términos y Privacidad de Atenea Geo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
