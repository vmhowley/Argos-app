import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Plus } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { ReportCard } from '../components/features/reports/ReportCard';
import { Map } from '../components/common/Map';

export function Home() {
  const [filter, setFilter] = useState<
    'all' | 'Robo' | 'Asalto' | 'Homicidio' | 'Vandalismo'
  >('all');
  const { reports, activeReportsCount } = useReports(filter);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const navigate = useNavigate();

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      setSheetExpanded(true);
    }
    if (touchEnd - touchStart > 50) {
      setSheetExpanded(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <div
        className={`relative bg-gray-900 overflow-hidden transition-all duration-300 ${
          sheetExpanded ? 'h-[30vh]' : 'h-[60vh]'
        }`}
      >
        <Map markers={reports} height="100%" />

        <div className="absolute top-6 left-6 bg-white rounded-2xl shadow-lg p-4 min-w-[180px] z-[400]">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Live Reports
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Mobile Snatching</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">Vehicle Theft</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Mugging</span>
            </div>
          </div>
        </div>
        <div className="absolute top-6 right-6 bg-red-500 text-white rounded-full px-6 py-3 shadow-lg font-bold z-[400]">
          {activeReportsCount} Active Reports
        </div>
        
        <button
          onClick={() => navigate('/report')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full p-5 shadow-2xl hover:bg-red-600 transition-colors z-[400]"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      <div
        className={`bg-white rounded-t-3xl -mt-6 relative z-10 transition-all duration-300 ${
          sheetExpanded ? 'h-[calc(70vh-80px)]' : 'h-auto'
        } overflow-y-auto`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => setSheetExpanded(!sheetExpanded)}
          className="w-full flex flex-col items-center pt-3 pb-1 cursor-pointer"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          <p className="text-center text-gray-400 text-sm mt-2">
            {sheetExpanded ? '▼ Desliza para minimizar' : '▲ Desliza para expandir'}
          </p>
        </button>

        <div className="px-6 mb-6">
          <button className="w-full bg-red-500 text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg">
            <AlertTriangle className="w-6 h-6" />
            EMERGENCY SOS
          </button>
          <p className="text-center text-gray-400 text-sm mt-2">
            Instantly alert your emergency contacts
          </p>
        </div>

        <div className="px-6">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-[#003087] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('Robo')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === 'Robo'
                  ? 'bg-[#003087] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Robos
            </button>
            <button
              onClick={() => setFilter('Asalto')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === 'Asalto'
                  ? 'bg-[#003087] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Asaltos
            </button>
            <button
              onClick={() => setFilter('Homicidio')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === 'Homicidio'
                  ? 'bg-[#003087] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Homicidios
            </button>
          </div>

          <div className="space-y-3 pb-6">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
