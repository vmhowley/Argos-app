import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAnonymousUser } from '../../services/authService';

export function PrivateRoute() {
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const anonymous = await isAnonymousUser();
    setIsAnonymous(anonymous);
  };

  if (isAnonymous === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Verificando sesión...</p>
      </div>
    );
  }

  if (isAnonymous) {
    // Redirect to login, saving the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
