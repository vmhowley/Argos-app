import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, MapPin, CheckCircle2, MessageSquare, Send, Trash2, Download } from 'lucide-react';
import { Report, ReportComment } from '../types';
import jsPDF from 'jspdf';
import { Map } from '../components/common/Map';
import { supabase } from '../config/supabase';
import { formatTime } from '../utils/dateUtils';
import { getCurrentUserId } from '../services/authService';
import { getComments, postComment, deleteComment } from '../services/commentService';
import { REPORT_FIELDS } from '../services/reportService';

export function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    
    const [userId, reportData, commentsData] = await Promise.all([
      getCurrentUserId(),
      supabase.from('reports').select(REPORT_FIELDS).eq('id', id).single(),
      getComments(id)
    ]);

    setCurrentUserId(userId);
    
    if (reportData.data && !reportData.error) {
      setReport(reportData.data);
    }
    
    if (commentsData.success && commentsData.data) {
      setComments(commentsData.data);
    }
    
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !id || !currentUserId) return;

    setIsPosting(true);
    const response = await postComment(id, currentUserId, newComment);

    if (response.success) {
      setNewComment('');
      // Refresh comments
      const freshComments = await getComments(id);
      if (freshComments.success && freshComments.data) {
        setComments(freshComments.data);
      }
    } else {
      alert('Error publicando comentario: ' + response.error);
    }
    setIsPosting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const response = await deleteComment(commentId);

    if (response.success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    } else {
      alert('Error eliminando comentario: ' + response.error);
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

  if (isLoading && !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,215,0,0.3)]"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-xl font-bold mb-2">Reporte no encontrado</h2>
        <p className="text-white/40 mb-6">El reporte que buscas no existe o ha sido eliminado.</p>
        <button 
          onClick={() => navigate('/home')}
          className="bg-primary text-background font-black px-8 py-3 rounded-xl uppercase tracking-tighter"
        >
          Regresar al Mapa
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white font-sans pb-10 selection:bg-primary/30">
      {/* Header */}
      <div className="sticky top-0 bg-[#0A0A0C]/90 backdrop-blur-3xl border-b border-white/5 px-6 py-4 flex items-center gap-4 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => navigate('/home')} 
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 border border-white/5"
          aria-label="Regresar"
        >
          <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white leading-none">{report.type}</h1>
          <span className="text-[10px] text-primary/80 font-mono font-bold uppercase tracking-[0.2em]">Intel ID: #{report.id.slice(0, 6)}</span>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6 max-w-2xl mx-auto">

        {/* Main Info Card */}
        <div className="bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-24 -mt-24 transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white/30" />
              {formatTime(report.created_at)}
            </div>
            <div className="text-white/20">•</div>
            <div>{formatDate(report.created_at)}</div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(255,215,0,0.1)] relative">
               <div className="absolute inset-0 rounded-[1.2rem] border border-primary/30 animate-ping opacity-20"></div>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-black text-xl leading-none text-white">{report.confirmations || 0} <span className="text-white/50 text-base">Testigos</span></p>
              <p className="text-[9px] text-primary/60 uppercase tracking-[0.3em] mt-1 font-bold">Confirmaciones Tácticas</p>
            </div>
          </div>

          <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium mb-6 italic tracking-tight">"{report.description}"</p>

          <div className="mb-8">
            {report.is_verified ? (
              <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2.5 rounded-xl border border-success/20 text-[10px] font-black uppercase tracking-[0.2em] w-fit animate-in zoom-in duration-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <CheckCircle2 className="w-4 h-4" />
                Validado por la Red Central
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white/30 bg-[#050506]/80 px-4 py-2.5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] w-fit">
                <Clock className="w-4 h-4" />
                Validación Pendiente
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={exportCSV} 
              className="flex-1 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-white/50" /> Extraer CSV
            </button>
            <button 
              onClick={exportPDF} 
              className="flex-1 bg-primary text-[#050506] font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" /> Dossier PDF
            </button>
          </div>
        </div>

        {/* Map Location */}
        <div className="bg-[#0A0A0C]/80 border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] h-72 relative group">
          <div className="absolute inset-0 pointer-events-none z-20 border border-white/5 rounded-[2rem] group-hover:border-primary/20 transition-colors duration-500"></div>
          <div className="absolute inset-0 pointer-events-none bg-primary/5 mix-blend-overlay z-10"></div>
          
          <Map
            center={[report.lat, report.lng]}
            zoom={15}
            markers={[report]}
            height="100%"
            interactive={true}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-[#050506]/90 backdrop-blur-xl p-4 rounded-[1.5rem] flex items-center gap-4 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-30">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
               <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] leading-none mb-1">Vector de Coordenadas</p>
              <p className="text-sm text-white font-mono font-bold truncate">
                {Number(report.lat).toFixed(5)}°, {Number(report.lng).toFixed(5)}°
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-[1rem] flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight leading-none text-white">Análisis</h3>
                <p className="text-[9px] text-primary/60 font-bold uppercase tracking-[0.3em] mt-1">Chat de Operadores</p>
              </div>
            </div>
            <span className="bg-[#050506]/80 text-white/50 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black shadow-inner">
              {comments.length} Nodos
            </span>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-[#0A0A0C]/60 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 group relative">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[30px] border-l-[30px] border-t-white/5 border-l-transparent pointer-events-none rounded-tr-[1.5rem]"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[0.8rem] bg-[#111113] border border-white/10 flex items-center justify-center text-[10px] font-black text-white/70 shadow-inner">
                      {comment.user_id.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/90 leading-none mb-1">
                        Operador {comment.user_id.slice(0, 4)}
                      </p>
                      <p className="text-[9px] text-white/30 font-bold tracking-widest uppercase">
                        HACE {formatTime(comment.created_at)}
                      </p>
                    </div>
                  </div>
                  {currentUserId === comment.user_id ? (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-white/20 hover:text-rose-500 transition-colors p-2 hover:bg-rose-500/10 rounded-lg active:scale-95"
                      aria-label="Eliminar comentario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed font-medium relative z-10 tracking-tight">
                  {comment.content}
                </p>
              </div>
            ))}

            {comments.length === 0 ? (
              <div className="text-center py-12 bg-[#0A0A0C]/40 border border-dashed border-white/10 rounded-[2rem] group">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-white/5">
                  <MessageSquare className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">Canal Despejado. Inicia transmisión.</p>
              </div>
            ) : null}
          </div>

          {/* Comment Input */}
          <div className="pt-4 sticky bottom-6 z-20">
            <div className="bg-[#0A0A0C]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all focus-within:border-primary/50 focus-within:shadow-[0_20px_50px_rgba(255,215,0,0.1)]">
              {currentUserId ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Transmitir análisis..."
                    className="flex-1 bg-transparent border-none px-5 py-3 text-sm focus:outline-none focus:ring-0 text-white font-medium placeholder:text-white/20"
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={isPosting || !newComment.trim()}
                    className="w-12 h-12 rounded-[1.5rem] bg-primary flex items-center justify-center disabled:opacity-30 disabled:bg-white/10 transition-all active:scale-[0.95] shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                  >
                    {isPosting ? (
                      <div className="w-5 h-5 border-[3px] border-[#050506]/20 border-t-[#050506] rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5 text-[#050506]" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-transparent rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors active:scale-[0.98]"
                >
                  Autenticación Requerida para Transmitir
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
