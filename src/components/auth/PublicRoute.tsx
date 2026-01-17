import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ensureAuthenticated } from '../../services/authService';

export function PublicRoute() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const session = await ensureAuthenticated();
            setAuthenticated(!!session);
        } catch (error) {
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#110505] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    // If user is authenticated, redirect to home
    return authenticated ? <Navigate to="/home" replace /> : <Outlet />;
}
