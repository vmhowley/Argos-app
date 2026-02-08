import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { signIn } from '../services/authService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#110505] flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden font-display">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm z-10">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-md">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-black italic uppercase tracking-tighter text-white">
          Bienvenido
        </h2>
        <p className="mt-2 text-center text-sm text-white/50">
          Ingresa para ver reportes seguros
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm z-10">
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/30" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm sm:leading-6 transition-all"
                placeholder="agente@Atenea Geo.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40">
                Contraseña
              </label>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-red-400 transition-colors">
                  ¿Olvidaste tu clave?
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/30" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm sm:leading-6 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-primary px-3 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(242,13,13,0.4)] hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Autenticando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-white/40">
          ¿No tienes cuenta?{' '}
          <Link
            to="/signup"
            className="font-bold text-white hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            Crear Acceso <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    </div>
  );
}
