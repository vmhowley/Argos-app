import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { signUp } from '../services/authService';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered') || error.message.includes('unique constraint')) {
        setError('Email already exists. Please login.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden font-sans selection:bg-primary/30 text-white">
      {/* Background Visuals */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="w-20 h-20 bg-[#0A0A0C] border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <Shield className="w-10 h-10 text-primary relative z-10" />
        </div>
        <h2 className="text-center text-4xl font-black uppercase tracking-tighter text-white leading-none">
          Registro de<br/><span className="text-primary italic">Operador</span>
        </h2>
        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Crea tu identidad táctica verificada
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <form className="space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4 group-focus-within:text-primary transition-colors">
              Frecuencia de Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-[1.5rem] border border-white/5 bg-[#0A0A0C] py-5 pl-14 pr-6 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-[#111113] transition-all font-medium shadow-2xl"
                placeholder="agente@atenea.geo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4 group-focus-within:text-primary transition-colors">
              Clave de Enlace Secundario
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-[1.5rem] border border-white/5 bg-[#0A0A0C] py-5 pl-14 pr-6 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-[#111113] transition-all font-medium shadow-2xl"
                placeholder="Símbolos y Números..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/20 ml-4 group-focus-within:text-primary transition-colors">
              Confirmar Sincronización
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-[1.5rem] border border-white/5 bg-[#0A0A0C] py-5 pl-14 pr-6 text-white placeholder:text-white/10 focus:outline-none focus:border-primary/40 focus:bg-[#111113] transition-all font-medium shadow-2xl"
                placeholder="Repetir clave..."
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-5 flex items-center gap-4 animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-tight leading-tight">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full justify-center items-center gap-3 rounded-[1.5rem] bg-white py-5 text-xs font-black uppercase tracking-[0.2em] text-[#050506] shadow-2xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <div className="w-5 h-5 border-[3px] border-[#050506]/20 border-t-[#050506] rounded-full animate-spin"></div>
              ) : (
                <>
                  Confirmar Reclutamiento
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.25em] text-white/20">
          ¿Ya eres explorador?{' '}
          <Link
            to="/login"
            className="text-primary/60 hover:text-primary transition-colors ml-1"
          >
            Identificarse aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

