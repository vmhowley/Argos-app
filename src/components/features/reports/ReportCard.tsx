import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, AlertCircle, MapPin, CheckCircle2 } from 'lucide-react';
import { Report } from '../../../types';
import { formatTime } from '../../../utils/dateUtils';
import { calculateDistance } from '@/utils/geoUtils';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: Report;
  userLocation?: { lat: number; lng: number } | null;
}

export function ReportCard({ report, userLocation }: ReportCardProps) {
  const navigate = useNavigate();

  const getDistance = () => {
    if (!userLocation) return null;
    const dist = calculateDistance(userLocation.lat, userLocation.lng, report.lat, report.lng);
    return dist < 1000
      ? `${Math.round(dist)}m`
      : `${(dist / 1000).toFixed(1)}km`;
  };

  const distanceLabel = getDistance();

  const getIcon = () => {
    switch (report.tipo) {
      case 'Robo': return <Shield className="w-5 h-5 text-orange-500" />;
      case 'Asalto': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Homicidio': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <MapPin className="w-5 h-5 text-primary" />;
    }
  };

  const getColor = () => {
    switch (report.tipo) {
      case 'Robo': return 'bg-orange-500/10 border-orange-500/20';
      case 'Asalto': return 'bg-red-500/10 border-red-500/20';
      case 'Homicidio': return 'bg-red-900/20 border-red-800/20';
      default: return 'bg-white/5 border-white/10';
    }
  }

  return (
    <div
      onClick={() => navigate(`/detail/${report.id}`)}
      className="w-full bg-[#1A0A0A]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-start gap-4 active:scale-[0.98] transition-all cursor-pointer group"
    >
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border border-white/5", getColor())}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-white text-base leading-tight">{report.tipo}</h4>
          <span className="text-xs text-white/40 font-mono">{formatTime(report.created_at)}</span>
        </div>
        <p className="text-sm text-white/60 truncate mt-1">{report.descripcion}</p>

        <div className="flex items-center gap-2 mt-3">
          {distanceLabel && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-md">
              <MapPin className="w-3 h-3" />
              {distanceLabel}
            </span>
          )}
          {report.verificado && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#00E0FF] bg-[#00E0FF]/10 px-2 py-1 rounded-md border border-[#00E0FF]/20">
              <CheckCircle2 className="w-3 h-3" />
              Verificado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
