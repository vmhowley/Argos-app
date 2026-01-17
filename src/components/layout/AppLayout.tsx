import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  const routesWithoutNav = ['/', '/onboarding'];
  const showNav = !routesWithoutNav.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-white font-display">
      <div className={showNav ? 'pb-20' : ''}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
