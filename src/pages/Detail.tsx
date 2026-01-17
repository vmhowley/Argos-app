import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { Report } from '../types';
import { Map } from '../components/common/Map';
import { supabase } from '../config/supabase';
import { formatTime } from '../utils/dateUtils';
import { cn } from '@/lib/utils';

export function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiRecreation, setAiRecreation] = useState('');
  const [selectedResponse, setSelectedResponse] = useState('');

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      setReport(data);
    }
  };

  const handleViewAI = async () => {
    setShowAI(true);
    const prompts = [
      'Two hooded figures cut a chain. Runner with headphones approaches. Knife point threat. Neighbors scream. Suspects flee on motorcycle.',
      'Group waits at dark corner. Motorcyclist surrounded at stop light. Phone snatched. Fleeing on foot.',
      'Thief forces parked vehicle door. Alarm sounds. Grabs backpack from seat and runs.',
    ];
    setAiRecreation(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-[#110505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110505] text-white font-display pb-10">
      {/* Header */}
      <div className="sticky top-0 bg-[#1A0A0A]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center gap-4 z-20">
        <button onClick={() => navigate('/home')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h1 className="text-lg font-bold leading-none">{report.tipo}</h1>
          <span className="text-xs text-white/40">Report ID: #{report.id.slice(0, 6)}</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6">

        {/* Main Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3 text-white/50 text-sm mb-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(report.created_at)}
            </div>
            <div>•</div>
            <div>{formatDate(report.created_at)}</div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">2 Witnesses Confirmed</span>
          </div>

          <p className="text-white/90 text-lg leading-relaxed">{report.descripcion}</p>

          {report.verificado && (
            <div className="mt-4 flex items-center gap-2 text-[#00E0FF] bg-[#00E0FF]/10 px-3 py-2 rounded-lg border border-[#00E0FF]/20 text-sm font-bold uppercase tracking-wide w-fit">
              <CheckCircle2 className="w-4 h-4" />
              Verified Police Folio
            </div>
          )}
        </div>

        {/* Map Location */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg h-56 relative group">
          <div className="absolute inset-0 pointer-events-none z-10 border-2 border-white/5 rounded-2xl"></div>
          <Map
            center={[report.lat, report.lng]}
            zoom={15}
            markers={[report]}
            height="100%"
            interactive={false}
          />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-xs text-white font-mono">
              {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* AI Recreation Section */}
        {!showAI && (
          <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">AI Crime Re-enactment</h3>
            </div>
            <p className="text-white/60 mb-6 text-sm relative z-10">
              Generate a realistic narrative scenario based on report metadata and witness statements.
            </p>
            <button
              onClick={handleViewAI}
              className="w-full bg-white text-purple-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors relative z-10 shadow-lg"
            >
              Generate Simulation ($0.99)
            </button>
          </div>
        )}

        {showAI && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">
                AI Simulation Disclaimer
              </p>
              <p className="text-xs text-amber-200/60">
                Generated for educational safety purposes only. Not legal evidence.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
              <p className="text-white/90 leading-relaxed italic border-l-2 border-primary pl-4">
                "{aiRecreation}"
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-white mb-4">Tactical Response Assessment</h3>
              <p className="text-sm text-white/50 mb-4">What would be the safest action?</p>
              <div className="space-y-2">
                {['Scream & Run', 'Surrender Property', 'Record Evidence', 'Call 911 Immediately'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedResponse(option)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left font-medium transition-all text-sm",
                      selectedResponse === option
                        ? "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(242,13,13,0.2)]"
                        : "border-white/5 bg-transparent text-white/60 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedResponse && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    <span className="font-bold">Community Consensus:</span> 85% agree with your choice.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
