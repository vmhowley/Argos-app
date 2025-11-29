import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { signInAnonymously } from '../services/authService';

export function Onboarding() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      title: 'Tu barrio, tus ojos',
      subtitle: 'Reporta anónimamente en 30 segundos',
    },
    {
      title: 'Verifica con folio policial',
      subtitle: 'Solo datos reales cuentan',
    },
    {
      title: 'Gana tu barrio',
      subtitle: 'Premios mensuales: mural, luces, cámaras',
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
    <div className="min-h-screen bg-gradient-to-br from-[#003087] to-[#0047AB] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-12">
          <Eye className="w-24 h-24 text-[#FFD700]" strokeWidth={1.5} />
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'system-ui' }}>
            {slides[slide].title}
          </h1>
          <p className="text-xl text-white/80">
            {slides[slide].subtitle}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === slide ? 'w-8 bg-[#FFD700]' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {slide < slides.length - 1 ? (
          <button
            onClick={handleNext}
            className="w-full bg-[#FFD700] text-[#003087] font-bold text-lg py-4 rounded-xl hover:bg-[#FFC700] transition-colors"
          >
            Siguiente
          </button>
        ) : (
          <div className="space-y-4 w-full">
            <button
              onClick={handleStart}
              className="w-full bg-[#FFD700] text-[#003087] font-bold text-lg py-4 rounded-xl hover:bg-[#FFC700] transition-colors"
            >
              Empezar como Invitado
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex-1 bg-white/10 backdrop-blur-sm text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/30"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="flex-1 bg-white text-[#003087] font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Registrarse
              </button>
            </div>
            <p className="text-white/60 text-xs text-center mt-2">
              Al continuar aceptas nuestros términos y condiciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
