import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, MapPin, CheckCircle2, MessageSquare, Send, Trash2, Download } from 'lucide-react';
import { Report, ReportComment } from '../types';
import jsPDF from 'jspdf';
import { Map } from '../components/common/Map';
import { supabase } from '../config/supabase';
import { formatTime } from '../utils/dateUtils';
import { getCurrentUserId } from '../services/authService';

export function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReport();
      loadComments();
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    const uid = await getCurrentUserId();
    setCurrentUserId(uid);
  };

  const loadReport = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('id, user_id, type, lat, lng, description, foto_url, is_verified, confirmations, created_at')
      .eq('id', id)
      .single();

    if (data && !error) {
      setReport(data);
    }
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('report_comments')
      .select('*')
      .eq('report_id', id)
      .order('created_at', { ascending: true });

    if (data && !error) {
      setComments(data);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !id || !currentUserId) return;

    setIsPosting(true);
    const { error } = await supabase
      .from('report_comments')
      .insert({
        report_id: id,
        user_id: currentUserId,
        content: newComment.trim()
      });

    if (!error) {
      setNewComment('');
      loadComments();
    }
    setIsPosting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('report_comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      loadComments();
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const exportCSV = () => {
    if (!report) return;
    const headers = ['ID', 'type', 'Fecha', 'Ubicación (Lat, Lng)', 'Descripción', 'Verificado'];
    const row = [
      report.id,
      report.type,
      new Date(report.created_at).toLocaleDateString(),
      `"${report.lat}, ${report.lng}"`,
      `"${report.description.replace(/"/g, '""')}"`,
      report.is_verified ? 'Sí' : 'No'
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + headers.join(",") + "\n"
      + row.join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_${report.id.slice(0, 6)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.text('Detalle de Reporte Argos', 14, 15);

    doc.setFontSize(11);
    doc.text(`ID: #${report.id}`, 14, 25);
    doc.text(`Tipo: ${report.type}`, 14, 32);
    doc.text(`Fecha: ${new Date(report.created_at).toLocaleString()}`, 14, 39);
    doc.text(`Verificado: ${report.is_verified ? 'Sí' : 'No'}`, 14, 46);
    doc.text(`Ubicación: ${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}`, 14, 53);

    doc.text('Descripción:', 14, 63);
    const splitDescription = doc.splitTextToSize(report.description, 180);
    doc.text(splitDescription, 14, 70);

    doc.save(`reporte_${report.id.slice(0, 6)}.pdf`);
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
          <h1 className="text-lg font-bold leading-none">{report.type}</h1>
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

          <p className="text-white/90 text-lg leading-relaxed">{report.description}</p>

          {report.is_verified && (
            <div className="mt-4 flex items-center gap-2 text-[#00E0FF] bg-[#00E0FF]/10 px-3 py-2 rounded-lg border border-[#00E0FF]/20 text-sm font-bold uppercase tracking-wide w-fit">
              <CheckCircle2 className="w-4 h-4" />
              Reporte Confirmado
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <button onClick={exportCSV} className="flex-1 bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" /> Descargar CSV
            </button>
            <button onClick={exportPDF} className="flex-1 bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/30 transition-colors">
              <Download className="w-4 h-4" /> Descargar PDF
            </button>
          </div>
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

        {/* Comments Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Comentarios</h3>
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-white/60">
              {comments.length}
            </span>
          </div>

          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {comment.user_id.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-white/50">
                      Usuario #{comment.user_id.slice(0, 4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 italic">
                      {formatTime(comment.created_at)}
                    </span>
                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <p className="text-sm text-white/30">No hay comentarios aún. ¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          <div className="mt-6 bg-[#1A0A0A] border border-white/10 rounded-2xl p-4 sticky bottom-4 shadow-2xl">
            {currentUserId ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                />
                <button
                  onClick={handlePostComment}
                  disabled={isPosting || !newComment.trim()}
                  className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {isPosting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:bg-white/10 transition-colors"
              >
                Inicia sesión para comentar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
