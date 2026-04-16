import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ensureAuthenticated, signInAnonymously } from '../../services/authService';

export function PrivateRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await ensureAuthenticated();
    
    if (session) {
      // Allow access if they have ANY session (guest or registered)
      setIsAuthenticated(true);
    } else {
      // FRICTIONLESS REPORTING: Auto-login as guest if no session exists!
      try {
        const { error } = await signInAnonymously();
        if (!error) {
           setIsAuthenticated(true);
        } else {
           setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-b-2 border-primary animate-spin shadow-2xl shadow-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, saving the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
