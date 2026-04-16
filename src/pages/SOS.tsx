import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Users, ChevronLeft, ShieldAlert, Radio, CheckCircle, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SOS() {
  const [activating, setActivating] = useState(false);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [call911Timer, setCall911Timer] = useState(5);
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
      <div className="min-h-screen bg-rose-950/20 backdrop-blur-3xl flex flex-col items-center justify-between p-8 font-sans animate-in fade-in duration-700 relative overflow-hidden">
        {/* Pulsing Danger background */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-600/20 via-transparent to-rose-600/10 animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.8)]"></div>

        <div className="w-full flex flex-col items-center pt-16 relative z-10">
          <div className="w-56 h-56 rounded-full flex items-center justify-center relative mb-10">
            <div className="absolute inset-0 bg-rose-600/40 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-[-20px] border border-rose-500/30 rounded-full animate-spin-slow"></div>
            <div className="w-40 h-40 bg-[#050506] rounded-full flex flex-col items-center justify-center overflow-hidden border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.4)]">
              <ShieldAlert className="w-16 h-16 text-rose-500 animate-bounce" />
              <span className="text-[10px] font-black text-rose-500 mt-2 tracking-[0.3em] uppercase">Emergencia</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-3 text-center leading-none">
            Alerta<br/><span className="text-rose-500">Transmitida</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] text-center max-w-[240px]">
            Trazando vector de ubicación en tiempo real para unidades de respuesta.
          </p>
        </div>

        <div className="w-full space-y-4 max-w-sm relative z-10">
          <div className="bg-[#0A0A0C]/90 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex flex-col">
                 <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Enlace 911 Directo</span>
                 <span className="text-white/80 text-xs font-bold">Llamada automática en progreso</span>
              </div>
              <span className="text-rose-500 font-black text-3xl tabular-nums animate-pulse">{call911Timer}s</span>
            </div>
            <button
              onClick={handleCall911}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all active:scale-[0.98]"
            >
              <Phone className="w-5 h-5 fill-white" />
              Establecer Conexión
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStreamAudio(!streamAudio)}
              className={cn(
                "flex-1 py-5 rounded-2xl border transition-all flex flex-col items-center gap-2 group",
                streamAudio 
                  ? "bg-white text-[#050506] border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                  : "bg-white/5 text-white border-white/10 hover:bg-white/10"
              )}
            >
              <Volume2 className={cn("w-5 h-5", streamAudio && "animate-pulse")} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Audio Vivo</span>
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl border border-white/10 flex flex-col items-center gap-2 transition-all group"
            >
              <CheckCircle className="w-5 h-5 text-success group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Abortar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white flex flex-col font-sans p-6 pb-24 relative overflow-hidden selection:bg-rose-500/30">
      {/* Background Visual Components */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-out",
        activating ? "bg-rose-600/10 opacity-100" : "opacity-0"
      )}></div>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>

      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6 relative z-20 hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white/70" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="relative z-10 text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full mb-6">
             <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
             <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Protocolo Guardián</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white leading-none">
            {activating ? 'Transmisión<br/>Iniciada' : 'Atenea<br/><span className="text-primary">Guardián</span>'}
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[9px] max-w-[200px] mx-auto leading-relaxed h-8">
            {activating ? `VECTOR ACTIVO EN ${timeLeft}...` : 'Mantén presionado para SOS silencioso'}
          </p>
        </div>

        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={cn(
            "w-72 h-72 md:w-80 md:h-80 rounded-full border transition-all duration-300 relative flex flex-col items-center justify-center group touch-none",
            activating
              ? "bg-rose-600 border-white scale-105 shadow-[0_0_80px_rgba(225,29,72,0.6)]"
              : "bg-[#0A0A0C] border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] hover:border-rose-500/30"
          )}
        >
          {activating ? (
            <div className="flex flex-col items-center">
               <span className="text-7xl font-black italic text-white leading-none tabular-nums animate-in zoom-in-50 duration-300">{timeLeft}</span>
               <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mt-2">Transmitiendo</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-4 border border-white/5 rounded-full z-0 group-hover:border-rose-500/20 transition-colors duration-500"></div>
              <div className="w-24 h-24 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 flex items-center justify-center mb-4 relative z-10 transition-transform duration-500 group-hover:scale-110">
                 <ShieldAlert className="w-12 h-12 text-rose-500" />
              </div>
              <span className="font-black text-2xl uppercase tracking-tighter text-white relative z-10">SOS</span>
              <span className="text-[9px] font-black text-rose-500/60 uppercase tracking-[0.3em] mt-2 relative z-10">Pulsar para activar</span>
            </>
          )}
          
          {/* Progress ring when activating */}
          {activating && (
             <div className="absolute inset-[-10px] rounded-full border-2 border-white/10 border-t-white animate-spin-fast"></div>
          )}
        </button>
      </div>

      {/* Safety Toggles */}
      <div className="space-y-3 mt-auto relative z-20 max-w-sm mx-auto w-full">
        <ContactRow icon={Users} label="Célula de Confianza" value="5 Agentes en Alerta" active />
        <ContactRow icon={Radio} label="Protocolo Escucha" value="Enlace de Audio Streaming" active />
      </div>

    </div>
  );
}

function ContactRow({ icon: Icon, label, value, active }: any) {
  return (
    <div className="bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/5 rounded-[1.5rem] p-4 flex items-center justify-between shadow-xl group">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-primary group-hover:border-primary/20 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-black text-sm tracking-tight text-white/90 uppercase leading-none mb-1">{label}</p>
          <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">{value}</p>
        </div>
      </div>
      <div className={cn(
        "w-12 h-6 rounded-full relative transition-all duration-500 border border-white/5 shadow-inner", 
        active ? "bg-primary/20" : "bg-white/5"
      )}>
        <div className={cn(
          "absolute top-1 w-3.5 h-3.5 rounded-full shadow-lg transition-all duration-500", 
          active 
            ? "right-1 bg-primary shadow-[0_0_10px_rgba(255,215,0,0.8)]" 
            : "left-1 bg-white/20"
        )}></div>
      </div>
    </div>
  )
}
