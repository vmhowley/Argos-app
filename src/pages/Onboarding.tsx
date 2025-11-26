import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

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

  const handleStart = () => {
    const anonimoId = `Anónimo #${Math.floor(Math.random() * 9999)}`;
    localStorage.setItem('argos_user_id', anonimoId);
    navigate('/home');
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
          <button
            onClick={handleStart}
            className="w-full bg-[#FFD700] text-[#003087] font-bold text-lg py-4 rounded-xl hover:bg-[#FFC700] transition-colors"
          >
            Empezar
          </button>
        )}
      </div>
    </div>
  );
}
