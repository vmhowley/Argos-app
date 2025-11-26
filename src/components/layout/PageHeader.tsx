import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, bgColor = 'bg-[#003087]', children }: PageHeaderProps) {
  return (
    <div className={`${bgColor} text-white px-6 py-8`}>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-white/90">{subtitle}</p>}
      {children}
    </div>
  );
}
