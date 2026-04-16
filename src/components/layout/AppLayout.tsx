import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  const routesWithoutNav = ['/', '/onboarding', '/login', '/signup'];
  const showNav = !routesWithoutNav.includes(location.pathname);

  return (
    <div className="min-h-[100dvh] bg-[#050506] text-white font-sans overflow-x-hidden selection:bg-primary/30 selection:text-white antialiased">
      <main className={cn(
        "transition-all duration-700 ease-out-expo",
        showNav ? 'pb-24 md:pb-0 md:pl-28' : ''
      )}>
        {children}
      </main>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}

