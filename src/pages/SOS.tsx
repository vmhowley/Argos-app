import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle, Users, ChevronLeft, ShieldAlert } from 'lucide-react';
import { startSOS, stopSOS } from '../services/sosService';
import { cn } from '@/lib/utils';

export function SOS() {
  const [activating, setActivating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activating && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      // SOS Triggered logic here 
    }
    return () => clearInterval(interval);
  }, [activating, timeLeft]);

  const handlePressStart = () => {
    setActivating(true);
    setTimeLeft(3);
  };

  const handlePressEnd = () => {
    if (timeLeft > 0) {
      setActivating(false);
      setTimeLeft(3);
    }
  };

  return (
    <div className="min-h-screen bg-[#110505] text-white flex flex-col font-display p-6 pb-32">

      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {activating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-primary/20 rounded-full animate-ping"></div>
            <div className="w-48 h-48 bg-primary/30 rounded-full animate-ping delay-75 absolute"></div>
          </div>
        )}

        <div className="relative z-10 text-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            {activating ? 'ARMADO' : 'SOS EMERGENCIA'}
          </h1>
          <p className="text-white/60 text-sm max-w-[200px] mx-auto">
            {activating ? `Enviando alertas en ${timeLeft}...` : 'Mantén presionado 3 seg para alarma silenciosa'}
          </p>
        </div>

        <button
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={cn(
            "w-64 h-64 rounded-full border-[8px] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(242,13,13,0.3)] transition-all active:scale-95",
            activating
              ? "bg-primary border-white scale-110 shadow-[0_0_80px_rgba(242,13,13,0.8)]"
              : "bg-[#1A0A0A] border-[#2A1515] hover:border-primary/50"
          )}
        >
          <ShieldAlert className={cn("w-24 h-24 mb-2 transition-colors", activating ? "text-white" : "text-primary")} />
          <span className={cn("font-bold text-2xl uppercase tracking-widest", activating ? "text-white" : "text-primary")}>
            {activating ? timeLeft : "MANTENER"}
          </span>
        </button>
      </div>

      {/* Safety Toggles */}
      <div className="space-y-3 mt-auto">
        <ContactRow icon={Users} label="Notificar Contactos" value="3 Activos" active />
        <ContactRow icon={Phone} label="Llamar 911" value="Habilitado" active={false} />
      </div>

    </div>
  );
}

function ContactRow({ icon: Icon, label, value, active }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm">{label}</p>
          <p className="text-xs text-white/40">{value}</p>
        </div>
      </div>
      <div className={cn("w-12 h-6 rounded-full relative", active ? "bg-green-500" : "bg-white/10")}>
        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", active ? "right-1" : "left-1")}></div>
      </div>
    </div>
  )
}
