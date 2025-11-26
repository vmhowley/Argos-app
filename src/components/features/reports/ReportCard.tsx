import { useNavigate } from 'react-router-dom';
import { Report } from '../../../types';
import { getMarkerColor } from '../../../utils/styleUtils';
import { formatTime } from '../../../utils/dateUtils';

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/detail/${report.id}`)}
      className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-start gap-3">
        <div
          className={`${getMarkerColor(
            report.tipo
          )} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
        >
          !
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {report.tipo}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {report.descripcion}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {formatTime(report.created_at)}
            </span>
            {report.verificado && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Verificado
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
