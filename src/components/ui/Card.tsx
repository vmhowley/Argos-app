import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  gradientColors?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', gradient = false, gradientColors = 'from-amber-400 to-orange-500', onClick }: CardProps) {
  const baseStyles = 'rounded-xl p-6 shadow-sm';
  const bgStyles = gradient
    ? `bg-gradient-to-r ${gradientColors} text-white shadow-lg`
    : 'bg-white';

  return (
    <div 
      className={`${baseStyles} ${bgStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
