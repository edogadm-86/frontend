import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'gradient' | 'stat';
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  onClick, 
  variant = 'default',
  hover = true,
  glow = false
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300';
  
  const variants = {
    default: 'bg-white/80 backdrop-blur-sm border-white/20 shadow-lg',
    glass: 'bg-white/10 backdrop-blur-md border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-white/30 shadow-lg',
    stat: 'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-white/30 shadow-lg',
  };

  const hoverEffects = hover ? 'hover:shadow-2xl hover:-translate-y-1 hover:bg-white/90' : '';
  const clickableEffects = onClick ? 'cursor-pointer' : '';
  const glowEffects = glow ? 'glow-effect' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        hoverEffects,
        clickableEffects,
        glowEffects,
        'p-6',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};