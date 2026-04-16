import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ensureAuthenticated, isAnonymousUser } from '../../services/authService';

export function PublicRoute() {
    const [loading, setLoading] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const session = await ensureAuthenticated();
            if (session) {
                const isAnon = await isAnonymousUser();
                // If they are logged in and NOT anonymous, redirect to home
                setShouldRedirect(!isAnon);
            } else {
                setShouldRedirect(false);
            }
        } catch (error) {
            setShouldRedirect(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#110505] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    // If registered user is authenticated, redirect to home
    return shouldRedirect ? <Navigate to="/home" replace /> : <Outlet />;
}
