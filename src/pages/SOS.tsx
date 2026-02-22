import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Users, ChevronLeft, ShieldAlert, Radio, CheckCircle, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SOS() {
  const [activating, setActivating] = useState(false);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [call911Timer, setCall911Timer] = useState(30);
  const [streamAudio, setStreamAudio] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activating && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !active) {
      setActive(true);
      setActivating(false);
    }
    return () => clearInterval(interval);
  }, [activating, timeLeft, active]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (active && call911Timer > 0) {
      interval = setInterval(() => setCall911Timer(t => t - 1), 1000);
    } else if (call911Timer === 0 && active) {
      handleCall911();
    }
    return () => clearInterval(interval);
  }, [active, call911Timer]);

  const handlePressStart = () => {
    if (active) return;
    setActivating(true);
    setTimeLeft(3);
  };

  const handlePressEnd = () => {
    if (timeLeft > 0 && !active) {
      setActivating(false);
      setTimeLeft(3);
    }
  };

  const handleCall911 = () => {
    window.location.href = 'tel:911';
  };

  const handleFinish = () => {
    setActive(false);
    navigate('/home');
  };

  if (active) {
    return (
      <div className="min-h-screen bg-error flex flex-col items-center justify-between p-8 font-display animate-in fade-in duration-500">
        <div className="w-full flex flex-col items-center pt-10">
          <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center relative mb-8">
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center overflow-hidden border-4 border-white/50">
              {/* Animated Owl Placeholder */}
              <div className="text-4xl animate-bounce">🦉</div>
              <span className="text-[10px] font-black text-error mt-1 tracking-tighter">CENTINELA</span>
            </div>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2 text-center">
            ALERTA ENVIADA
          </h1>
          <p className="text-white/80 font-bold uppercase tracking-widest text-xs text-center">
            Ubicación compartida en tiempo real
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Llamada 911 automática</span>
              <span className="text-white font-black text-2xl animate-pulse">{call911Timer}s</span>
            </div>
            <button
              onClick={handleCall911}
              className="w-full bg-white text-error font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase shadow-lg"
            >
              <Phone className="w-6 h-6" />
              Llamar ahora
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStreamAudio(!streamAudio)}
              className={cn(
                "flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                streamAudio ? "bg-white text-error border-white" : "bg-transparent text-white border-white/20"
              )}
            >
              <Volume2 className={cn("w-6 h-6", streamAudio && "animate-pulse")} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Audio Live</span>
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 bg-white/20 text-white p-4 rounded-2xl border-2 border-white/20 flex flex-col items-center gap-2 hover:bg-white/30"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Todo bien</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col font-display p-6 pb-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500",
        activating ? "bg-error/20 opacity-100" : "opacity-0"
      )}></div>

      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {activating && (
          <div className="absolute inset-x-0 top-0 flex flex-col items-center">
            <div className="text-6xl animate-bounce mb-4 opacity-40">🦉</div>
            <div className="bg-error px-4 py-1 rounded-full font-black text-[10px] tracking-tighter mb-4 animate-pulse">GUARDUÁN ACTIVADO</div>
          </div>
        )}

        <div className="relative z-10 text-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-primary shadow-primary/20 drop-shadow-lg">
            {activating ? 'ARMANDO ALERTA' : 'Atenea Guardián'}
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] max-w-[200px] mx-auto leading-relaxed">
            {activating ? `Iniciando protocolo en ${timeLeft}...` : 'Mantén presionado para enviar alerta silenciosa'}
          </p>
        </div>

        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={cn(
            "w-72 h-72 rounded-full border-[10px] flex flex-col items-center justify-center transition-all active:scale-90 relative",
            activating
              ? "bg-error border-white scale-110 shadow-[0_0_100px_rgba(255,59,48,0.8)]"
              : "bg-white/5 border-white/10 hover:border-error/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          )}
        >
          {activating ? (
            <span className="text-6xl font-black italic text-white">{timeLeft}</span>
          ) : (
            <>
              <div className="absolute -top-4 bg-error text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg border-2 border-white/20">SILENCIOSO</div>
              <ShieldAlert className="w-24 h-24 mb-2 text-error animate-pulse" />
              <span className="font-black text-2xl uppercase tracking-tighter text-error">EMERGENCIA</span>
            </>
          )}
        </button>
      </div>

      {/* Safety Toggles */}
      <div className="space-y-3 mt-auto relative z-10">
        <ContactRow icon={Users} label="Contactos de Confianza" value="5 Notificados vía SMS" active />
        <ContactRow icon={Radio} label="Protocolo Escucha" value="Audio en vivo (Streaming)" active />
      </div>

    </div>
  );
}

function ContactRow({ icon: Icon, label, value, active }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight">{label}</p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{value}</p>
        </div>
      </div>
      <div className={cn("w-12 h-6 rounded-full relative transition-colors", active ? "bg-success shadow-[0_0_10px_rgba(76,175,80,0.5)]" : "bg-white/10")}>
        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all", active ? "right-1" : "left-1")}></div>
      </div>
    </div>
  )
}
